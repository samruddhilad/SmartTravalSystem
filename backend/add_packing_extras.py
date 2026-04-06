import json
import os
import random

DATA_PATH = os.path.join(os.path.dirname(__file__), 'data', 'travel_dataset.json')

with open(DATA_PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

dests = data.get('destinations', [])

for dest in dests:
    dtype = dest.get('type')
    dname = dest.get('name').lower()
    
    items = []
    if dtype == 'mountain' or dtype == 'hill_station':
        items += ["Thermal Innerwear", "Heavy Jacket", "Trekking Boots", "Woolen Socks", "Beanie / Gloves"]
    elif dtype == 'beach':
        items += ["Swimwear", "Flip Flops", "Beach Towel", "Sun Hat", "Aloe Vera Gel", "Waterproof Bag"]
    elif dtype == 'heritage':
        items += ["Modest Temple Wear", "Walking Shoes", "Cotton Scarf", "Daypack", "Power Bank"]
    elif dtype == 'nature':
        items += ["Binoculars", "Camouflage/Neutral Clothing", "Insect Repellent", "Trail Shoes"]
    elif dtype == 'desert':
        items += ["Wide-brimmed Hat", "Light Cotton Clothes", "Dust Scarf / Bandana", "Hydration Pack"]
    
    # Specific location overrides for extra flavor
    if 'leh' in dname or 'spiti' in dname:
        items += ["High-altitude Sickness Meds (Diamox)", "Oxygen Canister", "UV-protection Sunglasses"]
    elif 'goa' in dname or 'gokarna' in dname or 'andaman' in dname:
        items += ["Snorkel Gear", "Coral-safe Sunscreen"]
    elif 'varanasi' in dname or 'rishikesh' in dname:
        items += ["Slip-on Shoes (for frequent temple visits)"]
        
    # Shuffle and pick top 4-5 unique
    items = list(set(items))
    random.shuffle(items)
    
    dest['location_packing_items'] = items[:5]

with open(DATA_PATH, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print("Added location-specific packing items to 30 destinations!")
