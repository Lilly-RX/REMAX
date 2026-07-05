import os, time
from dotenv import load_dotenv
load_dotenv()
from pymongo import MongoClient
from update_images import scrape_images

db = MongoClient(os.environ['MONGO_URL'])[os.environ['DB_NAME']]

# failed entirely + those with fewer than 8 images -> retry
retry_ids = {'438962'}
for p in db.properties.find({}, {'source_id': 1, 'images': 1}):
    if p.get('source_id') and len(p.get('images', [])) < 8:
        retry_ids.add(p['source_id'])

print('retrying', len(retry_ids), 'properties')
for sid in retry_ids:
    p = db.properties.find_one({'source_id': sid}, {'id': 1, 'title': 1, 'images': 1})
    old = len(p.get('images', []))
    try:
        urls = scrape_images(sid)
        # keep whichever set is larger (don't lose existing images)
        if len(urls) >= old and urls:
            db.properties.update_one({'id': p['id']}, {'$set': {'images': urls}})
        print(sid, p['title'][:45], ':', old, '->', max(old, len(urls)) if urls else old)
    except Exception as e:
        print(sid, 'FAIL', e)
    time.sleep(0.3)
print('DONE')
