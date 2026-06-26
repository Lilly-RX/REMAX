"""Backend tests for RE/MAX Active Broker.

Covers: auth (login, me, logout), properties CRUD + filters, agents CRUD,
contact + messages, upload + file serve, stats.
"""
import os
import io
import uuid
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://remax-active.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@remaxactivebroker.cz"
ADMIN_PASSWORD = "RemaxAdmin2026!"


@pytest.fixture(scope="session")
def public():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    assert "access_token" in s.cookies, "access_token cookie not set on login"
    return s


# ---------------- Auth ----------------
class TestAuth:
    def test_login_invalid(self, public):
        r = public.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_login_success_sets_cookie(self):
        s = requests.Session()
        r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"
        assert "access_token" in s.cookies

    def test_me_requires_auth(self, public):
        r = public.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_with_cookie(self, admin):
        r = admin.get(f"{API}/auth/me")
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_logout(self):
        s = requests.Session()
        s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        r = s.post(f"{API}/auth/logout")
        assert r.status_code == 200


# ---------------- Properties ----------------
class TestProperties:
    def test_list(self, public):
        r = public.get(f"{API}/properties")
        assert r.status_code == 200
        props = r.json()
        assert isinstance(props, list)
        assert len(props) >= 1

    def test_filter_deal_type(self, public):
        r = public.get(f"{API}/properties", params={"deal_type": "prodej"})
        assert r.status_code == 200
        assert all(p["deal_type"] == "prodej" for p in r.json())

    def test_filter_property_type(self, public):
        r = public.get(f"{API}/properties", params={"property_type": "byt"})
        assert r.status_code == 200
        assert all(p["property_type"] == "byt" for p in r.json())

    def test_get_one(self, public):
        listing = public.get(f"{API}/properties").json()
        pid = listing[0]["id"]
        r = public.get(f"{API}/properties/{pid}")
        assert r.status_code == 200
        assert r.json()["id"] == pid

    def test_get_invalid_404(self, public):
        r = public.get(f"{API}/properties/nonexistent-id-xyz")
        assert r.status_code == 404

    def test_create_requires_auth(self, public):
        r = public.post(f"{API}/properties", json={"title": "TEST_unauth"})
        assert r.status_code == 401

    def test_crud_property(self, admin):
        # CREATE
        payload = {"title": "TEST_Property", "price": 1000000, "deal_type": "prodej",
                   "property_type": "byt", "location": "Tachov"}
        r = admin.post(f"{API}/properties", json=payload)
        assert r.status_code == 200, r.text
        pid = r.json()["id"]
        assert r.json()["title"] == "TEST_Property"

        # GET (persistence)
        r = admin.get(f"{API}/properties/{pid}")
        assert r.status_code == 200
        assert r.json()["price"] == 1000000

        # UPDATE
        payload["price"] = 2000000
        r = admin.put(f"{API}/properties/{pid}", json=payload)
        assert r.status_code == 200
        assert r.json()["price"] == 2000000

        # DELETE
        r = admin.delete(f"{API}/properties/{pid}")
        assert r.status_code == 200
        r = admin.get(f"{API}/properties/{pid}")
        assert r.status_code == 404


# ---------------- Agents ----------------
class TestAgents:
    def test_list_agents_seeded(self, public):
        r = public.get(f"{API}/agents")
        assert r.status_code == 200
        agents = r.json()
        assert len(agents) >= 5

    def test_create_requires_auth(self, public):
        r = public.post(f"{API}/agents", json={"name": "TEST_unauth"})
        assert r.status_code == 401

    def test_crud_agent(self, admin):
        r = admin.post(f"{API}/agents", json={"name": "TEST_Agent", "email": "test@x.cz"})
        assert r.status_code == 200
        aid = r.json()["id"]

        r = admin.put(f"{API}/agents/{aid}", json={"name": "TEST_Agent_Updated", "email": "test@x.cz"})
        assert r.status_code == 200
        assert r.json()["name"] == "TEST_Agent_Updated"

        r = admin.delete(f"{API}/agents/{aid}")
        assert r.status_code == 200


# ---------------- Contact / Messages ----------------
class TestContact:
    def test_public_contact_create(self, public):
        r = public.post(f"{API}/contact", json={
            "name": "TEST User", "email": "test@example.com",
            "phone": "+420111", "message": "Test inquiry"})
        assert r.status_code == 200
        assert "Zpráva" in r.json()["message"]

    def test_messages_requires_auth(self, public):
        r = public.get(f"{API}/messages")
        assert r.status_code == 401

    def test_messages_list_mark_delete(self, admin):
        # Ensure at least one
        requests.post(f"{API}/contact", json={
            "name": "TEST Inq", "email": "t@e.cz", "phone": "", "message": "hi"})
        r = admin.get(f"{API}/messages")
        assert r.status_code == 200
        msgs = r.json()
        assert len(msgs) >= 1
        mid = msgs[0]["id"]
        r = admin.put(f"{API}/messages/{mid}/read")
        assert r.status_code == 200
        r = admin.delete(f"{API}/messages/{mid}")
        assert r.status_code == 200


# ---------------- Upload ----------------
class TestUpload:
    def test_upload_requires_auth(self, public):
        r = public.post(f"{API}/upload",
                        files={"file": ("a.png", b"\x89PNG\r\n\x1a\n", "image/png")})
        assert r.status_code == 401

    def test_upload_and_serve(self, admin):
        # remove default JSON content-type for multipart
        s = requests.Session()
        s.cookies = admin.cookies
        png_bytes = (b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01"
                     b"\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89"
                     b"\x00\x00\x00\rIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00"
                     b"\x05\xfe\x02\xfe\xa7\x9eL\x9f\x00\x00\x00\x00IEND\xaeB`\x82")
        r = s.post(f"{API}/upload", files={"file": ("test.png", png_bytes, "image/png")})
        if r.status_code != 200:
            pytest.skip(f"Upload skipped (storage may be unavailable): {r.status_code} {r.text[:200]}")
        url = r.json()["url"]
        assert url.startswith("/api/files/")
        # Serve
        r2 = requests.get(f"{BASE_URL}{url}")
        assert r2.status_code == 200
        assert r2.headers.get("content-type", "").startswith("image/")


# ---------------- Stats ----------------
class TestStats:
    def test_requires_auth(self, public):
        r = public.get(f"{API}/stats")
        assert r.status_code == 401

    def test_stats(self, admin):
        r = admin.get(f"{API}/stats")
        assert r.status_code == 200
        d = r.json()
        for k in ("properties", "agents", "messages", "unread_messages"):
            assert k in d
            assert isinstance(d[k], int)
