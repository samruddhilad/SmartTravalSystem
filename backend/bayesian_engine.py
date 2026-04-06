import json
import math
import random
from typing import Dict, List, Tuple, Any

# Load dataset
import os
DATA_PATH = os.path.join(os.path.dirname(__file__), 'data', 'travel_dataset.json')

with open(DATA_PATH, 'r', encoding='utf-8') as f:
    DATASET = json.load(f)

DESTINATIONS = {d['id']: d for d in DATASET['destinations']}
ACTIVITIES = {a['id']: a for a in DATASET['activities']}
WEATHER_PROFILES = DATASET['weather_profiles']
TRANSPORT_COSTS = DATASET['transport_costs']
ACCOMMODATION_COSTS = DATASET['accommodation_costs']


# ─────────────────────────────────────────────────────────────────────────────
# 1.  CONDITIONAL PROBABILITY TABLES  (hand-crafted Bayesian CPTs)
# ─────────────────────────────────────────────────────────────────────────────

# P(destination_type | mood)
P_TYPE_GIVEN_MOOD = {
    "relaxed":    {"beach": 0.45, "nature": 0.25, "hill_station": 0.15, "mountain": 0.10, "spiritual": 0.05},
    "adventure":  {"mountain": 0.40, "nature": 0.25, "beach": 0.20, "spiritual": 0.10, "hill_station": 0.05},
    "romantic":   {"hill_station": 0.35, "beach": 0.30, "nature": 0.20, "mountain": 0.10, "spiritual": 0.05},
    "spiritual":  {"spiritual": 0.55, "mountain": 0.20, "nature": 0.15, "hill_station": 0.05, "beach": 0.05},
    "cultural":   {"spiritual": 0.30, "hill_station": 0.25, "nature": 0.20, "beach": 0.15, "mountain": 0.10},
    "fun":        {"beach": 0.50, "nature": 0.20, "mountain": 0.15, "hill_station": 0.10, "spiritual": 0.05},
    "reflective": {"spiritual": 0.40, "mountain": 0.30, "nature": 0.20, "hill_station": 0.10, "beach": 0.00},
}

# P(budget_ok | destination, budget_tier)
P_BUDGET = {
    "budget":  {"budget": 1.0, "mid": 0.5, "luxury": 0.1},
    "mid":     {"budget": 0.8, "mid": 1.0, "luxury": 0.4},
    "luxury":  {"budget": 0.5, "mid": 0.8, "luxury": 1.0},
}

# P(destination_ok | weather)  — weather affinity per destination type
P_WEATHER = {
    "sunny":  {"beach": 1.0, "nature": 0.7, "hill_station": 0.5, "mountain": 0.3, "spiritual": 0.6},
    "cold":   {"mountain": 0.9, "hill_station": 0.7, "spiritual": 0.4, "nature": 0.5, "beach": 0.1},
    "rainy":  {"nature": 0.7, "spiritual": 0.5, "hill_station": 0.6, "mountain": 0.4, "beach": 0.2},
    "warm":   {"beach": 0.9, "nature": 0.7, "spiritual": 0.6, "hill_station": 0.5, "mountain": 0.3},
    "cool":   {"mountain": 0.8, "hill_station": 0.9, "nature": 0.7, "spiritual": 0.5, "beach": 0.2},
    "humid":  {"beach": 0.7, "nature": 0.8, "spiritual": 0.4, "hill_station": 0.5, "mountain": 0.3},
}

# P(group_compatible | destination_type, group_type)
P_GROUP = {
    "solo":      {"mountain": 0.9, "spiritual": 0.95, "nature": 0.8, "beach": 0.7, "hill_station": 0.75},
    "couple":    {"hill_station": 0.95, "beach": 0.9, "nature": 0.85, "mountain": 0.7, "spiritual": 0.6},
    "family":    {"beach": 0.85, "nature": 0.8, "hill_station": 0.75, "spiritual": 0.7, "mountain": 0.5},
    "friends":   {"beach": 0.95, "mountain": 0.85, "nature": 0.8, "hill_station": 0.7, "spiritual": 0.5},
    "corporate": {"nature": 0.7, "hill_station": 0.75, "beach": 0.65, "mountain": 0.6, "spiritual": 0.4},
}


