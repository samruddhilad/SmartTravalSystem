import json
import os
import random

DATA_PATH = os.path.join(os.path.dirname(__file__), 'data', 'travel_dataset.json')

with open(DATA_PATH, 'r', encoding='utf-8') as f:
    orig_data = json.load(f)

# Define 30 destinations
new_destinations = [
    # Beaches
    {"id":"goa", "name":"Goa", "type":"beach", "mood_match":["relaxed","adventure","romantic","fun"], "weather_types":["sunny","humid","tropical","warm"], "tags":["beaches","nightlife","water_sports"], "cost":2500, "pop":0.95, "unique":0.6, "lat":15.2993, "lon":74.1240, "desc":"India's party capital with golden sandy beaches."},
    {"id":"andaman", "name":"Andaman Islands", "type":"beach", "mood_match":["romantic","adventure","relaxed"], "weather_types":["sunny","tropical","humid"], "tags":["scuba_diving","beaches","water_sports"], "cost":3500, "pop":0.8, "unique":0.9, "lat":11.7401, "lon":92.6586, "desc":"Pristine waters and coral reefs."},
    {"id":"havelock", "name":"Havelock Island", "type":"beach", "mood_match":["romantic","relaxed","reflective"], "weather_types":["sunny","tropical"], "tags":["beaches","scuba_diving","peaceful"], "cost":4000, "pop":0.75, "unique":0.95, "lat":11.9761, "lon":92.9876, "desc":"Crystal clear waters and white sands."},
    {"id":"gokarna", "name":"Gokarna", "type":"beach", "mood_match":["spiritual","relaxed","adventure"], "weather_types":["sunny","warm","humid"], "tags":["beaches","temples","trekking","peaceful"], "cost":1500, "pop":0.7, "unique":0.8, "lat":14.5398, "lon":74.3182, "desc":"Hippie vibe beaches and religious temples."},
    {"id":"varkala", "name":"Varkala", "type":"beach", "mood_match":["relaxed","spiritual","reflective"], "weather_types":["sunny","warm","humid"], "tags":["beaches","cliff","ayurveda","yoga"], "cost":1800, "pop":0.65, "unique":0.85, "lat":8.7302, "lon":76.7114, "desc":"Cliffs adjacent to the Arabian Sea."},
    {"id":"pondicherry", "name":"Pondicherry", "type":"beach", "mood_match":["cultural","relaxed","romantic"], "weather_types":["sunny","warm","humid"], "tags":["french_culture","beaches","yoga"], "cost":2200, "pop":0.85, "unique":0.8, "lat":11.9416, "lon":79.8083, "desc":"French colonial charm on the Bay of Bengal."},
    
    # Mountain
    {"id":"manali", "name":"Manali", "type":"mountain", "mood_match":["adventure","romantic","fun"], "weather_types":["cold","snowy","cool"], "tags":["trekking","snow","camping","adventure"], "cost":2000, "pop":0.9, "unique":0.7, "lat":32.2396, "lon":77.1887, "desc":"High-altitude Himalayan resort town."},
    {"id":"kullu", "name":"Kullu", "type":"mountain", "mood_match":["adventure","nature","relaxed"], "weather_types":["cold","cool"], "tags":["river_rafting","nature","temples"], "cost":1800, "pop":0.8, "unique":0.7, "lat":31.9579, "lon":77.1095, "desc":"Valley of Gods covered in pine."},
    {"id":"ladakh", "name":"Ladakh", "type":"mountain", "mood_match":["adventure","spiritual","reflective"], "weather_types":["cold","dry","harsh"], "tags":["high_altitude","monasteries","road_trip","photography"], "cost":3000, "pop":0.8, "unique":0.95, "lat":34.1526, "lon":77.5771, "desc":"Vast desert mountains and ancient monasteries."},
    {"id":"spiti", "name":"Spiti Valley", "type":"mountain", "mood_match":["adventure","reflective","spiritual"], "weather_types":["cold","dry","harsh"], "tags":["monasteries","camping","road_trip"], "cost":2500, "pop":0.6, "unique":0.98, "lat":32.2524, "lon":78.1122, "desc":"Rugged cold desert and ancient Buddhist culture."},
    {"id":"auli", "name":"Auli", "type":"mountain", "mood_match":["adventure","romantic"], "weather_types":["cold","snowy"], "tags":["skiing","snow","mountain_view"], "cost":2800, "pop":0.5, "unique":0.9, "lat":30.5363, "lon":79.5701, "desc":"Premier skiing destination in India."},
    {"id":"tawang", "name":"Tawang", "type":"mountain", "mood_match":["spiritual","adventure","nature"], "weather_types":["cold","cool"], "tags":["monasteries","nature","waterfalls"], "cost":2200, "pop":0.4, "unique":0.95, "lat":27.5861, "lon":91.8602, "desc":"Hidden mountain beauty in the Northeast."},
    
    # Nature / Wildlife
    {"id":"kerala_backwaters","name":"Alleppey","type":"nature","mood_match":["relaxed","romantic","reflective"],"weather_types":["humid","warm","rainy"],"tags":["houseboat","backwaters","nature"],"cost":3500,"pop":0.85,"unique":0.9,"lat":9.4981,"lon":76.3388,"desc":"Serene backwaters and houseboat living."},
    {"id":"coorg", "name":"Coorg", "type":"nature", "mood_match":["relaxed","nature","romantic"], "weather_types":["cool","misty","rainy"], "tags":["coffee_estates","waterfalls","trekking"], "cost":2200, "pop":0.8, "unique":0.75, "lat":12.3375, "lon":75.8069, "desc":"The Scotland of India with lush coffee plantations."},
    {"id":"jim_corbett", "name":"Jim Corbett", "type":"nature", "mood_match":["adventure","nature","family"], "weather_types":["warm","cool","sunny"], "tags":["wildlife","safari","nature"], "cost":3500, "pop":0.8, "unique":0.8, "lat":29.5300, "lon":78.7747, "desc":"Oldest national park known for Bengal Tigers."},
    {"id":"kaziranga", "name":"Kaziranga", "type":"nature", "mood_match":["adventure","nature"], "weather_types":["warm","humid"], "tags":["wildlife","safari"], "cost":2800, "pop":0.6, "unique":0.95, "lat":26.5775, "lon":93.1711, "desc":"Home of the one-horned rhinoceros."},
    {"id":"ranthambore", "name":"Ranthambore", "type":"nature", "mood_match":["adventure","nature","history"], "weather_types":["sunny","hot","warm"], "tags":["wildlife","safari","history"], "cost":4000, "pop":0.75, "unique":0.85, "lat":26.0173, "lon":76.5026, "desc":"Famous tiger reserve with a historic fort."},
    {"id":"sunderbans", "name":"Sunderbans", "type":"nature", "mood_match":["adventure","nature"], "weather_types":["humid","rainy","warm"], "tags":["wildlife","mangrove","boat_safari"], "cost":2000, "pop":0.5, "unique":0.98, "lat":21.9497, "lon":89.1833, "desc":"Largest mangrove forest, home to the Royal Bengal Tiger."},
    
    # Spiritual & Heritage
    {"id":"varanasi", "name":"Varanasi", "type":"spiritual", "mood_match":["spiritual","cultural","reflective"], "weather_types":["hot","warm","sunny"], "tags":["temples","ghats","history"], "cost":1500, "pop":0.85, "unique":0.95, "lat":25.3176, "lon":82.9739, "desc":"Spiritual capital of India."},
    {"id":"rishikesh", "name":"Rishikesh", "type":"spiritual", "mood_match":["spiritual","adventure","wellness"], "weather_types":["warm","cool"], "tags":["yoga","temples","river_rafting"], "cost":1200, "pop":0.88, "unique":0.85, "lat":30.0869, "lon":78.2676, "desc":"Yoga capital of the world."},
    {"id":"amritsar", "name":"Amritsar", "type":"spiritual", "mood_match":["spiritual","cultural","food"], "weather_types":["hot","cold","sunny"], "tags":["temples","food","history"], "cost":1800, "pop":0.8, "unique":0.9, "lat":31.6340, "lon":74.8723, "desc":"Home to the glorious Golden Temple."},
    {"id":"hampi", "name":"Hampi", "type":"heritage", "mood_match":["cultural","adventure","reflective"], "weather_types":["hot","sunny"], "tags":["history","ruins","photography","bouldering"], "cost":1400, "pop":0.65, "unique":0.95, "lat":15.3350, "lon":76.4600, "desc":"Ancient ruins of the Vijayanagara Empire."},
    {"id":"jaipur", "name":"Jaipur", "type":"heritage", "mood_match":["cultural","romantic","family"], "weather_types":["hot","sunny","warm"], "tags":["history","forts","shopping"], "cost":2500, "pop":0.9, "unique":0.85, "lat":26.9124, "lon":75.7873, "desc":"The Pink City known for palaces and forts."},
    {"id":"agra", "name":"Agra", "type":"heritage", "mood_match":["romantic","cultural","history"], "weather_types":["hot","sunny","warm","cold"], "tags":["history","monuments"], "cost":2000, "pop":0.95, "unique":0.9, "lat":27.1767, "lon":78.0081, "desc":"Home of the Taj Mahal."},
    {"id":"khajuraho", "name":"Khajuraho", "type":"heritage", "mood_match":["cultural","history"], "weather_types":["hot","warm","sunny"], "tags":["history","temples"], "cost":1800, "pop":0.5, "unique":0.9, "lat":24.8318, "lon":79.9199, "desc":"Famous for intricately carved temples."},
    
    # Hill Station
    {"id":"darjeeling", "name":"Darjeeling", "type":"hill_station", "mood_match":["romantic","relaxed","cultural"], "weather_types":["cool","misty"], "tags":["tea_gardens","mountain_view"], "cost":1800, "pop":0.85, "unique":0.8, "lat":27.0360, "lon":88.2627, "desc":"Queen of the Hills with Himalayan views."},
    {"id":"ooty", "name":"Ooty", "type":"hill_station", "mood_match":["romantic","relaxed","family"], "weather_types":["cool","misty","rainy"], "tags":["tea_gardens","lakes","nature"], "cost":2000, "pop":0.9, "unique":0.75, "lat":11.4102, "lon":76.6950, "desc":"Lush green valleys and scenic lakes."},
    {"id":"munnar", "name":"Munnar", "type":"hill_station", "mood_match":["romantic","nature","relaxed"], "weather_types":["cool","misty","rainy"], "tags":["tea_gardens","waterfalls","nature"], "cost":2200, "pop":0.85, "unique":0.85, "lat":10.0889, "lon":77.0595, "desc":"Rolling hills covered in tea plantations."},
    {"id":"shillong", "name":"Shillong", "type":"hill_station", "mood_match":["nature","cultural","adventure"], "weather_types":["cool","rainy","misty"], "tags":["waterfalls","music","culture"], "cost":2000, "pop":0.7, "unique":0.85, "lat":25.5788, "lon":91.8933, "desc":"The Scotland of the East."},
    {"id":"kodaikanal", "name":"Kodaikanal", "type":"hill_station", "mood_match":["relaxed","romantic","nature"], "weather_types":["cool","misty"], "tags":["lakes","nature","cycling"], "cost":1900, "pop":0.8, "unique":0.75, "lat":10.2381, "lon":77.4892, "desc":"Princess of Hill Stations with star-shaped lake."}
]

