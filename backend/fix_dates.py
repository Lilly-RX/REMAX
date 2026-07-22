"""One-off: the 73 properties were imported in a single batch in REVERSE of the
source's newest-first order, so created_at is inverted vs real recency.
Reverse the created_at timestamps among existing properties so that the
first-scraped (actually newest) listings get the latest created_at.
Keeps 'newest = latest created_at' semantics correct for future additions too."""
import os
from pathlib import Path
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv(Path(__file__).parent / ".env")
client = MongoClient(os.environ["MONGO_URL"])
db = client[os.environ["DB_NAME"]]

props = list(db.properties.find({}, {"id": 1, "created_at": 1}))
# ascending by current created_at = scrape order (first scraped = source newest)
props.sort(key=lambda p: str(p.get("created_at", "")))
timestamps = sorted([str(p.get("created_at", "")) for p in props])  # ascending
n = len(props)
for i, p in enumerate(props):
    # first-scraped (rank 0) should get the LATEST timestamp
    new_ts = timestamps[n - 1 - i]
    db.properties.update_one({"id": p["id"]}, {"$set": {"created_at": new_ts}})

print(f"Reversed created_at for {n} properties.")
# verify
top = list(db.properties.find({}, {"title": 1, "created_at": 1}).sort("created_at", -1).limit(3))
for t in top:
    print("newest-first now:", t.get("created_at"), "|", t.get("title", "")[:45])
