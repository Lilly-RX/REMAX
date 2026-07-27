"""MAXIS (RE/MAX) FTP XML feed -> MongoDB property sync.

Feed: XMLNEW/nabidky.xml (offers) + XMLNEW/makleri.xml (agents) on the office FTP.
Images are referenced directly from https://mlsf.remax-czech.cz/data + <soubor>.
MAXIS is the source of truth: offers are upserted by `source_id` and any
source-managed property no longer present in the feed is removed. Manually
created properties (no `source_id`) are never touched.
"""
import os
import io
import re
import uuid
import logging
from ftplib import FTP
from datetime import datetime, timezone
import xml.etree.ElementTree as ET

logger = logging.getLogger(__name__)

IMG_BASE = "https://mlsf.remax-czech.cz/data"

DEAL_MAP = {"prodej": "prodej", "pronájem": "pronajem", "pronajem": "pronajem"}
TYPE_MAP = {
    "byty": "byt", "domy": "dum", "pozemky": "pozemek",
    "komerční": "komercni", "komercni": "komercni", "ostatní": "komercni",
    "ostatni": "komercni",
}


def _text(el, tag):
    v = el.findtext(tag)
    return v.strip() if v else ""


def _to_int(s):
    if not s:
        return 0
    try:
        return int(float(str(s).replace(",", ".")))
    except (ValueError, TypeError):
        return 0


def _to_iso(s):
    """MAXIS date '2022-04-04 10:46:36' -> ISO8601 UTC string."""
    s = (s or "").strip()
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
        try:
            return datetime.strptime(s, fmt).replace(tzinfo=timezone.utc).isoformat()
        except ValueError:
            continue
    return datetime.now(timezone.utc).isoformat()


def _fetch_feeds():
    """Blocking: download the two XML feeds from the FTP XMLNEW folder."""
    host = os.environ["MAXIS_FTP_HOST"]
    user = os.environ["MAXIS_FTP_USER"]
    pw = os.environ["MAXIS_FTP_PASS"]
    out = {}
    ftp = FTP(host, timeout=60)
    ftp.login(user, pw)
    try:
        for name in ("nabidky.xml", "makleri.xml"):
            buf = io.BytesIO()
            ftp.retrbinary(f"RETR XMLNEW/{name}", buf.write)
            out[name] = buf.getvalue()
    finally:
        try:
            ftp.quit()
        except Exception:
            ftp.close()
    return out


def _parse_maklers(xml_bytes):
    """uzivatel id (str) -> email(lower)"""
    root = ET.fromstring(xml_bytes)
    out = {}
    for u in root:
        uid = u.attrib.get("id") or _text(u, "id")
        email = _text(u, "email").lower()
        if uid and email:
            out[str(uid)] = email
    return out


def _pick_area(n, ptype):
    if ptype == "pozemek":
        order = ["nemovitost_plocha_parcely", "nemovitost_plocha_celkova", "nemovitost_plocha_uzitna"]
    else:
        order = ["nemovitost_plocha_uzitna", "nemovitost_plocha_celkova",
                 "nemovitost_plocha_zastavena", "nemovitost_plocha_nebytovych_prostor",
                 "nemovitost_plocha_parcely"]
    for f in order:
        v = _to_int(_text(n, f))
        if v:
            return v
    return 0


def _bedrooms(n):
    v = _to_int(_text(n, "nemovitost_pocet_pokoju"))
    if v:
        return v
    m = re.search(r"(\d+)\s*\+\s*(?:kk|\d)", _text(n, "nemovitost_titulek"), re.IGNORECASE)
    return int(m.group(1)) if m else 0


def _images(n):
    docs = []
    for d in n.findall("dokument"):
        if _text(d, "typ_prilohy") != "1":
            continue
        soubor = _text(d, "soubor")
        if not soubor or not soubor.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
            continue
        poradi = _to_int(_text(d, "poradi"))
        docs.append((poradi, IMG_BASE + soubor))
    docs.sort(key=lambda x: x[0])
    return [u for _, u in docs]


def _location(n):
    obec = _text(n, "nemovitost_uir_obec_text")
    okres = _text(n, "nemovitost_uir_okres_text")
    cast = _text(n, "nemovitost_uir_cobce_text")
    base = obec or _text(n, "nemovitost_uir_ulice_text")
    if cast and cast != obec:
        base = f"{obec} - {cast}" if obec else cast
    if okres and okres != obec and base:
        return f"{base}, okres {okres}"
    return base


