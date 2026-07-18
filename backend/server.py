"""TaxMaster Pro — FastAPI backend.

Provides:
- JWT auth (cookies + Bearer fallback)
- Countries (CRUD, admin-guarded writes)
- Quizzes (Indian continuous + per-country)
- Score submission + user progress
- Leaderboard
- AI Tax Assistant streaming
"""
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, Query
from fastapi.responses import StreamingResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field
from bson import ObjectId

from auth import (
    hash_password, verify_password,
    create_access_token, create_refresh_token,
    set_auth_cookies, clear_auth_cookies,
    get_current_user_from_db, seed_admin,
)
from tax_data import COUNTRIES, INDIAN_QUIZ
from chat_service import stream_reply, new_session_id

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# ---------- DB ----------
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="TaxMaster Pro API")
api = APIRouter(prefix="/api")


# ---------- Models ----------
class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    name: str = Field(min_length=1, max_length=60)
    age: Optional[int] = Field(default=None, ge=10, le=120)
    experience: Optional[str] = Field(default="beginner")  # beginner | intermediate | pro


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class QuizSubmit(BaseModel):
    quiz_type: str  # "indian" | "country"
    country_key: Optional[str] = None
    score: int
    total: int
    streak: Optional[int] = 0


class CountryIn(BaseModel):
    key: str
    region: str = ""
    info: dict
    notes: str = ""
    quiz: list = []


class ChatIn(BaseModel):
    message: str
    country: Optional[str] = None
    session_id: Optional[str] = None


# ---------- Auth dep ----------
async def current_user(request: Request) -> dict:
    return await get_current_user_from_db(request, db)


