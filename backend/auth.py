"""
auth.py — JWT Authentication router for FastAPI
User store: users.json (JSON file, no DB required)
"""

import json
import uuid
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
import jwt

# ── Config ──────────────────────────────────────────────────────────────────
SECRET_KEY = os.getenv("JWT_SECRET", "voyager-ai-super-secret-key-change-in-prod")
ALGORITHM  = "HS256"
TOKEN_EXPIRE_HOURS = 24 * 7   # 7 days

USERS_FILE = Path(__file__).parent / "users.json"

# ── Helpers ──────────────────────────────────────────────────────────────────
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer  = HTTPBearer(auto_error=False)

router = APIRouter(prefix="/api/auth", tags=["auth"])


# ── Pydantic models ───────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    email: str
    password: str
    first_name: str = ""
    last_name: str  = ""


class LoginRequest(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    trips_count: int
    avatar_initials: str
    created_at: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ── File helpers ───────────────────────────────────────────────────────────────
def _load_users() -> list[dict]:
    if not USERS_FILE.exists():
        return []
    with open(USERS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_users(users: list[dict]) -> None:
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2)


def _find_user_by_email(email: str) -> Optional[dict]:
    for u in _load_users():
        if u["email"].lower() == email.lower():
            return u
    return None


# ── JWT helpers ────────────────────────────────────────────────────────────────
def _create_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRE_HOURS)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def _decode_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except jwt.PyJWTError:
        return None


def _user_to_out(u: dict) -> UserOut:
    initials = (u.get("first_name","?")[:1] + u.get("last_name","?")[:1]).upper() or "VU"
    return UserOut(
        id=u["id"],
        email=u["email"],
        first_name=u.get("first_name", ""),
        last_name=u.get("last_name", ""),
        trips_count=u.get("trips_count", 0),
        avatar_initials=initials,
        created_at=u.get("created_at", ""),
    )


# ── Dependency: get current user ───────────────────────────────────────────────
def get_current_user(creds: Optional[HTTPAuthorizationCredentials] = Depends(bearer)) -> dict:
    if not creds:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user_id = _decode_token(creds.credentials)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    for u in _load_users():
        if u["id"] == user_id:
            return u
    raise HTTPException(status_code=401, detail="User not found")


# ── Routes ─────────────────────────────────────────────────────────────────────
@router.post("/register", response_model=TokenResponse)
def register(body: RegisterRequest):
    if _find_user_by_email(body.email):
        raise HTTPException(status_code=409, detail="Email already registered")

    if len(body.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    users = _load_users()
    fn = body.first_name.strip()
    ln = body.last_name.strip()
    new_user = {
        "id": str(uuid.uuid4()),
        "email": body.email.lower().strip(),
        "first_name": fn,
        "last_name": ln,
        "password_hash": pwd_ctx.hash(body.password),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "trips_count": 0,
        "avatar_initials": ((fn[:1] + ln[:1]) or "VU").upper(),
    }
    users.append(new_user)
    _save_users(users)

    token = _create_token(new_user["id"])
    return TokenResponse(access_token=token, user=_user_to_out(new_user))


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest):
    user = _find_user_by_email(body.email)
    if not user or not pwd_ctx.verify(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = _create_token(user["id"])
    return TokenResponse(access_token=token, user=_user_to_out(user))


@router.get("/me", response_model=UserOut)
def me(current_user: dict = Depends(get_current_user)):
    return _user_to_out(current_user)