# Convert simple dicts to proper expected format
full_destinations = []
for d in new_destinations:
    full_destinations.append({
        "id": d["id"],
        "name": d["name"],
        "country": "India",
        "type": d["type"],
        "mood_match": d["mood_match"],
        "weather_types": d["weather_types"],
        "budget_tiers": {"budget": True, "mid": True, "luxury": True},
        "avg_cost_per_day": d["cost"],
        "popularity_score": d["pop"],
        "crowd_level": "medium" if d["pop"] < 0.8 else "high",
        "uniqueness_value": d["unique"],
        "best_season": ["October", "March"],
        "tags": d["tags"],
        "lat": d["lat"],
        "lon": d["lon"],
        "description": d["desc"],
        "image_keyword": d["name"].lower().replace(' ', '_')
    })

orig_data["destinations"] = full_destinations

# Generate activities
all_activities = []

outdoor_acts = ["Hiking and Photography Trail", "Sunrise Viewpoint Visit", "Nature Walk to Local Village", "Scenic Bicycle Ride"]
culture_acts = ["Heritage Architecture Walk", "Local Museum Tour", "Visit to Main Temple/Monument", "Traditional Handloom Weaving Tour"]
culinary_acts = ["Street Food Tasting Tour", "Local Spice Market Visit", "Traditional Dinner Experience", "Cooking Class with Local Chef"]
leisure_acts = ["Sunset Viewpoint Registration", "Boat Ride / Lake Walk", "Spa and Ayurveda Centre", "Cafe Hopping and Shopping"]
adventure_acts = ["Jungle Jeep Safari", "River Rafting Experience", "Bouldering and Climbing", "Scuba Diving / Snorkelling"]

