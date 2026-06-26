import os, re, uuid, time, requests, html as ihtml
from dotenv import load_dotenv
load_dotenv()
from pymongo import MongoClient
from datetime import datetime, timezone

H = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
BASE = 'https://www.remax-czech.cz/reality/nemovitosti-kancelare/29183/re-max-active-broker/'
STORAGE_URL = 'https://integrations.emergentagent.com/objstore/api/v1/storage'
APP = 'remax-active-broker'

cli = MongoClient(os.environ['MONGO_URL'])
db = cli[os.environ['DB_NAME']]

_sk = None
def sk():
    global _sk
    if not _sk:
        _sk = requests.post(f'{STORAGE_URL}/init', json={'emergent_key': os.environ['EMERGENT_LLM_KEY']}, timeout=30).json()['storage_key']
    return _sk

def upload(data, ext='jpg'):
    path = f'{APP}/properties/{uuid.uuid4()}.{ext}'
    r = requests.put(f'{STORAGE_URL}/objects/{path}', headers={'X-Storage-Key': sk(), 'Content-Type': 'image/jpeg'}, data=data, timeout=120)
    r.raise_for_status()
    rp = r.json()['path']
    db.files.insert_one({'id': str(uuid.uuid4()), 'storage_path': rp, 'original_filename': 'property.jpg',
                         'content_type': 'image/jpeg', 'size': len(data), 'is_deleted': False,
                         'created_at': datetime.now(timezone.utc).isoformat()})
    return f'/api/files/{rp}'

def log(m):
    with open('/app/backend/import.log', 'a') as f:
        f.write(m + '\n')
    print(m)

def collect_listing():
    items = {}  # id -> {price, currency}
    for p in range(1, 6):
        u = BASE + ('' if p == 1 else f'?stranka={p}')
        t = requests.get(u, headers=H, timeout=30).text
        # split into cards by detail link
        chunks = re.split(r'(/reality/detail/\d+/[^\"\']*)', t)
        for i in range(1, len(chunks), 2):
            link = chunks[i]
            m = re.match(r'/reality/detail/(\d+)/', link)
            if not m:
                continue
            pid = m.group(1)
            after = chunks[i+1] if i+1 < len(chunks) else ''
            pm = re.search(r'([\d\s\u00a0]{4,}(?:,\d+)?)\s*(K\u010d|\u20ac)', after)
            if pid not in items and pm:
                raw = pm.group(1).replace('\u00a0', '').replace(' ', '').split(',')[0]
                try:
                    price = int(raw)
                except:
                    price = 0
                cur = 'K\u010d' if pm.group(2) == 'K\u010d' else '\u20ac'
                items[pid] = {'price': price, 'currency': cur}
            elif pid not in items:
                items[pid] = {'price': 0, 'currency': 'K\u010d'}
        time.sleep(0.3)
    return items

AGENTS = {a['name']: a['id'] for a in db.agents.find({}, {'name': 1, 'id': 1})}
def match_agent(t):
    for surname, name in [('Kortan', 'Slavom\u00edr Kortan'), ('Bart\u00e1kov', 'Liliana Bart\u00e1kov\u00e1'),
                          ('Sirn', 'Ing. Zden\u011bk Sirn\u00fd'), ('Kulh\u00e1nkov', 'Krist\u00fdna Kulh\u00e1nkov\u00e1')]:
        if surname in t:
            return AGENTS.get(name)
    return AGENTS.get('Slavom\u00edr Kortan')

def ptype(title):
    tl = title.lower()
    if 'pozemk' in tl or 'pozemek' in tl:
        return 'pozemek'
    if 'byt' in tl:
        return 'byt'
    if 'dom' in tl or 'd\u016fm' in tl or 'chat' in tl or 'chalup' in tl or 'vila' in tl:
        return 'dum'
    return 'komercni'  # ubytovac\u00ed, restaurace, zem\u011bd\u011blsk\u00fd, kancel\u00e1\u0159...

