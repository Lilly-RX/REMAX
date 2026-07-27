"""MAXIS FTP XML feed sync + property/agent linking tests."""
import os
import re
import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
base_url = os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")
if not base_url:
    raise RuntimeError("REACT_APP_BACKEND_URL missing")
BASE_URL = base_url.rstrip("/")
API = f"{BASE_URL}/api"

CRED_PATH = "/app/memory/test_credentials.md"


@pytest.fixture(scope="session")
def creds():
    with open(CRED_PATH, encoding="utf-8") as f:
        content = f.read()
    email = re.search(r'(?im)^\s*[-*]?\s*(?:\*\*)?Email(?:\*\*)?\s*:\s*`?([^`\s]+)', content)
    pw = re.search(r'(?im)^\s*[-*]?\s*(?:\*\*)?Password(?:\*\*)?\s*:\s*`?([^`\s]+)', content)
    if not email or not pw:
        pytest.skip("no credentials found")
    return {"email": email.group(1), "password": pw.group(1)}


@pytest.fixture(scope="session")
def public():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin(creds):
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    r = s.post(f"{API}/auth/login", json=creds)
    if r.status_code != 200:
        pytest.fail(f"Admin login failed {r.status_code}: {r.text[:300]}")
    assert "access_token" in s.cookies
    return s


@pytest.fixture(scope="session")
def properties(public):
    r = public.get(f"{API}/properties")
    assert r.status_code == 200
    return r.json()


@pytest.fixture(scope="session")
def agents(public):
    r = public.get(f"{API}/agents")
    assert r.status_code == 200
    return r.json()


# ---------------- Properties from MAXIS feed ----------------
class TestProperties:
    def test_count_86(self, properties):
        assert len(properties) == 86, f"expected 86 properties, got {len(properties)}"

    def test_no_mongo_id(self, properties):
        assert all("_id" not in p for p in properties)

    def test_fields_valid(self, properties):
        bad = []
        for p in properties:
            if not p.get("title"):
                bad.append((p.get("id"), "empty title"))
            if not isinstance(p.get("price"), (int, float)) or p.get("price") < 0:
                bad.append((p.get("id"), f"bad price {p.get('price')}"))
            if not p.get("location"):
                bad.append((p.get("id"), "empty location"))
            if p.get("property_type") not in {"byt", "dum", "pozemek", "komercni"}:
                bad.append((p.get("id"), f"bad type {p.get('property_type')}"))
            if p.get("deal_type") not in {"prodej", "pronajem"}:
                bad.append((p.get("id"), f"bad deal {p.get('deal_type')}"))
        assert not bad, f"invalid property fields: {bad[:10]}"

    def test_images_present_and_from_mlsf(self, properties):
        bad = [p.get("id") for p in properties if not p.get("images")]
        assert not bad, f"{len(bad)} properties without images: {bad[:5]}"
        wrong = [u for p in properties for u in p["images"]
                 if not u.startswith("https://mlsf.remax-czech.cz/data/")]
        assert not wrong, f"unexpected image hosts: {wrong[:5]}"

    def test_all_source_managed(self, properties):
        # all 86 should come from the feed (have source_id) per review statement
        no_src = [p["id"] for p in properties if not p.get("source_id")]
        assert not no_src, f"{len(no_src)} properties without source_id"

    def test_first_image_reachable(self, properties):
        url = properties[0]["images"][0]
        r = requests.get(url, timeout=30)
        assert r.status_code == 200, f"{url} -> {r.status_code}"
        assert r.headers.get("content-type", "").startswith("image/")

    def test_featured_six(self, public):
        r = public.get(f"{API}/properties?featured=true")
        assert r.status_code == 200
        assert len(r.json()) == 6, f"featured count {len(r.json())}"


