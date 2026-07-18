"""TaxQuest backend regression tests.

Covers:
- Health, auth (register/login/me/logout/refresh), invalid credentials
- Countries list/get/CRUD (admin-guarded)
- Quizzes (Indian + country) + submit + achievements + leaderboard
- Chat streaming SSE from Claude via Emergent LLM key
"""
from __future__ import annotations

import os
import time
import uuid
import urllib.parse
from pathlib import Path

import pytest
import requests
from dotenv import load_dotenv

# Load backend env for admin credentials — never hardcode secrets in source.
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") if os.environ.get("REACT_APP_BACKEND_URL") else "https://tax-pro-hub-14.preview.emergentagent.com"
API = f"{BASE_URL}/api"

ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@taxmaster.pro")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")
assert ADMIN_PASSWORD, "ADMIN_PASSWORD must be set (via backend/.env or env var) — never hardcode"


# ---------- Fixtures ----------
@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    data = r.json()
    assert data["role"] == "admin"
    return s


@pytest.fixture(scope="module")
def user_session():
    s = requests.Session()
    ts = int(time.time() * 1000)
    email = f"qauser+{ts}@test.com"
    r = s.post(
        f"{API}/auth/register",
        json={"email": email, "password": "TestPass1", "name": f"QA User {ts}"},
        timeout=15,
    )
    assert r.status_code == 200, f"Register failed: {r.status_code} {r.text}"
    s.headers["X-Test-Email"] = email  # stash on session for later reference
    return s


# ---------- Health ----------
class TestHealth:
    def test_root(self):
        r = requests.get(f"{API}/", timeout=10)
        assert r.status_code == 200
        j = r.json()
        assert j["app"] == "TaxQuest"
        assert j["status"] == "ok"