# ─────────────────────────────────────────────────────────────────────────────
# 2.  CORE INFERENCE ENGINE
# ─────────────────────────────────────────────────────────────────────────────

def normalize(scores: Dict[str, float]) -> Dict[str, float]:
    """Normalize a score dictionary to sum to 1.0."""
    total = sum(scores.values())
    if total == 0:
        n = len(scores)
        return {k: 1.0 / n for k in scores}
    return {k: v / total for k, v in scores.items()}


def get_budget_tier(budget_inr: int) -> str:
    if budget_inr < 15000:
        return "budget"
    elif budget_inr < 50000:
        return "mid"
    return "luxury"


def infer_destination(
    mood: str,
    budget_inr: int,
    weather: str,
    group_type: str,
    interests: List[str],
) -> Tuple[str, Dict[str, float]]:
    """
    Bayesian inference:  P(dest | mood, budget, weather, group) ∝
        P(type|mood) × P(budget_ok|dest,budget_tier) × P(weather|dest,type) × P(group|type)
    Returns best destination id and full probability distribution.
    """
    budget_tier = get_budget_tier(budget_inr)
    type_dist   = P_TYPE_GIVEN_MOOD.get(mood, P_TYPE_GIVEN_MOOD["relaxed"])
    weather_cpt = P_WEATHER.get(weather, P_WEATHER["warm"])
    group_cpt   = P_GROUP.get(group_type, P_GROUP["solo"])

    dest_scores: Dict[str, float] = {}

    for dest_id, dest in DESTINATIONS.items():
        dtype = dest['type']
        # Check budget availability
        if not dest['budget_tiers'].get(budget_tier, False):
            p_budget = 0.15          # very low but not zero (flexibility)
        else:
            p_budget = 1.0

        p_type    = type_dist.get(dtype, 0.05)
        p_weather = weather_cpt.get(dtype, 0.3)
        p_group   = group_cpt.get(dtype, 0.5)

        # Interest bonus: if any user interest matches destination tags
        interest_bonus = 1.0
        for interest in interests:
            if interest.lower() in [t.lower() for t in dest['tags']]:
                interest_bonus += 0.15
        interest_bonus = min(interest_bonus, 2.0)

        # Joint posterior (log-space to avoid underflow, convert back)
        log_p = (
            math.log(p_type + 1e-9) +
            math.log(p_budget + 1e-9) +
            math.log(p_weather + 1e-9) +
            math.log(p_group + 1e-9) +
            math.log(interest_bonus)
        )
        dest_scores[dest_id] = math.exp(log_p)

    normalized = normalize(dest_scores)
    best_dest  = max(normalized, key=normalized.get)
    return best_dest, normalized


def infer_activities(
    dest_id: str,
    interests: List[str],
    weather: str,
    mood: str,
    duration_days: int,
) -> List[Dict]:
    """
    Select activities: P(activity | destination, interest, weather)
    Returns ranked activity list with probability scores.
    """
    weather_ok = WEATHER_PROFILES.get(weather, {}).get('suitable_activities', list(ACTIVITIES.keys()))
    weather_bad = WEATHER_PROFILES.get(weather, {}).get('unsuitable_activities', [])

    scored = []
    for act_id, act in ACTIVITIES.items():
        if dest_id not in act['destination_ids']:
            continue
        if act_id in weather_bad:
            continue

        score = 0.3  # base probability
        if weather and act['weather_suitable'] and any(w in act['weather_suitable'] for w in [weather]):
            score += 0.25
        if mood in act['mood_tags']:
            score += 0.3
        for interest in interests:
            if interest.lower() in [t.lower() for t in act['interest_tags']]:
                score += 0.15

        scored.append({**act, '_score': min(score, 1.0)})

    scored.sort(key=lambda x: x['_score'], reverse=True)

    # Distribute across days: 3 activities per day (morning/afternoon/evening)
    slots_needed = duration_days * 3
    return scored[:min(slots_needed, len(scored))]


