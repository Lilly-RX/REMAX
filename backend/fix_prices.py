import os, re, requests
from dotenv import load_dotenv
load_dotenv()
from pymongo import MongoClient

H = {'User-Agent': 'Mozilla/5.0'}
BASE = 'https://www.remax-czech.cz/reality/nemovitosti-kancelare/29183/re-max-active-broker/'
db = MongoClient(os.environ['MONGO_URL'])[os.environ['DB_NAME']]

PAT = re.compile(r'data-img="[^"]*"\s+data-price="(.*?)"\s+data-title="[^"]*"\s+data-url="/reality/detail/(\d+)/', re.S)

def parse_num(raw):
    part = re.split(r'K\u010d|\u20ac', raw)[0]
    part = part.replace('\u00a0', '').replace(' ', '').strip()
    part = part.replace('.', '')        # any stray thousand dots
    part = part.replace(',', '.')       # decimal comma -> dot
    m = re.search(r'[\d.]+', part)
    return float(m.group(0)) if m else 0.0

raw_map = {}
for p in range(1, 6):
    u = BASE + ('' if p == 1 else f'?stranka={p}')
    t = requests.get(u, headers=H, timeout=30).text
    for m in PAT.finditer(t):
        raw, pid = m.group(1), m.group(2)
        if pid not in raw_map:
            raw_map[pid] = raw

upd = 0
for pid, raw in raw_map.items():
    doc = db.properties.find_one({'source_id': pid}, {'area': 1, 'deal_type': 1})
    if not doc:
        continue
    cur = '\u20ac' if '\u20ac' in raw else 'K\u010d'
    val = parse_num(raw)
    setd = {'currency': cur}
    if 'za m\u00b2' in raw or 'za m2' in raw:
        area = doc.get('area') or 0
        setd['price'] = int(round(val * area)) if area else int(round(val))
        setd['price_note'] = f'{val:.2f} {cur}/m\u00b2'
    elif 'm\u011bs\u00edc' in raw:
        setd['price'] = int(round(val))
        setd['deal_type'] = 'pronajem'
    else:
        setd['price'] = int(round(val))
    r = db.properties.update_one({'source_id': pid}, {'$set': setd})
    upd += r.modified_count

print(f'parsed {len(raw_map)}, updated {upd}')
print('--- prodej < 200000 ---')
for pp in db.properties.find({'deal_type': 'prodej', 'price': {'$lt': 200000}}, {'title': 1, 'price': 1}):
    print(pp['price'], pp['title'][:55])
print('--- price 0 ---', db.properties.count_documents({'price': 0}))
print('--- pronajem count ---', db.properties.count_documents({'deal_type': 'pronajem'}))