# ---------------- Filters ----------------
class TestFilters:
    def test_filter_byt(self, public):
        r = public.get(f"{API}/properties?property_type=byt")
        assert r.status_code == 200
        data = r.json()
        assert len(data) > 0
        assert all(p["property_type"] == "byt" for p in data)

    def test_filter_pronajem(self, public):
        r = public.get(f"{API}/properties?deal_type=pronajem")
        assert r.status_code == 200
        data = r.json()
        assert len(data) > 0
        assert all(p["deal_type"] == "pronajem" for p in data)

    def test_filter_combo(self, public, properties):
        r = public.get(f"{API}/properties?property_type=dum&deal_type=prodej")
        assert r.status_code == 200
        data = r.json()
        expected = [p for p in properties
                    if p["property_type"] == "dum" and p["deal_type"] == "prodej"]
        assert len(data) == len(expected)


# ---------------- Agent linking ----------------
class TestAgentLinking:
    def test_team_has_four_agents(self, agents):
        assert len(agents) == 4, f"expected 4 agents, got {len(agents)}: {[a['name'] for a in agents]}"

    def test_havlicek_not_in_team(self, agents):
        assert not any("Havlíč" in a["name"] for a in agents)

    def test_null_agent_count_25(self, properties):
        nulls = [p for p in properties if p.get("agent_id") is None]
        assert len(nulls) == 25, f"expected 25 unassigned, got {len(nulls)}"

    def test_assigned_agent_ids_valid(self, properties, agents):
        ids = {a["id"] for a in agents}
        assigned = [p for p in properties if p.get("agent_id")]
        assert len(assigned) == 61, f"expected 61 assigned, got {len(assigned)}"
        bad = [p["id"] for p in assigned if p["agent_id"] not in ids]
        assert not bad, f"properties with unknown agent_id: {bad[:5]}"

    def test_property_detail_returns_agent(self, public, properties):
        p = next(x for x in properties if x.get("agent_id"))
        r = public.get(f"{API}/properties/{p['id']}")
        assert r.status_code == 200
        assert r.json()["agent_id"] == p["agent_id"]

    def test_property_detail_404(self, public):
        r = public.get(f"{API}/properties/does-not-exist")
        assert r.status_code == 404


# ---------------- Admin sync auth ----------------
class TestSyncAuth:
    def test_status_requires_auth(self, public):
        r = public.get(f"{API}/admin/maxis/status")
        assert r.status_code in (401, 403), f"got {r.status_code}"

    def test_sync_requires_auth(self, public):
        r = public.post(f"{API}/admin/maxis/sync")
        assert r.status_code in (401, 403), f"got {r.status_code}"

    def test_bad_token_rejected(self):
        r = requests.get(f"{API}/admin/maxis/status", cookies={"access_token": "garbage"})
        assert r.status_code in (401, 403)


# ---------------- Admin sync run ----------------
class TestSyncRun:
    def test_sync_and_idempotency(self, admin):
        r1 = admin.post(f"{API}/admin/maxis/sync", timeout=300)
        assert r1.status_code == 200, f"{r1.status_code}: {r1.text[:300]}"
        s1 = r1.json()
        for k in ("added", "updated", "removed", "total", "feed_count", "ok", "last_sync"):
            assert k in s1, f"missing key {k} in {s1}"
        assert s1["ok"] is True
        assert s1["feed_count"] == 86
        assert s1["total"] == 86

        r2 = admin.post(f"{API}/admin/maxis/sync", timeout=300)
        assert r2.status_code == 200
        s2 = r2.json()
        assert s2["added"] == 0, f"second run added {s2['added']}"
        assert s2["removed"] == 0, f"second run removed {s2['removed']}"
        assert s2["updated"] == 86
        assert s2["total"] == 86

    def test_status_after_sync(self, admin):
        r = admin.get(f"{API}/admin/maxis/status")
        assert r.status_code == 200
        st = r.json()
        assert st.get("key") == "maxis_sync"
        assert st.get("last_sync")
        assert st.get("total") == 86
        assert st.get("ok") is True
        assert "_id" not in st