# ─────────────────────────────────────────────────────────────────────────────
# 3.  COMPATIBILITY SCORE  (Jaccard-based)
# ─────────────────────────────────────────────────────────────────────────────

def calculate_compatibility(user_interests: List[str], activities: List[Dict]) -> int:
    """Return 0-100 compatibility score using Jaccard similarity."""
    all_activity_tags = set()
    for act in activities:
        all_activity_tags.update(t.lower() for t in act.get('interest_tags', []))

    user_set = set(i.lower() for i in user_interests)
    if not user_set or not all_activity_tags:
        return 50

    intersection = user_set & all_activity_tags
    union        = user_set | all_activity_tags
    jaccard      = len(intersection) / len(union)

    # Scale to 50-100 range (even poor matches get at least 50%)
    return int(50 + jaccard * 50)


# ─────────────────────────────────────────────────────────────────────────────
# 4.  BUDGET SPLIT
# ─────────────────────────────────────────────────────────────────────────────

def calculate_budget_split(
    budget_inr: int,
    transport: str,
    accommodation: str,
    duration_days: int,
    activities: List[Dict],
) -> Dict[str, int]:
    t_info = TRANSPORT_COSTS.get(transport, TRANSPORT_COSTS['train'])
    a_info = ACCOMMODATION_COSTS.get(accommodation, ACCOMMODATION_COSTS['hotel_3star'])

    transport_cost    = int(budget_inr * t_info['budget_multiplier'])
    accommodation_cost = int(budget_inr * a_info['budget_multiplier'] * duration_days / 5)
    activity_cost     = sum(act.get('cost_inr', 0) for act in activities[:6])
    food_cost         = int(800 * duration_days)   # ₹800/day baseline
    shopping_budget   = max(0, budget_inr - transport_cost - accommodation_cost - activity_cost - food_cost)
    shopping_cost     = min(shopping_budget, int(budget_inr * 0.10))

    return {
        "transport":    transport_cost,
        "accommodation": accommodation_cost,
        "food":         food_cost,
        "activities":   activity_cost,
        "shopping":     shopping_cost,
        "total":        transport_cost + accommodation_cost + food_cost + activity_cost + shopping_cost,
    }


# ─────────────────────────────────────────────────────────────────────────────
# 5.  ITINERARY GENERATOR
# ─────────────────────────────────────────────────────────────────────────────

def generate_itinerary(
    dest_id: str,
    activities: List[Dict],
    duration_days: int,
    budget_split: Dict[str, int],
) -> List[Dict]:
    dest       = DESTINATIONS[dest_id]
    day_budget = budget_split['total'] / max(duration_days, 1)

    # Slot activities into morning/afternoon/evening
    morning    = [a for a in activities if a.get('time_slot') in ('morning', 'full_day')]
    afternoon  = [a for a in activities if a.get('time_slot') in ('afternoon', 'full_day')]
    evening    = [a for a in activities if a.get('time_slot') in ('evening', 'full_day')]

    # Fill gaps with cross-slot activities
    all_acts = list(activities)
    itinerary = []

    for day in range(1, duration_days + 1):
        idx = (day - 1)

        def pick(pool, fallback):
            if idx < len(pool):
                return pool[idx]
            if idx < len(fallback):
                return fallback[idx]
            return fallback[0] if fallback else None

        am_act  = pick(morning, all_acts)
        pm_act  = pick(afternoon, all_acts)
        eve_act = pick(evening, all_acts)

        # Avoid duplicates within the same day
        used = set()
        day_acts = []
        for act in [am_act, pm_act, eve_act]:
            if act and act['id'] not in used:
                day_acts.append(act)
                used.add(act['id'])

        itinerary.append({
            "day": day,
            "theme": _day_theme(day, dest),
            "morning":   _format_slot(day_acts[0] if len(day_acts) > 0 else None, "09:00"),
            "afternoon": _format_slot(day_acts[1] if len(day_acts) > 1 else None, "13:00"),
            "evening":   _format_slot(day_acts[2] if len(day_acts) > 2 else None, "18:00"),
            "day_budget": int(day_budget),
        })

    return itinerary