for dest in full_destinations:
    did = dest["id"]
    
    # Base generic activities scaled to this destination
    acts = [
        {"id": f"{did}_hike", "name": outdoor_acts[0], "type": "outdoor", "base_cost": 200, "duration": 3},
        {"id": f"{did}_culture", "name": culture_acts[0], "type": "cultural", "base_cost": 0, "duration": 3},
        {"id": f"{did}_food", "name": culinary_acts[0], "type": "culinary", "base_cost": 500, "duration": 2},
        {"id": f"{did}_leisure", "name": leisure_acts[0], "type": "leisure", "base_cost": 100, "duration": 2},
        {"id": f"{did}_outdoor2", "name": outdoor_acts[1], "type": "outdoor", "base_cost": 50, "duration": 2},
        {"id": f"{did}_culture2", "name": culture_acts[2], "type": "cultural", "base_cost": 100, "duration": 3},
    ]
    
    if dest["type"] in ["beach"]:
        acts.extend([
            {"id": f"{did}_adv", "name": adventure_acts[3], "type": "outdoor", "base_cost": 2500, "duration": 4},
            {"id": f"{did}_lei", "name": leisure_acts[1], "type": "leisure", "base_cost": 800, "duration": 2},
        ])
    elif dest["type"] in ["nature"]:
        acts.extend([
            {"id": f"{did}_adv", "name": adventure_acts[0], "type": "outdoor", "base_cost": 1500, "duration": 4},
        ])
    elif dest["type"] in ["mountain"]:
        acts.extend([
            {"id": f"{did}_adv", "name": adventure_acts[1], "type": "outdoor", "base_cost": 1200, "duration": 4},
            {"id": f"{did}_adv2", "name": adventure_acts[2], "type": "outdoor", "base_cost": 800, "duration": 3},
        ])
    
    for a in acts:
        # Determine time slot based on duration/type
        ts = "morning" if "Sunrise" in a["name"] or a["type"] == "wellness" else random.choice(["morning", "afternoon", "evening"])
        if "Food" in a["name"] or "Sunset" in a["name"]: ts = "evening"
        
        all_activities.append({
            "id": a["id"],
            "destination_ids": [did],
            "name": a["name"].replace('Trail', f'Trail in {dest["name"]}'),
            "type": a["type"],
            "time_slot": ts,
            "duration_hours": a["duration"],
            "cost_inr": a["base_cost"],
            "weather_suitable": ["sunny", "cool", "warm"],
            "mood_tags": dest["mood_match"],
            "interest_tags": dest["tags"] + [a["type"]],
            "energy_level": "high" if a["type"] == "outdoor" and "Walk" not in a["name"] else ("low" if a["type"] == "leisure" else "medium")
        })

orig_data["activities"] = all_activities

# Write back
with open(DATA_PATH, 'w', encoding='utf-8') as f:
    json.dump(orig_data, f, indent=2)

print(f"Successfully generated {len(full_destinations)} destinations and {len(all_activities)} activities.")
