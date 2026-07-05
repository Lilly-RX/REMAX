import os, re, uuid, time, requests
from dotenv import load_dotenv
load_dotenv()
from pymongo import MongoClient
from datetime import datetime, timezone

H = {'User-Agent': 'Mozilla/5.0'}
STORAGE_URL = 'https://integrations.emergentagent.com/objstore/api/v1/storage'
db = MongoClient(os.environ['MONGO_URL'])[os.environ['DB_NAME']]

_sk = None
def sk():
    global _sk
    if not _sk:
        _sk = requests.post(f'{STORAGE_URL}/init', json={'emergent_key': os.environ['EMERGENT_LLM_KEY']}, timeout=30).json()['storage_key']
    return _sk

def log(m):
    with open('/app/backend/update_images.log', 'a') as f:
        f.write(m + '\n')

def upload(data, ext):
    ct = 'image/png' if ext == 'png' else 'image/jpeg'
    path = f'remax-active-broker/properties/{uuid.uuid4()}.{ext}'
    for attempt in range(3):
        try:
            r = requests.put(f'{STORAGE_URL}/objects/{path}', headers={'X-Storage-Key': sk(), 'Content-Type': ct}, data=data, timeout=120)
            r.raise_for_status()
            rp = r.json()['path']
            db.files.insert_one({'id': str(uuid.uuid4()), 'storage_path': rp, 'original_filename': 'p.' + ext,
                                 'content_type': ct, 'size': len(data), 'is_deleted': False,
                                 'created_at': datetime.now(timezone.utc).isoformat()})
            return f'/api/files/{rp}'
        except Exception as e:
            time.sleep(1)
    return None

def scrape_images(sid, cap=40):
    t = requests.get(f'https://www.remax-czech.cz/reality/detail/{sid}/x', headers=H, timeout=30).text
    thumbs = re.findall(r'https://mlsf\.remax-czech\.cz/data/+zs/(\d+)/(\d+)_th\d+\.(jpe?g|png)', t)
    seen, fulls = [], []
    for f, n, e in thumbs:
        if (f, n) in seen:
            continue
        seen.append((f, n))
        fulls.append((f'https://mlsf.remax-czech.cz/data/zs/{f}/{n}.{e}', e))
    urls = []
    for fu, e in fulls[:cap]:
        try:
            r = requests.get(fu, headers=H, timeout=40)
            if r.status_code == 200 and len(r.content) > 3000:
                u = upload(r.content, e)
                if u:
                    urls.append(u)
        except Exception as ex:
            log(f'  img fail {fu}: {ex}')
    return urls

def main():
    open('/app/backend/update_images.log', 'w').close()
    props = list(db.properties.find({'source_id': {'$exists': True}}, {'id': 1, 'source_id': 1, 'title': 1, 'images': 1}))
    log(f'Updating images for {len(props)} properties')
    for i, p in enumerate(props):
        try:
            urls = scrape_images(p['source_id'])
            if urls:
                db.properties.update_one({'id': p['id']}, {'$set': {'images': urls}})
                log(f"[{i+1}/{len(props)}] {p['title'][:50]} : {len(p.get('images', []))} -> {len(urls)} imgs")
            else:
                log(f"[{i+1}/{len(props)}] {p['title'][:50]} : NO IMAGES FOUND (kept {len(p.get('images', []))})")
        except Exception as e:
            log(f"[{i+1}] FAIL {p['source_id']}: {e}")
        time.sleep(0.2)
    log('DONE')

if __name__ == '__main__':
    main()