def _day_theme(day: int, dest: Dict) -> str:
    themes = [
        f"Arrival & First Impressions of {dest['name']}",
        f"Exploring the Heart of {dest['name']}",
        f"Hidden Corners & Local Life",
        f"Adventure Day",
        f"Relaxation & Rejuvenation",
        f"Culture & Cuisine",
        f"Farewell & Last Memories",
    ]
    return themes[min(day - 1, len(themes) - 1)]


def _format_slot(act: Dict | None, start_time: str) -> Dict:
    if not act:
        return {"activity": "Free time / Leisure", "time": start_time, "duration": "2 hours", "cost": 0, "type": "leisure"}
    return {
        "activity": act['name'],
        "time":     start_time,
        "duration": f"{act.get('duration_hours', 2)} hours",
        "cost":     act.get('cost_inr', 0),
        "type":     act.get('type', 'leisure'),
        "energy":   act.get('energy_level', 'medium'),
    }


# ─────────────────────────────────────────────────────────────────────────────
# 6.  HIDDEN GEMS
# ─────────────────────────────────────────────────────────────────────────────

def recommend_hidden_gems(mood: str, budget_inr: int, top_n: int = 3) -> List[Dict]:
    gems = DATASET['hidden_gems']
    scored = []
    for gem in gems:
        score = (1 - gem['popularity_score']) * 0.4 + gem['uniqueness_value'] * 0.4
        if mood in gem.get('mood_match', []):
            score += 0.2
        if gem['avg_cost_per_day'] * 3 <= budget_inr * 0.5:
            score += 0.1
        scored.append({**gem, '_score': score})
    scored.sort(key=lambda x: x['_score'], reverse=True)
    return scored[:top_n]


# ─────────────────────────────────────────────────────────────────────────────
# 7.  PACKING LIST
# ─────────────────────────────────────────────────────────────────────────────

def generate_packing_list(dest_type: str, weather: str, activity_types: List[str]) -> Dict[str, List[str]]:
    templates = DATASET['packing_templates']
    common    = templates.get('common', [])
    dest_pack = templates.get(dest_type, [])
    weather_pack = WEATHER_PROFILES.get(weather, {}).get('packing_extras', [])

    activity_pack = []
    for atype in set(activity_types):
        if atype == 'outdoor':
            activity_pack += ["comfortable_shoes", "insect_repellent", "sunscreen"]
        elif atype == 'cultural':
            activity_pack += ["modest_clothing", "camera", "small_notebook"]
        elif atype == 'wellness':
            activity_pack += ["yoga_mat", "essential_oils", "comfortable_loungewear"]

    return {
        "essentials":  list(set(common)),
        "destination": list(set(dest_pack)),
        "weather":     list(set(weather_pack)),
        "activities":  list(set(activity_pack)),
    }


# ─────────────────────────────────────────────────────────────────────────────
# 8.  ALTERNATIVE PLAN
# ─────────────────────────────────────────────────────────────────────────────