def clean(s):
    s = re.sub(r'<[^>]+>', ' ', s)
    s = ihtml.unescape(s).replace('\u00a0', ' ')
    return re.sub(r'\s+', ' ', s).strip()

def scrape_detail(pid, listing):
    u = f'https://www.remax-czech.cz/reality/detail/{pid}/x'
    t = requests.get(u, headers=H, timeout=30).text
    m = re.search(r'<title>(.*?)</title>', t, re.S)
    title = clean(m.group(1)).split('|')[0].strip() if m else f'Nemovitost {pid}'
    deal = 'pronajem' if 'pron\u00e1jem' in title.lower() else 'prodej'
    pt = ptype(title)
    am = re.search(r'(\d+)\s*m\u00b2', title)
    area = int(am.group(1)) if am else 0
    dm = re.search(r'(\d+)\+(?:kk|\d+)', title)
    bedrooms = int(dm.group(1)) if dm and pt in ('byt', 'dum') else 0
    loc = title.split(',')[-1].strip() if ',' in title else 'Tachovsko'
    # description = longest div text
    tt = re.sub(r'<script.*?</script>', '', t, flags=re.S)
    tt = re.sub(r'<style.*?</style>', '', tt, flags=re.S)
    best = ''
    for d in re.findall(r'<div[^>]*>(.*?)</div>', tt, re.S):
        c = clean(d)
        if len(c) > len(best) and 'REMAX je' not in c and 'Obchodn\u00ed zna\u010dka' not in c and 'Etick\u00fd kodex' not in c and 'Austria Belgium' not in c:
            best = c
    desc = best[:2000]
    agent_id = match_agent(t)
    # images: full-size from zs folder
    thumbs = re.findall(r'https://mlsf\.remax-czech\.cz/data/+zs/(\d+)/(\d+)_th\d+\.jpg', t)
    seen, fulls = set(), []
    for folder, num in thumbs:
        key = (folder, num)
        if key in seen:
            continue
        seen.add(key)
        fulls.append(f'https://mlsf.remax-czech.cz/data/zs/{folder}/{num}.jpg')
    fulls = fulls[:8]
    img_urls = []
    for fu in fulls:
        try:
            r = requests.get(fu, headers=H, timeout=30)
            if r.status_code == 200 and len(r.content) > 3000:
                img_urls.append(upload(r.content))
        except Exception as e:
            log(f'  img fail {fu}: {e}')
    info = listing.get(pid, {'price': 0, 'currency': 'K\u010d'})
    return {
        'id': str(uuid.uuid4()), 'title': title, 'description': desc,
        'price': info['price'], 'currency': info['currency'], 'deal_type': deal,
        'property_type': pt, 'status': 'aktivni', 'location': loc,
        'bedrooms': bedrooms, 'bathrooms': 0, 'area': area, 'images': img_urls,
        'featured': False, 'agent_id': agent_id, 'source_id': pid,
        'created_at': datetime.now(timezone.utc).isoformat(),
    }

def main():
    open('/app/backend/import.log', 'w').close()
    log('Collecting listing...')
    listing = collect_listing()
    ids = list(listing.keys())
    log(f'Found {len(ids)} properties')
    # wipe existing
    db.properties.delete_many({})
    log('Cleared old properties')
    count = 0
    for idx, pid in enumerate(ids):
        try:
            doc = scrape_detail(pid, listing)
            db.properties.insert_one(doc)
            count += 1
            if idx < 3:
                doc['featured'] = True
                db.properties.update_one({'id': doc['id']}, {'$set': {'featured': True}})
            log(f"[{idx+1}/{len(ids)}] {doc['title'][:60]} | {doc['price']} {doc['currency']} | imgs={len(doc['images'])} | agent={doc['agent_id'] is not None}")
        except Exception as e:
            log(f'[{idx+1}] FAIL {pid}: {e}')
        time.sleep(0.2)
    log(f'DONE. Imported {count} properties.')

if __name__ == '__main__':
    main()
