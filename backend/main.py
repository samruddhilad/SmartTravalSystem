"""
main.py — FastAPI entry point (replaces Flask app.py)
All original routes preserved with identical behavior.
Triggering hot reload to load new dataset!
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

from bayesian_engine import plan_itinerary, DESTINATIONS, DATASET, recommend_hidden_gems, generate_packing_list, generate_alternative_plan
from auth import router as auth_router, get_current_user_optional, get_current_user, _load_users, _save_users
from fastapi import Depends
import json
from pathlib import Path
import os
import uuid
import time
from datetime import datetime

TRIPS_FILE = Path(__file__).parent / "trips.json"

def _load_trips() -> list:
    if not TRIPS_FILE.exists():
        return []
    with open(TRIPS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def _save_trips(trips: list):
    with open(TRIPS_FILE, "w", encoding="utf-8") as f:
        json.dump(trips, f, indent=2)

# ── App ────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Voyager AI — Smart Travel Planner API",
    description="Bayesian Network powered travel itinerary generator",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include auth router
app.include_router(auth_router)


# ── Pydantic models ────────────────────────────────────────────────────────────
class ItineraryRequest(BaseModel):
    mood: str
    budget: float
    weather: str
    group_type: str
    duration_days: int
    interests: Optional[List[str]] = []
    transport: Optional[str] = "train"
    accommodation: Optional[str] = "hotel_3star"
    start_date: Optional[str] = ""
    end_date: Optional[str] = ""


class PackingRequest(BaseModel):
    dest_type: Optional[str] = "nature"
    weather: Optional[str] = "warm"
    activity_types: Optional[List[str]] = []


class AlternativePlanRequest(BaseModel):
    original_dest_id: Optional[str] = ""
    mood: Optional[str] = "relaxed"
    budget: Optional[float] = 30000
    weather: Optional[str] = "warm"
    group_type: Optional[str] = "solo"
    interests: Optional[List[str]] = []
    duration_days: Optional[int] = 5
    reason: Optional[str] = "weather_change"


# ── Routes ─────────────────────────────────────────────────────────────────────
@app.get("/api/health")
def health():
    return {"status": "ok", "service": "Voyager AI — Smart Travel Planner API v2"}


@app.post("/api/generate-itinerary")
def generate_itinerary(prefs: ItineraryRequest, current_user: dict = Depends(get_current_user_optional)):
    try:
        result = plan_itinerary(prefs.model_dump())
        
        if current_user:
            result['id'] = str(uuid.uuid4())
            result['created_at'] = datetime.now().isoformat()
            trips = _load_trips()
            trips.append({"user_id": current_user["id"], "trip": result})
            _save_trips(trips)
            
            # update user trip count
            users = _load_users()
            for u in users:
                if u["id"] == current_user["id"]:
                    u["trips_count"] = u.get("trips_count", 0) + 1
                    break
            _save_users(users)
        
        return {"success": True, "data": result}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/trips")
def get_trips(current_user: dict = Depends(get_current_user)):
    user_trips = [t["trip"] for t in _load_trips() if t["user_id"] == current_user["id"]]
    # Sort by created_at descending if available
    user_trips.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return {"trips": user_trips}


@app.get("/api/destinations")
def get_destinations(
    mood: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
):
    dests = list(DESTINATIONS.values())
    if mood:
        dests = [d for d in dests if mood in d.get("mood_match", [])]
    if type:
        dests = [d for d in dests if d.get("type") == type]
    return {"destinations": dests}


@app.get("/api/hidden-gems")
def get_hidden_gems(
    mood: str = Query("relaxed"),
    budget: int = Query(30000),
):
    gems = recommend_hidden_gems(mood, budget)
    return {"hidden_gems": gems}


@app.post("/api/packing-list")
def get_packing_list(body: PackingRequest):
    result = generate_packing_list(
        body.dest_type,
        body.weather,
        body.activity_types,
    )
    return {"packing_list": result}


@app.post("/api/alternative-plan")
def get_alternative_plan(body: AlternativePlanRequest):
    result = generate_alternative_plan(
        body.original_dest_id,
        body.mood,
        int(body.budget),
        body.weather,
        body.group_type,
        body.interests,
        body.duration_days,
        body.reason,
    )
    return {"success": True, "data": result}


@app.get("/api/dataset/moods")
def get_moods():
    moods = [
        {"id": "relaxed",    "label": "Relaxed",    "emoji": "😌", "color": "#FFB3D9"},
        {"id": "adventure",  "label": "Adventure",  "emoji": "🏔️", "color": "#B3D9FF"},
        {"id": "romantic",   "label": "Romantic",   "emoji": "💕", "color": "#FFB3E6"},
        {"id": "spiritual",  "label": "Spiritual",  "emoji": "🙏", "color": "#FFD9B3"},
        {"id": "cultural",   "label": "Cultural",   "emoji": "🎭", "color": "#C5B3FF"},
        {"id": "fun",        "label": "Fun",        "emoji": "🎉", "color": "#B3FFE8"},
        {"id": "reflective", "label": "Reflective", "emoji": "🌙", "color": "#D9B3FF"},
    ]
    return {"moods": moods}


@app.get("/api/dataset/interests")
def get_interests():
    interests = [
        "beaches", "trekking", "temples", "water_sports", "nightlife",
        "food", "culture", "history", "nature", "photography",
        "yoga", "adventure", "wildlife", "heritage", "camping",
        "backwaters", "monasteries", "ayurveda", "cycling", "birdwatching",
    ]
    return {"interests": interests}


# ── Entry ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("🌸 Voyager AI FastAPI starting on http://localhost:8000")
    print("📚 API Docs: http://localhost:8000/docs")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
