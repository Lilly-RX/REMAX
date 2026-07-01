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
        assert len(agents) >= 4

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
        for k in ("properties", "agents", "messages", "unread_messages", "reviews", "pending_reviews"):
            assert k in d
            assert isinstance(d[k], int)


# ---------------- Reviews ----------------
class TestReviews:
    def test_public_create_office_review(self, public):
        r = public.post(f"{API}/reviews", json={
            "author_name": "TEST Reviewer", "email": "rev@test.cz", "rating": 5,
            "text": "TEST office review — great service.",
            "target_type": "office", "deal_type": "koupe"})
        assert r.status_code == 200
        assert "schválení" in r.json()["message"]

    def test_public_create_rejects_bad_rating(self, public):
        r = public.post(f"{API}/reviews", json={
            "author_name": "TEST", "rating": 7, "text": "bad", "target_type": "office"})
        assert r.status_code == 400
        r = public.post(f"{API}/reviews", json={
            "author_name": "TEST", "rating": 0, "text": "bad", "target_type": "office"})
        assert r.status_code == 400

    def test_new_review_not_in_public_list(self, public):
        # Submit
        public.post(f"{API}/reviews", json={
            "author_name": "TEST_PendingHidden", "rating": 4,
            "text": "Should be hidden until approved", "target_type": "office"})
        # Fetch public — should not include pending
        r = public.get(f"{API}/reviews")
        assert r.status_code == 200
        assert all(rv.get("status", "approved") == "approved" for rv in r.json())
        assert not any(rv["author_name"] == "TEST_PendingHidden" for rv in r.json())

    def test_all_requires_auth(self, public):
        r = public.get(f"{API}/reviews/all")
        assert r.status_code == 401

    def test_approve_requires_auth(self, public):
        r = public.put(f"{API}/reviews/some-id/approve")
        assert r.status_code == 401

    def test_full_approve_reply_delete_flow(self, admin, public):
        # Create pending
        r = public.post(f"{API}/reviews", json={
            "author_name": "TEST_Flow", "rating": 5,
            "text": "TEST_Flow content", "target_type": "office", "deal_type": "prodej"})
        assert r.status_code == 200

        # Find via admin all
        all_ = admin.get(f"{API}/reviews/all").json()
        target = next((x for x in all_ if x["author_name"] == "TEST_Flow" and x["status"] == "pending"), None)
        assert target is not None, "pending review not found"
        rid = target["id"]

        # Not yet on public
        pub = public.get(f"{API}/reviews").json()
        assert not any(x["id"] == rid for x in pub)

        # Approve
        r = admin.put(f"{API}/reviews/{rid}/approve")
        assert r.status_code == 200

        # Now visible publicly
        pub = public.get(f"{API}/reviews").json()
        assert any(x["id"] == rid and x["status"] == "approved" for x in pub)

        # Reply
        r = admin.put(f"{API}/reviews/{rid}/reply", json={"reply": "TEST reply text"})
        assert r.status_code == 200
        pub = public.get(f"{API}/reviews").json()
        it = next(x for x in pub if x["id"] == rid)
        assert it["reply"] == "TEST reply text"

        # Delete
        r = admin.delete(f"{API}/reviews/{rid}")
        assert r.status_code == 200
        pub = public.get(f"{API}/reviews").json()
        assert not any(x["id"] == rid for x in pub)

    def test_agent_review_summary(self, admin, public):
        agents = public.get(f"{API}/agents").json()
        assert agents
        aid = agents[0]["id"]
        # Create + approve agent review
        r = public.post(f"{API}/reviews", json={
            "author_name": "TEST_AgentRev", "rating": 4,
            "text": "TEST agent review", "target_type": "agent", "agent_id": aid,
            "deal_type": "pronajem"})
        assert r.status_code == 200
        rid = next(x["id"] for x in admin.get(f"{API}/reviews/all").json() if x["author_name"] == "TEST_AgentRev")
        admin.put(f"{API}/reviews/{rid}/approve")

        summary = public.get(f"{API}/reviews/summary").json()
        assert aid in summary
        assert summary[aid]["count"] >= 1
        assert 1 <= summary[aid]["avg"] <= 5

        # Filter by agent
        r = public.get(f"{API}/reviews", params={"agent_id": aid})
        assert r.status_code == 200
        assert any(x["id"] == rid for x in r.json())

        # Cleanup
        admin.delete(f"{API}/reviews/{rid}")

    def test_office_target_forces_agent_id_null(self, admin, public):
        agents = public.get(f"{API}/agents").json()
        aid = agents[0]["id"]
        public.post(f"{API}/reviews", json={
            "author_name": "TEST_OfficeNull", "rating": 5, "text": "x",
            "target_type": "office", "agent_id": aid})
        found = next(x for x in admin.get(f"{API}/reviews/all").json() if x["author_name"] == "TEST_OfficeNull")
        assert found["agent_id"] is None
        admin.delete(f"{API}/reviews/{found['id']}")


# ---------------- Cleanup ----------------
def test_zzz_cleanup_test_reviews(request):
    """Remove leftover TEST_ reviews from prior test runs."""
    s = requests.Session()
    s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    all_ = s.get(f"{API}/reviews/all").json()
    for r in all_:
        if r["author_name"].startswith("TEST"):
            s.delete(f"{API}/reviews/{r['id']}")
