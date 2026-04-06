/* ═══════════════════════════════════════════════════════════════════════════
   API Module — Handles all backend communication
   Falls back to mock data if backend is unavailable
═══════════════════════════════════════════════════════════════════════════ */

const API_BASE = 'http://localhost:5000/api';

async function fetchItinerary(preferences) {
  try {
    const res = await fetch(`${API_BASE}/generate-itinerary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preferences),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('Backend unavailable, using mock data:', err.message);
    return generateMockItinerary(preferences);
  }
}

async function fetchAlternativePlan(params) {
  try {
    const res = await fetch(`${API_BASE}/alternative-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.warn('Alt plan fetch failed:', err.message);
    return null;
  }
}

// ─── Mock Data (Frontend-only fallback Bayesian simulation) ────────────────

function generateMockItinerary(prefs) {
  const mood = prefs.mood || 'relaxed';
  const budget = parseInt(prefs.budget) || 30000;
  const weather = prefs.weather || 'warm';
  const groupType = prefs.group_type || 'solo';
  const interests = prefs.interests || [];
  const days = parseInt(prefs.duration_days) || 5;

  // Simplified Bayesian CPT simulation
  const DEST_PROBS = {
    relaxed:    { goa: 0.38, kerala_backwaters: 0.28, pondicherry: 0.20, darjeeling: 0.09, manali: 0.05 },
    adventure:  { manali: 0.40, ladakh: 0.32, coorg: 0.15, goa: 0.08, darjeeling: 0.05 },
    romantic:   { darjeeling: 0.35, kerala_backwaters: 0.30, pondicherry: 0.20, goa: 0.10, coorg: 0.05 },
    spiritual:  { varanasi: 0.55, ladakh: 0.22, kerala_backwaters: 0.12, darjeeling: 0.07, coorg: 0.04 },
    cultural:   { varanasi: 0.30, darjeeling: 0.28, pondicherry: 0.22, coorg: 0.12, goa: 0.08 },
    fun:        { goa: 0.50, manali: 0.20, kerala_backwaters: 0.15, pondicherry: 0.10, coorg: 0.05 },
    reflective: { varanasi: 0.40, ladakh: 0.30, darjeeling: 0.20, coorg: 0.07, manali: 0.03 },
  };

  const DESTINATIONS = {
    goa:              { id:'goa', name:'Goa', type:'beach', description:'India\'s party capital with golden beaches, vibrant nightlife, and Portuguese heritage.', tags:['beaches','nightlife','water_sports','seafood','churches'] },
    manali:           { id:'manali', name:'Manali', type:'mountain', description:'Himalayan paradise with snow-capped peaks, adventure sports, and breathtaking valleys.', tags:['trekking','snow','adventure','camping','river_rafting'] },
    varanasi:         { id:'varanasi', name:'Varanasi', type:'spiritual', description:'The spiritual capital of India with ancient ghats on the banks of the holy Ganges.', tags:['temples','ghats','spiritual','history','culture'] },
    darjeeling:       { id:'darjeeling', name:'Darjeeling', type:'hill_station', description:'The Queen of Hills — world-famous tea gardens, toy train, and Kanchenjunga sunrise.', tags:['tea_gardens','mountain_view','toy_train','monasteries','peaceful'] },
    kerala_backwaters:{ id:'kerala_backwaters', name:'Kerala Backwaters', type:'nature', description:'Serene waterways through lush coconut groves on traditional houseboats.', tags:['houseboat','backwaters','ayurveda','nature','coconut_groves'] },
    ladakh:           { id:'ladakh', name:'Ladakh', type:'mountain', description:'The land of high passes — surreal moonlike landscapes and ancient Buddhist monasteries.', tags:['high_altitude','monasteries','bikes','remote','stars'] },
    pondicherry:      { id:'pondicherry', name:'Pondicherry', type:'beach', description:'French colonial charm meets Indian spirituality on the Bay of Bengal.', tags:['french_quarter','beaches','yoga','cafes','heritage'] },
    coorg:            { id:'coorg', name:'Coorg', type:'nature', description:'The Scotland of India — misty mountains, aromatic coffee estates, and waterfalls.', tags:['coffee_estates','waterfalls','trekking','wildlife','homestay'] },
  };

  const probs = DEST_PROBS[mood] || DEST_PROBS.relaxed;

  // Apply weather & budget adjustments
  const weatherBonus = { goa: weather==='sunny'?0.1:-0.05, manali: weather==='cold'?0.1:-0.05, ladakh: weather==='cold'?0.08:0 };
  const budgetPenalty = {};
  if (budget < 15000) budgetPenalty.kerala_backwaters = -0.12;
  if (budget < 10000) { budgetPenalty.ladakh = -0.15; budgetPenalty.kerala_backwaters = -0.15; }

  const adjusted = {};
  for (const [k, v] of Object.entries(probs)) {
    adjusted[k] = Math.max(0.01, v + (weatherBonus[k]||0) + (budgetPenalty[k]||0));
  }

  // Normalize
  const total = Object.values(adjusted).reduce((s,v) => s+v, 0);
  const normalized = {};
  for (const [k,v] of Object.entries(adjusted)) normalized[k] = v/total;

  // Pick best
  const bestId = Object.entries(normalized).sort((a,b)=>b[1]-a[1])[0][0];
  const altId  = Object.entries(normalized).sort((a,b)=>b[1]-a[1])[1][0];
  const bestDest = DESTINATIONS[bestId];
  const altDest  = DESTINATIONS[altId];

  // Ranking for sidebar
  const destRanking = Object.entries(normalized)
    .sort((a,b) => b[1]-a[1])
    .slice(0,5)
    .map(([id, prob]) => ({
      id, name: DESTINATIONS[id]?.name || id,
      probability: Math.round(prob * 100 * 10) / 10,
      type: DESTINATIONS[id]?.type || 'nature'
    }));

  // Activity pools
  const ACTIVITY_POOLS = {
    goa:              [
      {id:'beach_swimming',name:'Beach Swimming & Sunbathing',type:'outdoor',time_slot:'morning',duration_hours:3,cost_inr:0,energy_level:'low'},
      {id:'scuba_diving',name:'Scuba Diving & Snorkeling',type:'outdoor',time_slot:'morning',duration_hours:4,cost_inr:2500,energy_level:'medium'},
      {id:'local_food_tour',name:'Local Street Food Tour',type:'culinary',time_slot:'evening',duration_hours:3,cost_inr:600,energy_level:'low'},
      {id:'heritage_walk',name:'Heritage Architecture Walk',type:'cultural',time_slot:'afternoon',duration_hours:3,cost_inr:0,energy_level:'low'},
      {id:'water_sports',name:'Water Sports at Calangute',type:'outdoor',time_slot:'afternoon',duration_hours:3,cost_inr:1500,energy_level:'medium'},
      {id:'sunset_cruise',name:'Sunset Cruise on Mandovi',type:'leisure',time_slot:'evening',duration_hours:2,cost_inr:800,energy_level:'low'},
    ],
    manali:           [
      {id:'trekking_hills',name:'Rohtang Pass Trekking',type:'outdoor',time_slot:'morning',duration_hours:6,cost_inr:800,energy_level:'high'},
      {id:'river_rafting',name:'Beas River Rafting',type:'outdoor',time_slot:'afternoon',duration_hours:4,cost_inr:1200,energy_level:'high'},
      {id:'monastery_visit',name:'Hadimba Devi Temple & Monastery',type:'cultural',time_slot:'morning',duration_hours:3,cost_inr:100,energy_level:'low'},
      {id:'camping_stars',name:'Overnight Camping Under Stars',type:'outdoor',time_slot:'evening',duration_hours:12,cost_inr:2000,energy_level:'medium'},
      {id:'solang_valley',name:'Solang Valley Snow Activities',type:'outdoor',time_slot:'afternoon',duration_hours:4,cost_inr:1000,energy_level:'high'},
      {id:'local_food_tour',name:'Manali Local Cuisine Tour',type:'culinary',time_slot:'evening',duration_hours:2,cost_inr:400,energy_level:'low'},
    ],
    varanasi:         [
      {id:'ganga_aarti',name:'Ganga Aarti Ceremony at Dashashwamedh',type:'cultural',time_slot:'evening',duration_hours:2,cost_inr:0,energy_level:'low'},
      {id:'boat_ride',name:'Early Morning Boat Ride on Ganges',type:'leisure',time_slot:'morning',duration_hours:2,cost_inr:300,energy_level:'low'},
      {id:'temple_tour',name:'Kashi Vishwanath Temple Tour',type:'cultural',time_slot:'morning',duration_hours:3,cost_inr:100,energy_level:'low'},
      {id:'local_food_tour',name:'Varanasi Street Food Walk',type:'culinary',time_slot:'afternoon',duration_hours:3,cost_inr:400,energy_level:'low'},
      {id:'silk_weaving',name:'Visit Banarasi Silk Weavers',type:'cultural',time_slot:'afternoon',duration_hours:2,cost_inr:0,energy_level:'low'},
      {id:'meditation',name:'Yoga & Meditation at the Ghats',type:'wellness',time_slot:'morning',duration_hours:2,cost_inr:500,energy_level:'low'},
    ],
    darjeeling:       [
      {id:'sunrise_viewpoint',name:'Tiger Hill Sunrise Viewpoint',type:'outdoor',time_slot:'morning',duration_hours:3,cost_inr:100,energy_level:'low'},
      {id:'tea_garden',name:'Makaibari Tea Estate Tour',type:'cultural',time_slot:'morning',duration_hours:3,cost_inr:200,energy_level:'low'},
      {id:'toy_train',name:'Toy Train Heritage Ride',type:'leisure',time_slot:'afternoon',duration_hours:3,cost_inr:500,energy_level:'low'},
      {id:'monastery_visit',name:'Ghoom Monastery Visit',type:'cultural',time_slot:'morning',duration_hours:2,cost_inr:50,energy_level:'low'},
      {id:'local_food_tour',name:'Darjeeling Food & Culture Walk',type:'culinary',time_slot:'evening',duration_hours:2,cost_inr:300,energy_level:'low'},
      {id:'observatory_hill',name:'Observatory Hill & Mahakal Temple',type:'cultural',time_slot:'afternoon',duration_hours:2,cost_inr:0,energy_level:'low'},
    ],
    kerala_backwaters:[
      {id:'houseboat_cruise',name:'Backwater Houseboat Cruise (Alleppey)',type:'leisure',time_slot:'full_day',duration_hours:8,cost_inr:5000,energy_level:'low'},
      {id:'ayurveda_spa',name:'Traditional Ayurveda Spa Treatment',type:'wellness',time_slot:'afternoon',duration_hours:3,cost_inr:2000,energy_level:'low'},
      {id:'yoga_meditation',name:'Morning Yoga & Meditation',type:'wellness',time_slot:'morning',duration_hours:2,cost_inr:500,energy_level:'low'},
      {id:'village_tour',name:'Backwater Village Cycling Tour',type:'outdoor',time_slot:'morning',duration_hours:4,cost_inr:600,energy_level:'medium'},
      {id:'local_food_tour',name:'Kerala Seafood & Sadhya Feast',type:'culinary',time_slot:'evening',duration_hours:2,cost_inr:600,energy_level:'low'},
      {id:'sunset_backwater',name:'Sunset Canoe in the Backwaters',type:'leisure',time_slot:'evening',duration_hours:2,cost_inr:800,energy_level:'low'},
    ],
    ladakh:           [
      {id:'monastery_visit',name:'Hemis & Thiksey Monastery Tour',type:'cultural',time_slot:'morning',duration_hours:5,cost_inr:200,energy_level:'low'},
      {id:'trekking_hills',name:'Markha Valley Trek',type:'outdoor',time_slot:'morning',duration_hours:8,cost_inr:1500,energy_level:'high'},
      {id:'camping_stars',name:'Stargazing Camp at Pangong Lake',type:'outdoor',time_slot:'evening',duration_hours:12,cost_inr:3000,energy_level:'medium'},
      {id:'bike_ride',name:'Royal Enfield Ride to Khardung La',type:'outdoor',time_slot:'morning',duration_hours:6,cost_inr:800,energy_level:'medium'},
      {id:'local_cuisine',name:'Ladakhi Thukpa & Momos Dinner',type:'culinary',time_slot:'evening',duration_hours:2,cost_inr:300,energy_level:'low'},
      {id:'sunrise_viewpoint',name:'Sunrise at Shanti Stupa',type:'outdoor',time_slot:'morning',duration_hours:2,cost_inr:0,energy_level:'low'},
    ],
    pondicherry:      [
      {id:'french_quarter',name:'French Quarter Heritage Walk',type:'cultural',time_slot:'morning',duration_hours:3,cost_inr:0,energy_level:'low'},
      {id:'beach_swimming',name:'Promenade Beach Sunrise Walk',type:'outdoor',time_slot:'morning',duration_hours:2,cost_inr:0,energy_level:'low'},
      {id:'yoga_meditation',name:'Auroville Meditation & Yoga',type:'wellness',time_slot:'morning',duration_hours:3,cost_inr:500,energy_level:'low'},
      {id:'cafe_hopping',name:'Pondicherry Café Culture Tour',type:'culinary',time_slot:'afternoon',duration_hours:3,cost_inr:800,energy_level:'low'},
      {id:'heritage_walk',name:'Old Town Architecture Trail',type:'cultural',time_slot:'afternoon',duration_hours:2,cost_inr:0,energy_level:'low'},
      {id:'scuba_diving',name:'Pondicherry Scuba Diving',type:'outdoor',time_slot:'morning',duration_hours:4,cost_inr:2500,energy_level:'medium'},
    ],
    coorg:            [
      {id:'coffee_tour',name:'Plantation Walk on Coffee Estate',type:'outdoor',time_slot:'morning',duration_hours:3,cost_inr:300,energy_level:'low'},
      {id:'abbey_falls',name:'Abbey Falls & Forest Trek',type:'outdoor',time_slot:'morning',duration_hours:4,cost_inr:200,energy_level:'medium'},
      {id:'river_rafting',name:'Barapole River Rafting',type:'outdoor',time_slot:'afternoon',duration_hours:4,cost_inr:1200,energy_level:'high'},
      {id:'raja_seat',name:'Raja\'s Seat Sunset Garden',type:'leisure',time_slot:'evening',duration_hours:2,cost_inr:20,energy_level:'low'},
      {id:'local_food_tour',name:'Coorgi Pandi Curry Food Walk',type:'culinary',time_slot:'evening',duration_hours:2,cost_inr:400,energy_level:'low'},
      {id:'wildlife',name:'Dubare Elephant Camp Visit',type:'outdoor',time_slot:'morning',duration_hours:4,cost_inr:600,energy_level:'low'},
    ],
  };

  const activities = (ACTIVITY_POOLS[bestId] || ACTIVITY_POOLS.goa).slice(0, days * 3);

  // Build itinerary
  const themes = [
    `Arrival & First Impressions of ${bestDest.name}`,
    `Exploring the Heart of ${bestDest.name}`,
    'Hidden Corners & Local Life',
    'Adventure Day',
    'Relaxation & Rejuvenation',
    'Culture & Cuisine',
    'Farewell & Last Memories',
  ];

  const itinerary = [];
  for (let d = 0; d < days; d++) {
    const base = d * 3;
    itinerary.push({
      day: d + 1,
      theme: themes[Math.min(d, themes.length - 1)],
      morning:   formatSlot(activities[base], '09:00'),
      afternoon: formatSlot(activities[base+1], '13:00'),
      evening:   formatSlot(activities[base+2], '18:00'),
      day_budget: Math.round(budget / days),
    });
  }

  function formatSlot(act, time) {
    if (!act) return { activity: 'Free time / Leisure', time, duration: '2 hours', cost: 0, type: 'leisure', energy: 'low' };
    return { activity: act.name, time, duration: `${act.duration_hours} hours`, cost: act.cost_inr || 0, type: act.type || 'leisure', energy: act.energy_level || 'low' };
  }

  // Budget split
  const transportMult  = { flight:0.40, train:0.15, bus:0.08, car:0.25, bike:0.05 };
  const accomMult      = { hostel:0.10, guesthouse:0.15, homestay:0.12, hotel_3star:0.30, hotel_5star:0.45, resort:0.50 };
  const t = Math.round(budget * (transportMult[prefs.transport] || 0.20));
  const a = Math.round(budget * (accomMult[prefs.accommodation] || 0.30) * days / 5);
  const actCost = activities.slice(0,6).reduce((s, ac) => s + (ac.cost_inr || 0), 0);
  const f = 800 * days;
  const sh = Math.max(0, Math.round(budget * 0.08));

  const budgetSplit = { transport:t, accommodation:a, food:f, activities:actCost, shopping:sh, total: t+a+f+actCost+sh };

  // Hidden gems
  const hiddenGems = [
    { id:'ziro_valley', name:'Ziro Valley', state:'Arunachal Pradesh', type:'nature', popularity_score:0.25, crowd_level:'very_low', uniqueness_value:0.97, description:'Remote valley of the Apatani tribe — UNESCO tentative site with extraordinary paddy fields and pine forests.', best_for:['photography','tribal_culture','trekking'], avg_cost_per_day:1200 },
    { id:'spiti_valley', name:'Spiti Valley', state:'Himachal Pradesh', type:'mountain', popularity_score:0.35, crowd_level:'low', uniqueness_value:0.93, description:'Middle land between Tibet and India — ancient monasteries, fossil-rich rocks, and extreme altitude living.', best_for:['photography','monasteries','cycling'], avg_cost_per_day:1800 },
    { id:'majuli', name:'Majuli Island', state:'Assam', type:'cultural', popularity_score:0.20, crowd_level:'very_low', uniqueness_value:0.95, description:'World\'s largest river island with Vaishnavite monasteries and a disappearing culture worth discovering.', best_for:['culture','birdwatching','peaceful_escape'], avg_cost_per_day:900 },
  ];

  // Packing
  const PACKING = {
    beach:       ['swimwear', 'sunscreen SPF50', 'flip flops', 'beach towel', 'sunglasses', 'hat', 'light clothes', 'waterproof bag'],
    mountain:    ['thermal layers', 'waterproof jacket', 'trekking boots', 'trekking poles', 'first aid kit', 'power bank', 'torch', 'energy bars'],
    spiritual:   ['modest clothing', 'dupatta/scarf', 'comfortable sandals', 'eco-friendly products', 'reusable bag'],
    nature:      ['insect repellent', 'biodegradable soap', 'reusable water bottle', 'quick-dry towel', 'binoculars'],
    hill_station:['light jacket', 'comfortable shoes', 'camera', 'hot beverage flask', 'moisturizer', 'layers'],
  };
  const typeSpecific = PACKING[bestDest.type] || PACKING.nature;
  const weatherExtras = { sunny:['sunscreen','hat','sunglasses'], cold:['thermal wear','gloves','woolen socks'], rainy:['raincoat','umbrella','waterproof bag'], warm:['light clothing','hydration bottle'], cool:['light jacket','layers','comfortable shoes'], humid:['moisture-wicking clothes','insect repellent'] };
  const packing = {
    essentials: ['passport/ID','travel adapter','first aid kit','medications','cash & cards','phone charger','portable battery','travel insurance docs'],
    destination: typeSpecific,
    weather: weatherExtras[weather] || [],
    activities: ['comfortable shoes','sunscreen','camera','reusable water bottle'],
  };

  // Alternative plan
  const altActivities = (ACTIVITY_POOLS[altId] || ACTIVITY_POOLS.darjeeling).slice(0, days * 3);
  const altItinerary = [];
  for (let d = 0; d < days; d++) {
    const base = d * 3;
    altItinerary.push({
      day: d + 1,
      theme: themes[Math.min(d, themes.length - 1)],
      morning:   formatSlot(altActivities[base], '09:00'),
      afternoon: formatSlot(altActivities[base+1], '13:00'),
      evening:   formatSlot(altActivities[base+2], '18:00'),
      day_budget: Math.round(budget / days),
    });
  }

  const altPlan = {
    reason: 'weather_change',
    destination: altDest,
    itinerary: altItinerary,
    budget_split: { ...budgetSplit },
    note: `Plan B selected due to weather change. ${altDest?.name || 'Alternative destination'} is an excellent backup.`,
  };

  // Compatibility score (Jaccard-style)
  const allTags = new Set(activities.flatMap(a => [a.type || ''].map(t => t.toLowerCase())));
  const userSet = new Set(interests.map(i => i.toLowerCase()));
  const inter = [...userSet].filter(t => allTags.has(t)).length;
  const union = userSet.size + allTags.size - inter;
  const compat = Math.round(50 + (union > 0 ? (inter/union)*50 : 25));

  return {
    destination: bestDest,
    probability_score: Math.round(normalized[bestId] * 100 * 10) / 10,
    dest_ranking: destRanking,
    compatibility_score: compat,
    activities,
    itinerary,
    budget_split: budgetSplit,
    hidden_gems: hiddenGems,
    packing_list: packing,
    alternative_plan: altPlan,
    user_preferences: prefs,
    trip_summary: {
      destination: bestDest.name,
      duration: `${days} Days`,
      total_budget: `₹${parseInt(budget).toLocaleString('en-IN')}`,
      estimated_spend: `₹${budgetSplit.total.toLocaleString('en-IN')}`,
      start_date: prefs.start_date || '',
      end_date: prefs.end_date || '',
      group_type: (prefs.group_type || 'Solo').charAt(0).toUpperCase() + (prefs.group_type || 'solo').slice(1),
      transport: (prefs.transport || 'Train').charAt(0).toUpperCase() + (prefs.transport || 'train').slice(1),
      accommodation: (prefs.accommodation || 'hotel_3star').replace(/_/g,' ').replace(/\b\w/g, l => l.toUpperCase()),
    },
  };
}