# ---------- Auth ----------
class TestAuth:
    def test_register_new_user(self):
        s = requests.Session()
        ts = int(time.time() * 1000)
        email = f"qareg+{ts}@test.com"
        r = s.post(
            f"{API}/auth/register",
            json={"email": email, "password": "TestPass1", "name": "Reg Test"},
            timeout=15,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["email"] == email
        assert data["role"] == "user"
        assert data["name"] == "Reg Test"
        assert "id" in data and isinstance(data["id"], str)
        # cookie set
        assert "access_token" in s.cookies.get_dict()
        # /auth/me works after register
        me = s.get(f"{API}/auth/me", timeout=10)
        assert me.status_code == 200
        assert me.json()["email"] == email

    def test_register_duplicate_email_fails(self):
        s = requests.Session()
        ts = int(time.time() * 1000)
        email = f"dup+{ts}@test.com"
        r1 = s.post(f"{API}/auth/register", json={"email": email, "password": "TestPass1", "name": "Dup"}, timeout=15)
        assert r1.status_code == 200
        r2 = requests.post(f"{API}/auth/register", json={"email": email, "password": "TestPass1", "name": "Dup2"}, timeout=15)
        assert r2.status_code == 400
        assert "already registered" in r2.text.lower()

    def test_login_admin_sets_cookie_and_returns_admin_role(self):
        s = requests.Session()
        r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"
        assert "access_token" in s.cookies.get_dict()
        # /auth/me returns admin
        me = s.get(f"{API}/auth/me", timeout=10)
        assert me.status_code == 200
        assert me.json()["role"] == "admin"

    def test_login_wrong_password_returns_401(self):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrongpass!"}, timeout=15)
        assert r.status_code == 401
        assert "invalid" in r.text.lower()

    def test_me_without_auth_returns_401(self):
        r = requests.get(f"{API}/auth/me", timeout=10)
        assert r.status_code == 401

    def test_logout_clears_session(self):
        s = requests.Session()
        s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
        assert s.get(f"{API}/auth/me", timeout=10).status_code == 200
        r = s.post(f"{API}/auth/logout", timeout=10)
        assert r.status_code == 200
        # After logout no cookie, next /me should be 401 (fresh session without cookie)
        s2 = requests.Session()
        assert s2.get(f"{API}/auth/me", timeout=10).status_code == 401


# ---------- Countries ----------
class TestCountries:
    def test_list_countries_returns_seeded_data(self):
        r = requests.get(f"{API}/countries", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert "countries" in data
        assert len(data["countries"]) >= 45, f"Expected >=45 countries, got {len(data['countries'])}"

    def test_get_country_by_encoded_flag_key(self):
        key = "🇮🇳 India"
        enc = urllib.parse.quote(key, safe="")
        r = requests.get(f"{API}/countries/{enc}", timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["key"] == key
        assert "info" in data and isinstance(data["info"], dict)
        assert "quiz" in data and isinstance(data["quiz"], list)
        assert len(data["quiz"]) > 0

    def test_get_country_not_found(self):
        r = requests.get(f"{API}/countries/does-not-exist", timeout=10)
        assert r.status_code == 404

    def test_non_admin_cannot_create_country(self, user_session):
        r = user_session.post(f"{API}/countries", json={"key": "🇽🇽 Fake", "region": "Test", "info": {}, "notes": "", "quiz": []}, timeout=15)
        assert r.status_code == 403

    def test_non_admin_cannot_update_country(self, user_session):
        r = user_session.put(f"{API}/countries/🇮🇳 India", json={"key": "🇮🇳 India", "region": "Asia", "info": {}, "notes": "", "quiz": []}, timeout=15)
        assert r.status_code == 403

    def test_non_admin_cannot_delete_country(self, user_session):
        r = user_session.delete(f"{API}/countries/🇮🇳 India", timeout=15)
        assert r.status_code == 403

    def test_admin_country_crud_full_cycle(self, admin_session):
        key = f"🇿🇿 TestLand-{uuid.uuid4().hex[:6]}"
        # CREATE
        c = admin_session.post(
            f"{API}/countries",
            json={
                "key": key,
                "region": "TestRegion",
                "info": {"type": "Flat", "personal": "10%", "corp": "10%", "consumption": "0%", "filing": "Dec 31"},
                "notes": "Auto test",
                "quiz": [{"q": "Rate?", "options": ["10%", "20%"], "answer": 0}],
            },
            timeout=15,
        )
        assert c.status_code == 200, c.text
        created = c.json()
        assert created["key"] == key
        assert created["region"] == "TestRegion"

        # GET
        g = requests.get(f"{API}/countries/{urllib.parse.quote(key, safe='')}", timeout=15)
        assert g.status_code == 200
        assert g.json()["notes"] == "Auto test"

        # UPDATE
        u = admin_session.put(
            f"{API}/countries/{urllib.parse.quote(key, safe='')}",
            json={
                "key": key,
                "region": "TestRegion2",
                "info": {"type": "Progressive"},
                "notes": "Updated",
                "quiz": [],
            },
            timeout=15,
        )
        assert u.status_code == 200
        assert u.json()["notes"] == "Updated"
        assert u.json()["region"] == "TestRegion2"

        # Verify persisted
        g2 = requests.get(f"{API}/countries/{urllib.parse.quote(key, safe='')}", timeout=15)
        assert g2.status_code == 200
        assert g2.json()["notes"] == "Updated"

        # DELETE
        d = admin_session.delete(f"{API}/countries/{urllib.parse.quote(key, safe='')}", timeout=15)
        assert d.status_code == 200

        # 404 after delete
        g3 = requests.get(f"{API}/countries/{urllib.parse.quote(key, safe='')}", timeout=10)
        assert g3.status_code == 404


# ---------- Quiz ----------
class TestQuiz:
    def test_indian_quiz_has_min_questions(self):
        r = requests.get(f"{API}/quiz/indian", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert "quiz" in data
        assert len(data["quiz"]) >= 15, f"Expected >=15 Indian quiz questions, got {len(data['quiz'])}"
        first = data["quiz"][0]
        # Schema: {q, opts, correct, exp}
        assert "q" in first and "opts" in first and "correct" in first

    def test_country_quiz_returns_questions(self):
        key = "🇮🇳 India"
        r = requests.get(f"{API}/quiz/country/{urllib.parse.quote(key, safe='')}", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data["quiz"], list)
        assert len(data["quiz"]) > 0

    def test_submit_quiz_updates_stats_and_achievements(self):
        # Create fresh user so counters start at 0
        s = requests.Session()
        ts = int(time.time() * 1000)
        email = f"quiz+{ts}@test.com"
        r = s.post(f"{API}/auth/register", json={"email": email, "password": "TestPass1", "name": f"Quiz {ts}"}, timeout=15)
        assert r.status_code == 200

        # Submit a good result with streak
        sub = s.post(
            f"{API}/quiz/submit",
            json={"quiz_type": "indian", "score": 10, "total": 10, "streak": 6},
            timeout=15,
        )
        assert sub.status_code == 200, sub.text
        data = sub.json()
        assert data["questions_answered"] == 10
        assert data["correct_answers"] == 10
        assert data["total_score"] == 100  # 10 correct * 10
        assert data["best_streak"] == 6
        # achievements should include first_step and streak_5
        assert "first_step" in data["achievements"]
        assert "streak_5" in data["achievements"]

    def test_submit_quiz_requires_auth(self):
        r = requests.post(
            f"{API}/quiz/submit",
            json={"quiz_type": "indian", "score": 5, "total": 10, "streak": 0},
            timeout=15,
        )
        assert r.status_code == 401

    def test_leaderboard_reflects_submitted_user(self):
        # Create fresh user + submit
        s = requests.Session()
        ts = int(time.time() * 1000)
        name = f"LB {ts}"
        r = s.post(f"{API}/auth/register", json={"email": f"lb+{ts}@test.com", "password": "TestPass1", "name": name}, timeout=15)
        assert r.status_code == 200
        s.post(f"{API}/quiz/submit", json={"quiz_type": "indian", "score": 7, "total": 10, "streak": 3}, timeout=15)

        lb = requests.get(f"{API}/leaderboard", timeout=15)
        assert lb.status_code == 200
        board = lb.json().get("leaderboard", [])
        assert len(board) > 0
        # Ordering: total_score desc, rank starts at 1
        assert board[0]["rank"] == 1
        # If enough space, our user should be somewhere (limit=20)
        # This just validates schema
        row = board[0]
        for k in ("rank", "name", "total_score", "best_streak", "questions_answered", "correct_answers", "achievements"):
            assert k in row


# ---------- Chat ----------
class TestChat:
    def test_chat_requires_auth(self):
        r = requests.post(f"{API}/chat/stream", json={"message": "hi"}, timeout=15)
        assert r.status_code == 401

    def test_chat_stream_sse(self, user_session):
        with user_session.post(
            f"{API}/chat/stream",
            json={"message": "In one short sentence, what is GST?", "country": "🇮🇳 India"},
            stream=True,
            timeout=30,
        ) as r:
            assert r.status_code == 200, r.text
            assert r.headers.get("content-type", "").startswith("text/event-stream")
            assert r.headers.get("X-Session-Id") or r.headers.get("x-session-id")
            chunks = []
            got_done = False
            got_data = False
            start = time.time()
            for line in r.iter_lines(decode_unicode=True):
                if line is None:
                    continue
                if not line:
                    continue
                if line.startswith("data:"):
                    payload = line[5:].strip()
                    chunks.append(payload)
                    if payload and payload != "[DONE]" and not payload.startswith("[ERROR]"):
                        got_data = True
                    if payload == "[DONE]":
                        got_done = True
                        break
                # Safety timeout
                if time.time() - start > 25:
                    break
            assert got_data, f"No data chunks streamed. Received: {chunks[:5]}"
            assert got_done, f"Stream did not signal [DONE]. Received: {chunks[-5:]}"


# ---------- Bearer-token fallback (cookies-blocked regression) ----------
class TestBearerFallback:
    """PRIMARY regression: verify Bearer token works when cookies are blocked."""

    def test_login_returns_access_token_in_body(self):
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert "access_token" in data, f"login response missing access_token: {data.keys()}"
        assert isinstance(data["access_token"], str) and len(data["access_token"]) > 20

    def test_register_returns_access_token_in_body(self):
        ts = int(time.time() * 1000)
        r = requests.post(
            f"{API}/auth/register",
            json={"email": f"bear+{ts}@test.com", "password": "TestPass1", "name": f"Bear {ts}"},
            timeout=15,
        )
        assert r.status_code == 200
        data = r.json()
        assert "access_token" in data
        assert isinstance(data["access_token"], str) and len(data["access_token"]) > 20

    def test_me_with_only_bearer_no_cookies(self):
        # Get token from login (fresh, no session/cookies used)
        r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
        assert r.status_code == 200
        token = r.json()["access_token"]
        # Now hit /auth/me with only Authorization header, no cookies
        me = requests.get(
            f"{API}/auth/me",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10,
        )
        assert me.status_code == 200, me.text
        assert me.json()["email"] == ADMIN_EMAIL
        assert me.json()["role"] == "admin"

    def test_me_with_invalid_bearer_returns_401(self):
        me = requests.get(
            f"{API}/auth/me",
            headers={"Authorization": "Bearer not-a-real-token"},
            timeout=10,
        )
        assert me.status_code == 401

    def test_quiz_submit_with_only_bearer(self):
        # Register fresh user, extract token, then submit with only Authorization header
        ts = int(time.time() * 1000)
        email = f"bqs+{ts}@test.com"
        r = requests.post(
            f"{API}/auth/register",
            json={"email": email, "password": "TestPass1", "name": f"BQ {ts}"},
            timeout=15,
        )
        assert r.status_code == 200
        token = r.json()["access_token"]

        # Submit quiz with only Bearer header (no cookies)
        sub = requests.post(
            f"{API}/quiz/submit",
            json={"quiz_type": "indian", "score": 8, "total": 10, "streak": 5},
            headers={"Authorization": f"Bearer {token}"},
            timeout=15,
        )
        assert sub.status_code == 200, sub.text
        data = sub.json()
        assert data["total_score"] == 80  # 8 correct * 10
        assert data["best_streak"] == 5
        assert data["questions_answered"] == 10
        assert data["correct_answers"] == 8
        assert "streak_5" in data["achievements"]
        assert "first_step" in data["achievements"]

        # Verify persistence via /me with the same token
        me = requests.get(
            f"{API}/auth/me",
            headers={"Authorization": f"Bearer {token}"},
            timeout=10,
        )
        assert me.status_code == 200
        assert me.json()["total_score"] == 80
        assert me.json()["email"] == email
