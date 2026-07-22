"""One-off: export real agents/properties/files from the current DB into seed_data.json
so any fresh (e.g. production) database self-populates on startup."""
import os, json
from pathlib import Path
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv(Path(__file__).parent / ".env")
client = MongoClient(os.environ["MONGO_URL"])
db = client[os.environ["DB_NAME"]]

def dump(coll):
    docs = list(db[coll].find({}))
    for d in docs:
        d.pop("_id", None)
    return docs

data = {
    "agents": dump("agents"),
    "properties": dump("properties"),
    "files": dump("files"),
}
out = Path(__file__).parent / "seed_data.json"
out.write_text(json.dumps(data, ensure_ascii=False, default=str), encoding="utf-8")
print(f"agents={len(data['agents'])} properties={len(data['properties'])} files={len(data['files'])}")
print(f"written -> {out} ({out.stat().st_size} bytes)")