def _parse_offers(xml_bytes):
    root = ET.fromstring(xml_bytes)
    offers = []
    for n in root.findall(".//nabidka"):
        if _text(n, "nabidka_stav").lower() not in ("aktivni", "aktivní", ""):
            continue
        sid = n.attrib.get("id") or _text(n, "id")
        if not sid:
            continue
        deal = DEAL_MAP.get(_text(n, "zakazka_typ").lower(), "prodej")
        ptype = TYPE_MAP.get(_text(n, "nemovitost_typ").lower(), "byt")
        price_field = "nemovitost_cena_prodej" if deal == "prodej" else "nemovitost_cena_pronajem"
        price = _to_int(_text(n, price_field)) or _to_int(_text(n, "cena_nabidkova"))
        if _text(n, "nezobrazovat_cenu") == "1":
            price = 0
        desc = _text(n, "nemovitost_popis_detailni") or _text(n, "nemovitost_nadpis")
        offers.append({
            "source_id": str(sid),
            "makler_uid": _text(n, "id_uzivatel"),
            "currency_src": _text(n, "nemovitost_mena").lower(),
            "title": _text(n, "nemovitost_titulek") or _text(n, "nemovitost_nadpis"),
            "description": desc,
            "price": price,
            "currency": "Kč",
            "deal_type": deal,
            "property_type": ptype,
            "status": "aktivni",
            "location": _location(n),
            "bedrooms": _bedrooms(n),
            "bathrooms": 0,
            "area": _pick_area(n, ptype),
            "images": _images(n),
            "created_at": _to_iso(_text(n, "zakazka_datum_vlozeno")),
        })
    return offers


async def run_maxis_sync(db):
    """Fetch feed, upsert offers, remove stale, refresh featured. Returns stats dict."""
    import asyncio
    started = datetime.now(timezone.utc)
    feeds = await asyncio.to_thread(_fetch_feeds)
    offers = _parse_offers(feeds["nabidky.xml"])
    uid_to_email = _parse_maklers(feeds["makleri.xml"])

    # Map office agent emails -> our internal agent id
    email_to_agent = {}
    async for a in db.agents.find({}, {"_id": 0, "id": 1, "email": 1}):
        if a.get("email"):
            email_to_agent[a["email"].lower()] = a["id"]

    added = updated = 0
    feed_ids = []
    for o in offers:
        sid = o["source_id"]
        feed_ids.append(sid)
        makler_email = uid_to_email.get(o.pop("makler_uid", ""), "")
        agent_id = email_to_agent.get(makler_email, None)
        currency = "€" if o.pop("currency_src", "") == "eur" else "Kč"
        fields = {
            "title": o["title"], "description": o["description"], "price": o["price"],
            "currency": currency, "deal_type": o["deal_type"],
            "property_type": o["property_type"], "status": o["status"],
            "location": o["location"], "bedrooms": o["bedrooms"],
            "bathrooms": o["bathrooms"], "area": o["area"], "images": o["images"],
            "agent_id": agent_id,
        }
        existing = await db.properties.find_one({"source_id": sid}, {"_id": 0, "id": 1})
        if existing:
            await db.properties.update_one(
                {"source_id": sid}, {"$set": {**fields, "created_at": o["created_at"]}})
            updated += 1
        else:
            doc = {"id": str(uuid.uuid4()), "source_id": sid, "featured": False,
                   "created_at": o["created_at"], **fields}
            await db.properties.insert_one(doc)
            added += 1

    # Remove source-managed properties no longer in the feed (never touches manual ones)
    removed_res = await db.properties.delete_many(
        {"source_id": {"$exists": True, "$nin": feed_ids}})
    removed = removed_res.deleted_count

    # Refresh featured: newest 6 source-managed offers become featured
    await db.properties.update_many({"source_id": {"$exists": True}}, {"$set": {"featured": False}})
    newest = await db.properties.find(
        {"source_id": {"$exists": True}}, {"_id": 0, "id": 1}
    ).sort("created_at", -1).limit(6).to_list(6)
    if newest:
        await db.properties.update_many(
            {"id": {"$in": [p["id"] for p in newest]}}, {"$set": {"featured": True}})

    total = await db.properties.count_documents({})
    status = {
        "key": "maxis_sync",
        "last_sync": started.isoformat(),
        "duration_s": round((datetime.now(timezone.utc) - started).total_seconds(), 1),
        "feed_count": len(offers),
        "added": added, "updated": updated, "removed": removed, "total": total,
        "ok": True,
    }
    await db["sync_status"].update_one({"key": "maxis_sync"}, {"$set": status}, upsert=True)
    logger.info(f"MAXIS sync done: added={added} updated={updated} removed={removed} total={total}")
    return status