def generate_alternative_plan(
    original_dest_id: str,
    mood: str,
    budget_inr: int,
    weather: str,
    group_type: str,
    interests: List[str],
    duration_days: int,
    reason: str = "weather_change",
) -> Dict:
    """Generate Plan B with a different destination."""
    _, all_scores = infer_destination(mood, budget_inr, weather, group_type, interests)

    # Pick second-best destination
    sorted_dests = sorted(all_scores.items(), key=lambda x: x[1], reverse=True)
    alt_dest_id  = None
    for did, _ in sorted_dests:
        if did != original_dest_id:
            alt_dest_id = did
            break

    if not alt_dest_id:
        alt_dest_id = list(DESTINATIONS.keys())[0]

    alt_activities = infer_activities(alt_dest_id, interests, weather, mood, duration_days)
    alt_budget     = calculate_budget_split(budget_inr, 'train', 'guesthouse', duration_days, alt_activities)
    alt_itinerary  = generate_itinerary(alt_dest_id, alt_activities, duration_days, alt_budget)

    return {
        "reason":      reason,
        "destination": DESTINATIONS[alt_dest_id],
        "itinerary":   alt_itinerary,
        "budget_split": alt_budget,
        "note":        f"Plan B selected due to {reason.replace('_',' ')}. {DESTINATIONS[alt_dest_id]['name']} is an excellent alternative.",
    }


# ─────────────────────────────────────────────────────────────────────────────
# 9.  MAIN PLANNER FUNCTION
# ─────────────────────────────────────────────────────────────────────────────

def plan_itinerary(preferences: Dict) -> Dict[str, Any]:
    mood          = preferences.get('mood', 'relaxed')
    budget_inr    = int(preferences.get('budget', 30000))
    weather       = preferences.get('weather', 'warm')
    group_type    = preferences.get('group_type', 'solo')
    interests     = preferences.get('interests', [])
    duration_days = int(preferences.get('duration_days', 5))
    transport     = preferences.get('transport', 'train')
    accommodation = preferences.get('accommodation', 'hotel_3star')
    start_date    = preferences.get('start_date', '')
    end_date      = preferences.get('end_date', '')

    # Step 1: Bayesian destination inference
    best_dest_id, dest_scores = infer_destination(mood, budget_inr, weather, group_type, interests)
    best_dest     = DESTINATIONS[best_dest_id]
    best_prob     = dest_scores[best_dest_id]

    # Step 2: Activity selection
    activities = infer_activities(best_dest_id, interests, weather, mood, duration_days)

    # Step 3: Compatibility score
    compatibility = calculate_compatibility(interests, activities)

    # Step 4: Budget split
    budget_split  = calculate_budget_split(budget_inr, transport, accommodation, duration_days, activities)

    # Step 5: Itinerary generation
    itinerary     = generate_itinerary(best_dest_id, activities, duration_days, budget_split)

    # Step 6: Hidden gems
    hidden_gems   = recommend_hidden_gems(mood, budget_inr)

    # Step 7: Packing list
    activity_types = list(set(a.get('type', 'leisure') for a in activities))
    packing_list  = generate_packing_list(best_dest['type'], weather, activity_types)

    # Step 8: Alternative plan (Plan B)
    alt_plan      = generate_alternative_plan(
        best_dest_id, mood, budget_inr, weather, group_type, interests, duration_days
    )

    # Destination probability ranking (top 5)
    top_destinations = sorted(dest_scores.items(), key=lambda x: x[1], reverse=True)[:5]
    dest_ranking = [
        {
            "id":          did,
            "name":        DESTINATIONS[did]['name'],
            "probability": round(prob * 100, 1),
            "type":        DESTINATIONS[did]['type'],
        }
        for did, prob in top_destinations
    ]

    return {
        "destination":        best_dest,
        "probability_score":  round(best_prob * 100, 1),
        "dest_ranking":       dest_ranking,
        "compatibility_score": compatibility,
        "activities":         activities,
        "itinerary":          itinerary,
        "budget_split":       budget_split,
        "hidden_gems":        hidden_gems,
        "packing_list":       packing_list,
        "alternative_plan":   alt_plan,
        "user_preferences":   preferences,
        "trip_summary": {
            "destination":     best_dest['name'],
            "duration":        f"{duration_days} Days",
            "total_budget":    f"₹{budget_inr:,}",
            "estimated_spend": f"₹{budget_split['total']:,}",
            "start_date":      start_date,
            "end_date":        end_date,
            "group_type":      group_type.title(),
            "transport":       transport.title(),
            "accommodation":   accommodation.replace('_', ' ').title(),
        }
    }
