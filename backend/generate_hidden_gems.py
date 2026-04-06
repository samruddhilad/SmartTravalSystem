import json
import os
import random

DATA_PATH = os.path.join(os.path.dirname(__file__), 'data', 'travel_dataset.json')

with open(DATA_PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

dests = data.get('destinations', [])
hidden_gems = []

# Generate 3 hidden gems for each destination
for dest in dests:
    did = dest['id']
    dname = dest['name']
    dtype = dest['type']
    
    prefixes = ["Secret", "Hidden", "Locals Only", "Quiet", "Untouched", "Forgotten"]
    suffixes = ["Spot", "Viewpoint", "Eatery", "Cafe", "Trail", "Cove", "Ruins", "Village"]
    
    if dtype == "beach":
        suffixes = ["Cove", "Beach", "Shack", "Lagoon", "Island"]
    elif dtype == "mountain" or dtype == "hill_station":
        suffixes = ["Viewpoint", "Meadow", "Hamlet", "Trail", "Peak"]
    elif dtype == "heritage":
        suffixes = ["Ruins", "Temple", "Bazaar", "Stepwell"]
        
    for i in range(3):
        gem_name = f"{random.choice(prefixes)} {random.choice(suffixes)} in {dname}"
        
        hidden_gems.append({
            "id": f"{did}_gem_{i}",
            "dest_id": did,
            "name": gem_name,
            "state": f"Near {dname}",
            "avg_cost_per_day": random.randint(500, 1500),
            "popularity_score": random.uniform(0.1, 0.4),
            "uniqueness_value": random.uniform(0.8, 0.99),
            "mood_match": dest['mood_match'] + ["reflective"],
            "best_for": ["photography", "peace", "culture"],
            "description": f"A deeply local, off-the-beaten-path experience hidden away from the main tourist hubs of {dname}. Perfect for authentic exploration."
        })

data['hidden_gems'] = hidden_gems

with open(DATA_PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print(f"Generated {len(hidden_gems)} destination-specific hidden gems.")