async def admin_user(user: dict = Depends(current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin required")
    return user


# ---------- Helpers ----------
def _serialize_user(u: dict) -> dict:
    return {
        "id": u.get("id") or str(u.get("_id", "")),
        "email": u["email"],
        "name": u.get("name", ""),
        "role": u.get("role", "user"),
        "age": u.get("age"),
        "experience": u.get("experience", "beginner"),
        "total_score": u.get("total_score", 0),
        "best_streak": u.get("best_streak", 0),
        "current_streak": u.get("current_streak", 0),
        "questions_answered": u.get("questions_answered", 0),
        "correct_answers": u.get("correct_answers", 0),
        "achievements": u.get("achievements", []),
    }


def _country_out(doc: dict) -> dict:
    return {
        "key": doc["key"],
        "region": doc.get("region", ""),
        "info": doc.get("info", {}),
        "notes": doc.get("notes", ""),
        "quiz": doc.get("quiz", []),
    }


ACHIEVEMENTS = [
    {"id": "first_step",  "name": "First Step",       "desc": "Answer your first question",     "threshold": 1,   "field": "questions_answered"},
    {"id": "century",     "name": "Century Scholar",  "desc": "Answer 100 questions",           "threshold": 100, "field": "questions_answered"},
    {"id": "streak_5",    "name": "On Fire",          "desc": "5-question streak",              "threshold": 5,   "field": "best_streak"},
    {"id": "streak_10",   "name": "Unstoppable",     "desc": "10-question streak",             "threshold": 10,  "field": "best_streak"},
    {"id": "score_500",   "name": "Tax Apprentice",   "desc": "Reach 500 total score",          "threshold": 500, "field": "total_score"},
    {"id": "score_2000",  "name": "Tax Master",       "desc": "Reach 2000 total score",         "threshold": 2000, "field": "total_score"},
]


def _compute_achievements(u: dict) -> list:
    unlocked = []
    for a in ACHIEVEMENTS:
        if u.get(a["field"], 0) >= a["threshold"]:
            unlocked.append(a["id"])
    return unlocked


# ---------- Health ----------
@api.get("/")
async def root():
    return {"app": "TaxMaster Pro", "status": "ok"}


@api.get("/achievements/list")
async def achievements_list():
    return {"achievements": ACHIEVEMENTS}


# ---------- Auth ----------
@api.post("/auth/register")
async def register(payload: RegisterIn, response: Response):
    email = payload.email.lower().strip()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    now = datetime.now(timezone.utc).isoformat()
    exp = (payload.experience or "beginner").lower()
    if exp not in {"beginner", "intermediate", "pro"}:
        exp = "beginner"
    doc = {
        "email": email,
        "password_hash": hash_password(payload.password),
        "name": payload.name.strip(),
        "role": "user",
        "age": payload.age,
        "experience": exp,
        "total_score": 0,
        "best_streak": 0,
        "current_streak": 0,
        "questions_answered": 0,
        "correct_answers": 0,
        "achievements": [],
        "created_at": now,
    }
    res = await db.users.insert_one(doc)
    uid = str(res.inserted_id)
    access = create_access_token(uid, email)
    refresh = create_refresh_token(uid)
    set_auth_cookies(response, access, refresh)
    doc["id"] = uid
    return _serialize_user(doc)


@api.post("/auth/login")
async def login(payload: LoginIn, response: Response):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    uid = str(user["_id"])
    access = create_access_token(uid, email)
    refresh = create_refresh_token(uid)
    set_auth_cookies(response, access, refresh)
    user["id"] = uid
    return _serialize_user(user)


@api.post("/auth/logout")
async def logout(response: Response, _u: dict = Depends(current_user)):
    clear_auth_cookies(response)
    return {"ok": True}


@api.get("/auth/me")
async def me(user: dict = Depends(current_user)):
    return _serialize_user(user)


@api.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    import jwt
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = jwt.decode(token, os.environ["JWT_SECRET"], algorithms=["HS256"])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Wrong token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        uid = str(user["_id"])
        new_access = create_access_token(uid, user["email"])
        response.set_cookie(
            key="access_token", value=new_access, httponly=True, secure=True,
            samesite="none", max_age=7 * 86400, path="/",
        )
        return {"ok": True}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


# ---------- Countries ----------
@api.get("/countries")
async def list_countries(search: str = "", region: str = ""):
    q: dict = {}
    if region:
        q["region"] = region
    docs = await db.countries.find(q).to_list(500)
    result = [_country_out(d) for d in docs]
    if search:
        s = search.lower()
        result = [c for c in result if s in c["key"].lower() or s in c.get("region", "").lower()]
    result.sort(key=lambda c: c["key"])
    return {"countries": result}


@api.get("/countries/{key}")
async def get_country(key: str):
    doc = await db.countries.find_one({"key": key})
    if not doc:
        raise HTTPException(status_code=404, detail="Country not found")
    return _country_out(doc)


@api.post("/countries")
async def create_country(payload: CountryIn, _admin: dict = Depends(admin_user)):
    if await db.countries.find_one({"key": payload.key}):
        raise HTTPException(status_code=400, detail="Country already exists")
    doc = payload.model_dump()
    await db.countries.insert_one(doc)
    return _country_out(doc)


@api.put("/countries/{key}")
async def update_country(key: str, payload: CountryIn, _admin: dict = Depends(admin_user)):
    doc = payload.model_dump()
    doc["key"] = key  # cannot rename via this endpoint
    res = await db.countries.update_one({"key": key}, {"$set": doc})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Country not found")
    return _country_out(doc)


@api.delete("/countries/{key}")
async def delete_country(key: str, _admin: dict = Depends(admin_user)):
    res = await db.countries.delete_one({"key": key})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Country not found")
    return {"ok": True}


# ---------- Quizzes ----------
@api.get("/quiz/indian")
async def get_indian_quiz():
    return {"quiz": INDIAN_QUIZ}


@api.get("/quiz/country/{key}")
async def get_country_quiz(key: str):
    doc = await db.countries.find_one({"key": key})
    if not doc:
        raise HTTPException(status_code=404, detail="Country not found")
    return {"quiz": doc.get("quiz", []), "key": key}


@api.post("/quiz/submit")
async def submit_quiz(payload: QuizSubmit, user: dict = Depends(current_user)):
    uid = ObjectId(user["id"])
    inc = {
        "total_score": payload.score * 10,
        "questions_answered": payload.total,
        "correct_answers": payload.score,
    }
    await db.users.update_one({"_id": uid}, {"$inc": inc})
    if payload.streak and payload.streak > 0:
        await db.users.update_one(
            {"_id": uid, "best_streak": {"$lt": payload.streak}},
            {"$set": {"best_streak": payload.streak, "current_streak": payload.streak}},
        )
        await db.users.update_one({"_id": uid}, {"$set": {"current_streak": payload.streak}})

    # log attempt
    await db.quiz_attempts.insert_one({
        "user_id": user["id"],
        "user_name": user.get("name", ""),
        "quiz_type": payload.quiz_type,
        "country_key": payload.country_key,
        "score": payload.score,
        "total": payload.total,
        "streak": payload.streak or 0,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    # recompute achievements
    fresh = await db.users.find_one({"_id": uid})
    unlocked = _compute_achievements(fresh)
    if set(unlocked) != set(fresh.get("achievements", [])):
        await db.users.update_one({"_id": uid}, {"$set": {"achievements": unlocked}})
        fresh["achievements"] = unlocked
    fresh["id"] = str(fresh["_id"])
    return _serialize_user(fresh)


@api.get("/leaderboard")
async def leaderboard(limit: int = Query(20, ge=1, le=100)):
    cursor = db.users.find(
        {"total_score": {"$gt": 0}},
        {"password_hash": 0},
    ).sort([("total_score", -1), ("best_streak", -1)]).limit(limit)
    users = []
    rank = 1
    async for u in cursor:
        users.append({
            "rank": rank,
            "name": u.get("name", "Anon"),
            "total_score": u.get("total_score", 0),
            "best_streak": u.get("best_streak", 0),
            "questions_answered": u.get("questions_answered", 0),
            "correct_answers": u.get("correct_answers", 0),
            "achievements": len(u.get("achievements", [])),
        })
        rank += 1
    return {"leaderboard": users}


@api.get("/user/history")
async def my_history(user: dict = Depends(current_user), limit: int = 20):
    cursor = db.quiz_attempts.find(
        {"user_id": user["id"]},
        {"_id": 0},
    ).sort("timestamp", -1).limit(limit)
    return {"history": await cursor.to_list(limit)}


# ---------- Chat ----------
@api.post("/chat/session")
async def chat_new_session(_u: dict = Depends(current_user)):
    return {"session_id": new_session_id()}


@api.post("/chat/stream")
async def chat_stream(payload: ChatIn, user: dict = Depends(current_user)):
    session_id = payload.session_id or new_session_id()
    # Persist the user message (fire and forget)
    await db.chat_messages.insert_one({
        "user_id": user["id"],
        "session_id": session_id,
        "role": "user",
        "content": payload.message[:4000],
        "country": payload.country,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })
    return StreamingResponse(
        stream_reply(session_id, payload.message, payload.country),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
            "X-Session-Id": session_id,
        },
    )


# ---------- Startup ----------
@app.on_event("startup")
async def _startup():
    await db.users.create_index("email", unique=True)
    await db.countries.create_index("key", unique=True)
    await db.quiz_attempts.create_index([("user_id", 1), ("timestamp", -1)])
    await db.chat_messages.create_index([("session_id", 1), ("timestamp", 1)])
    await seed_admin(db)

    # seed countries if empty
    count = await db.countries.count_documents({})
    if count == 0:
        await db.countries.insert_many([{**c} for c in COUNTRIES])
        logger.info("Seeded %d countries", len(COUNTRIES))


@app.on_event("shutdown")
async def _shutdown():
    client.close()


# ---------- CORS + Router ----------
app.include_router(api)

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
_origins = list({FRONTEND_URL, "http://localhost:3000"})
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Session-Id"],
)
