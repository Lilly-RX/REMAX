"""Seed real public reviews (from firmy.cz) as approved office reviews. Idempotent."""
import os, uuid
from pathlib import Path
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv(Path(__file__).parent / ".env")
db = MongoClient(os.environ["MONGO_URL"])[os.environ["DB_NAME"]]

REVIEWS = [
    {
        "author_name": "Milan Bouda",
        "rating": 5,
        "text": "Přes kancelář RE/MAX v Tachově jsem prodával nemovitost. Vše proběhlo k mé naprosté spokojenosti. Je vidět, že makléři se vyznají na trhu a perfektně se orientují v dané problematice. Díky a pokud budu někdy potřebovat, obrátím se zase na Vás!",
        "deal_type": "prodej",
        "created_at": "2019-01-31T10:00:00+00:00",
    },
    {
        "author_name": "MUDr. Jiří Ryšavý",
        "rating": 5,
        "text": "Velice dobré služby.",
        "deal_type": "",
        "created_at": "2019-03-11T10:00:00+00:00",
    },
    {
        "author_name": "Markéta Otavová",
        "rating": 5,
        "text": "Měli jsme to složitější s koupí domu, o to víc oceňujeme, že ochota a trpělivost byly vždy na místě a snaha problém s námi vyřešit. To u předchozí koupě bytu u jiné realitní kanceláře nebylo vůbec samozřejmé. Nakonec jsme vše dotáhli do zdárného konce, za což moc děkujeme.",
        "deal_type": "koupe",
        "created_at": "2019-06-11T10:00:00+00:00",
    },
]

inserted = 0
for r in REVIEWS:
    if db.reviews.find_one({"author_name": r["author_name"], "text": r["text"]}):
        continue
    db.reviews.insert_one({
        "id": str(uuid.uuid4()),
        "author_name": r["author_name"],
        "email": "",
        "rating": r["rating"],
        "text": r["text"],
        "target_type": "office",
        "agent_id": None,
        "deal_type": r["deal_type"],
        "status": "approved",
        "reply": "",
        "created_at": r["created_at"],
    })
    inserted += 1
print(f"Inserted {inserted} reviews. Total approved: {db.reviews.count_documents({'status':'approved'})}")
