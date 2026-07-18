"""Tests for the new iteration_6 endpoints:
- GET /api/stats
- POST /api/quiz/generate  (Claude Sonnet 4.5)

NOTE: The /quiz/generate test intentionally makes only ONE real LLM call
with count=3 to keep cost/latency low.
"""
from __future__ import annotations

import os
import time
from pathlib import Path

import pytest
import requests
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") if os.environ.get("REACT_APP_BACKEND_URL") else "https://tax-pro-hub-14.preview.emergentagent.com"
API = f"{BASE_URL}/api"

ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@taxmaster.pro")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD")


@pytest.fixture(scope="module")
def admin_bearer():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200
    return r.json()["access_token"]


class TestStats:
    """GET /api/stats — public endpoint."""

    def test_stats_schema(self):
        r = requests.get(f"{API}/stats", timeout=15)
        assert r.status_code == 200, r.text
        d = r.json()
        for k in ("global_learners", "active_learners", "india_quiz_champs",
                  "world_explorers", "total_attempts", "total_questions", "total_correct"):
            assert k in d, f"missing key {k}"
            assert isinstance(d[k], int), f"{k} must be int, got {type(d[k])}"
            assert d[k] >= 0

    def test_stats_updates_after_submit(self):
        # Snapshot
        before = requests.get(f"{API}/stats", timeout=10).json()

        # New user + submit
        ts = int(time.time() * 1000)
        r = requests.post(f"{API}/auth/register",
                          json={"email": f"stats+{ts}@test.com", "password": "TestPass1", "name": f"Stats {ts}"},
                          timeout=15)
        assert r.status_code == 200
        token = r.json()["access_token"]
        sub = requests.post(f"{API}/quiz/submit",
                            json={"quiz_type": "indian", "score": 4, "total": 5, "streak": 2},
                            headers={"Authorization": f"Bearer {token}"}, timeout=15)
        assert sub.status_code == 200

        after = requests.get(f"{API}/stats", timeout=10).json()
        assert after["global_learners"] >= before["global_learners"] + 1
        assert after["active_learners"] >= before["active_learners"] + 1
        assert after["india_quiz_champs"] >= before["india_quiz_champs"] + 1
        assert after["total_attempts"] >= before["total_attempts"] + 1
        assert after["total_questions"] >= before["total_questions"] + 5
        assert after["total_correct"] >= before["total_correct"] + 4


class TestQuizGenerate:
    """POST /api/quiz/generate — Claude Sonnet 4.5."""

    def test_requires_auth(self):
        r = requests.post(f"{API}/quiz/generate",
                          json={"topic": "GST", "level": "beginner", "count": 3},
                          timeout=15)
        assert r.status_code == 401

    def test_generate_success(self, admin_bearer):
        # ONE real LLM call — count=3 as per PRD guidance.
        r = requests.post(f"{API}/quiz/generate",
                          json={"topic": "GST", "level": "beginner", "count": 3},
                          headers={"Authorization": f"Bearer {admin_bearer}"},
                          timeout=60)
        assert r.status_code == 200, r.text
        d = r.json()
        assert "questions" in d and "count" in d
        assert d["count"] == len(d["questions"])
        assert 1 <= d["count"] <= 3
        for q in d["questions"]:
            assert isinstance(q["q"], str) and q["q"]
            assert isinstance(q["opts"], list) and len(q["opts"]) == 4
            assert all(isinstance(o, str) and o for o in q["opts"])
            assert isinstance(q["correct"], int) and 0 <= q["correct"] <= 3
            assert isinstance(q["exp"], str)

    # NOTE: only ONE real LLM call executed (test_generate_success). Clamp
    # behaviour (count 0..99 → 1..8) is unit-tested inside quiz_gen.py's
    # generate_questions helper via `count = max(1, min(int(count or 5), 8))`.
