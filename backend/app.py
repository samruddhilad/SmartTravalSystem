from flask import Flask, request, jsonify
from flask_cors import CORS
from bayesian_engine import plan_itinerary, DESTINATIONS, DATASET

app = Flask(__name__)
CORS(app)


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "Smart Travel Itinerary Planner API"})


@app.route('/api/generate-itinerary', methods=['POST'])
def generate_itinerary():
    try:
        prefs = request.get_json(force=True)
        if not prefs:
            return jsonify({"error": "No preferences provided"}), 400

        # Validate required fields
        required = ['mood', 'budget', 'weather', 'group_type', 'duration_days']
        for field in required:
            if field not in prefs:
                return jsonify({"error": f"Missing field: {field}"}), 400

        result = plan_itinerary(prefs)
        return jsonify({"success": True, "data": result})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route('/api/destinations', methods=['GET'])
def get_destinations():
    mood   = request.args.get('mood')
    dtype  = request.args.get('type')
    dests  = list(DESTINATIONS.values())

    if mood:
        dests = [d for d in dests if mood in d.get('mood_match', [])]
    if dtype:
        dests = [d for d in dests if d['type'] == dtype]

    return jsonify({"destinations": dests})


@app.route('/api/hidden-gems', methods=['GET'])
def get_hidden_gems():
    from bayesian_engine import recommend_hidden_gems
    mood   = request.args.get('mood', 'relaxed')
    budget = int(request.args.get('budget', 30000))
    gems   = recommend_hidden_gems(mood, budget)
    return jsonify({"hidden_gems": gems})


@app.route('/api/packing-list', methods=['POST'])
def get_packing_list():
    data     = request.get_json(force=True)
    from bayesian_engine import generate_packing_list
    result   = generate_packing_list(
        data.get('dest_type', 'nature'),
        data.get('weather', 'warm'),
        data.get('activity_types', []),
    )
    return jsonify({"packing_list": result})


@app.route('/api/alternative-plan', methods=['POST'])
def get_alternative_plan():
    data    = request.get_json(force=True)
    from bayesian_engine import generate_alternative_plan
    result  = generate_alternative_plan(
        data.get('original_dest_id', ''),
        data.get('mood', 'relaxed'),
        int(data.get('budget', 30000)),
        data.get('weather', 'warm'),
        data.get('group_type', 'solo'),
        data.get('interests', []),
        int(data.get('duration_days', 5)),
        data.get('reason', 'weather_change'),
    )
    return jsonify({"success": True, "data": result})


@app.route('/api/dataset/moods', methods=['GET'])
def get_moods():
    moods = [
        {"id": "relaxed",    "label": "Relaxed",    "emoji": "😌", "color": "#00675e"},
        {"id": "adventure",  "label": "Adventure",  "emoji": "🏔️", "color": "#4a40e0"},
        {"id": "romantic",   "label": "Romantic",   "emoji": "💕", "color": "#e040fb"},
        {"id": "spiritual",  "label": "Spiritual",  "emoji": "🙏", "color": "#ff9800"},
        {"id": "cultural",   "label": "Cultural",   "emoji": "🎭", "color": "#009688"},
        {"id": "fun",        "label": "Fun",        "emoji": "🎉", "color": "#f44336"},
        {"id": "reflective", "label": "Reflective", "emoji": "🌙", "color": "#702ae1"},
    ]
    return jsonify({"moods": moods})


@app.route('/api/dataset/interests', methods=['GET'])
def get_interests():
    interests = [
        "beaches", "trekking", "temples", "water_sports", "nightlife",
        "food", "culture", "history", "nature", "photography",
        "yoga", "adventure", "wildlife", "heritage", "camping",
        "backwaters", "monasteries", "ayurveda", "cycling", "birdwatching",
    ]
    return jsonify({"interests": interests})


if __name__ == '__main__':
    import socket
    hostname = socket.gethostname()
    print(f"🌍 Smart Travel Planner API starting on http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
