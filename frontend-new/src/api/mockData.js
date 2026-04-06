// src/api/mockData.js — Frontend fallback Bayesian simulation (same logic as before)
export default function generateMockItinerary(prefs) {
  const mood = prefs.mood || 'relaxed';
  const budget = parseInt(prefs.budget) || 30000;
  const weather = prefs.weather || 'warm';
  const days = parseInt(prefs.duration_days) || 5;
  const interests = prefs.interests || [];

  const DEST_PROBS = {
    relaxed:    { goa:0.38,kerala_backwaters:0.28,pondicherry:0.20,darjeeling:0.09,manali:0.05 },
    adventure:  { manali:0.40,ladakh:0.32,coorg:0.15,goa:0.08,darjeeling:0.05 },
    romantic:   { darjeeling:0.35,kerala_backwaters:0.30,pondicherry:0.20,goa:0.10,coorg:0.05 },
    spiritual:  { varanasi:0.55,ladakh:0.22,kerala_backwaters:0.12,darjeeling:0.07,coorg:0.04 },
    cultural:   { varanasi:0.30,darjeeling:0.28,pondicherry:0.22,coorg:0.12,goa:0.08 },
    fun:        { goa:0.50,manali:0.20,kerala_backwaters:0.15,pondicherry:0.10,coorg:0.05 },
    reflective: { varanasi:0.40,ladakh:0.30,darjeeling:0.20,coorg:0.07,manali:0.03 },
  };
  const DESTINATIONS = {
    goa:{ id:'goa',name:'Goa',type:'beach',description:"India's party capital with golden beaches, vibrant nightlife, and Portuguese heritage.",tags:['beaches','nightlife','water_sports'] },
    manali:{ id:'manali',name:'Manali',type:'mountain',description:'Himalayan paradise with snow-capped peaks, adventure sports, and breathtaking valleys.',tags:['trekking','snow','adventure'] },
    varanasi:{ id:'varanasi',name:'Varanasi',type:'spiritual',description:'The spiritual capital of India with ancient ghats on the banks of the holy Ganges.',tags:['temples','ghats','spiritual'] },
    darjeeling:{ id:'darjeeling',name:'Darjeeling',type:'hill_station',description:'The Queen of Hills — world-famous tea gardens, toy train, and Kanchenjunga sunrise.',tags:['tea_gardens','mountain_view'] },
    kerala_backwaters:{ id:'kerala_backwaters',name:'Kerala Backwaters',type:'nature',description:'Serene waterways through lush coconut groves on traditional houseboats.',tags:['houseboat','backwaters','ayurveda'] },
    ladakh:{ id:'ladakh',name:'Ladakh',type:'mountain',description:'The land of high passes — surreal moonlike landscapes and ancient Buddhist monasteries.',tags:['high_altitude','monasteries'] },
    pondicherry:{ id:'pondicherry',name:'Pondicherry',type:'beach',description:'French colonial charm meets Indian spirituality on the Bay of Bengal.',tags:['french_quarter','beaches','yoga'] },
    coorg:{ id:'coorg',name:'Coorg',type:'nature',description:'The Scotland of India — misty mountains, aromatic coffee estates, and waterfalls.',tags:['coffee_estates','waterfalls','trekking'] },
  };

  const probs = DEST_PROBS[mood] || DEST_PROBS.relaxed;
  const weatherBonus = { goa:weather==='sunny'?0.1:-0.05, manali:weather==='cold'?0.1:-0.05, ladakh:weather==='cold'?0.08:0 };
  const budgetPenalty = {};
  if (budget < 15000) budgetPenalty.kerala_backwaters = -0.12;
  if (budget < 10000) { budgetPenalty.ladakh=-0.15; budgetPenalty.kerala_backwaters=-0.15; }

  const adjusted = {};
  for (const [k,v] of Object.entries(probs)) adjusted[k] = Math.max(0.01, v+(weatherBonus[k]||0)+(budgetPenalty[k]||0));
  const total = Object.values(adjusted).reduce((s,v)=>s+v,0);
  const normalized = {};
  for (const [k,v] of Object.entries(adjusted)) normalized[k] = v/total;

  const sorted = Object.entries(normalized).sort((a,b)=>b[1]-a[1]);
  const bestId = sorted[0][0], altId = sorted[1][0];
  const bestDest = DESTINATIONS[bestId], altDest = DESTINATIONS[altId];

  const destRanking = sorted.slice(0,5).map(([id,prob])=>({ id, name:DESTINATIONS[id]?.name||id, probability:Math.round(prob*1000)/10, type:DESTINATIONS[id]?.type||'nature' }));

  const ACTIVITY_POOLS = {
    goa:[{id:'beach_swimming',name:'Beach Swimming & Sunbathing',type:'outdoor',time_slot:'morning',duration_hours:3,cost_inr:0,energy_level:'low'},{id:'scuba_diving',name:'Scuba Diving & Snorkeling',type:'outdoor',time_slot:'morning',duration_hours:4,cost_inr:2500,energy_level:'medium'},{id:'local_food_tour',name:'Local Street Food Tour',type:'culinary',time_slot:'evening',duration_hours:3,cost_inr:600,energy_level:'low'},{id:'heritage_walk',name:'Heritage Architecture Walk',type:'cultural',time_slot:'afternoon',duration_hours:3,cost_inr:0,energy_level:'low'},{id:'water_sports',name:'Water Sports at Calangute',type:'outdoor',time_slot:'afternoon',duration_hours:3,cost_inr:1500,energy_level:'medium'},{id:'sunset_cruise',name:'Sunset Cruise on Mandovi',type:'leisure',time_slot:'evening',duration_hours:2,cost_inr:800,energy_level:'low'}],
    manali:[{id:'trekking_hills',name:'Rohtang Pass Trekking',type:'outdoor',time_slot:'morning',duration_hours:6,cost_inr:800,energy_level:'high'},{id:'river_rafting',name:'Beas River Rafting',type:'outdoor',time_slot:'afternoon',duration_hours:4,cost_inr:1200,energy_level:'high'},{id:'monastery_visit',name:'Hadimba Devi Temple & Monastery',type:'cultural',time_slot:'morning',duration_hours:3,cost_inr:100,energy_level:'low'},{id:'camping_stars',name:'Overnight Camping Under Stars',type:'outdoor',time_slot:'evening',duration_hours:12,cost_inr:2000,energy_level:'medium'},{id:'solang_valley',name:'Solang Valley Snow Activities',type:'outdoor',time_slot:'afternoon',duration_hours:4,cost_inr:1000,energy_level:'high'},{id:'local_food_tour',name:'Manali Local Cuisine Tour',type:'culinary',time_slot:'evening',duration_hours:2,cost_inr:400,energy_level:'low'}],
    varanasi:[{id:'ganga_aarti',name:'Ganga Aarti Ceremony at Dashashwamedh',type:'cultural',time_slot:'evening',duration_hours:2,cost_inr:0,energy_level:'low'},{id:'boat_ride',name:'Early Morning Boat Ride on Ganges',type:'leisure',time_slot:'morning',duration_hours:2,cost_inr:300,energy_level:'low'},{id:'temple_tour',name:'Kashi Vishwanath Temple Tour',type:'cultural',time_slot:'morning',duration_hours:3,cost_inr:100,energy_level:'low'},{id:'local_food_tour',name:'Varanasi Street Food Walk',type:'culinary',time_slot:'afternoon',duration_hours:3,cost_inr:400,energy_level:'low'},{id:'silk_weaving',name:'Visit Banarasi Silk Weavers',type:'cultural',time_slot:'afternoon',duration_hours:2,cost_inr:0,energy_level:'low'},{id:'meditation',name:'Yoga & Meditation at the Ghats',type:'wellness',time_slot:'morning',duration_hours:2,cost_inr:500,energy_level:'low'}],
    darjeeling:[{id:'sunrise_viewpoint',name:'Tiger Hill Sunrise Viewpoint',type:'outdoor',time_slot:'morning',duration_hours:3,cost_inr:100,energy_level:'low'},{id:'tea_garden',name:'Makaibari Tea Estate Tour',type:'cultural',time_slot:'morning',duration_hours:3,cost_inr:200,energy_level:'low'},{id:'toy_train',name:'Toy Train Heritage Ride',type:'leisure',time_slot:'afternoon',duration_hours:3,cost_inr:500,energy_level:'low'},{id:'monastery_visit',name:'Ghoom Monastery Visit',type:'cultural',time_slot:'morning',duration_hours:2,cost_inr:50,energy_level:'low'},{id:'local_food_tour',name:'Darjeeling Food & Culture Walk',type:'culinary',time_slot:'evening',duration_hours:2,cost_inr:300,energy_level:'low'},{id:'observatory_hill',name:'Observatory Hill & Mahakal Temple',type:'cultural',time_slot:'afternoon',duration_hours:2,cost_inr:0,energy_level:'low'}],
    kerala_backwaters:[{id:'houseboat_cruise',name:'Backwater Houseboat Cruise (Alleppey)',type:'leisure',time_slot:'full_day',duration_hours:8,cost_inr:5000,energy_level:'low'},{id:'ayurveda_spa',name:'Traditional Ayurveda Spa Treatment',type:'wellness',time_slot:'afternoon',duration_hours:3,cost_inr:2000,energy_level:'low'},{id:'yoga_meditation',name:'Morning Yoga & Meditation',type:'wellness',time_slot:'morning',duration_hours:2,cost_inr:500,energy_level:'low'},{id:'village_tour',name:'Backwater Village Cycling Tour',type:'outdoor',time_slot:'morning',duration_hours:4,cost_inr:600,energy_level:'medium'},{id:'local_food_tour',name:'Kerala Seafood & Sadhya Feast',type:'culinary',time_slot:'evening',duration_hours:2,cost_inr:600,energy_level:'low'},{id:'sunset_backwater',name:'Sunset Canoe in the Backwaters',type:'leisure',time_slot:'evening',duration_hours:2,cost_inr:800,energy_level:'low'}],
    ladakh:[{id:'monastery_visit',name:'Hemis & Thiksey Monastery Tour',type:'cultural',time_slot:'morning',duration_hours:5,cost_inr:200,energy_level:'low'},{id:'trekking_hills',name:'Markha Valley Trek',type:'outdoor',time_slot:'morning',duration_hours:8,cost_inr:1500,energy_level:'high'},{id:'camping_stars',name:'Stargazing Camp at Pangong Lake',type:'outdoor',time_slot:'evening',duration_hours:12,cost_inr:3000,energy_level:'medium'},{id:'bike_ride',name:'Royal Enfield Ride to Khardung La',type:'outdoor',time_slot:'morning',duration_hours:6,cost_inr:800,energy_level:'medium'},{id:'local_cuisine',name:'Ladakhi Thukpa & Momos Dinner',type:'culinary',time_slot:'evening',duration_hours:2,cost_inr:300,energy_level:'low'},{id:'sunrise_viewpoint',name:'Sunrise at Shanti Stupa',type:'outdoor',time_slot:'morning',duration_hours:2,cost_inr:0,energy_level:'low'}],
    pondicherry:[{id:'french_quarter',name:'French Quarter Heritage Walk',type:'cultural',time_slot:'morning',duration_hours:3,cost_inr:0,energy_level:'low'},{id:'beach_swimming',name:'Promenade Beach Sunrise Walk',type:'outdoor',time_slot:'morning',duration_hours:2,cost_inr:0,energy_level:'low'},{id:'yoga_meditation',name:'Auroville Meditation & Yoga',type:'wellness',time_slot:'morning',duration_hours:3,cost_inr:500,energy_level:'low'},{id:'cafe_hopping',name:'Pondicherry Café Culture Tour',type:'culinary',time_slot:'afternoon',duration_hours:3,cost_inr:800,energy_level:'low'},{id:'heritage_walk',name:'Old Town Architecture Trail',type:'cultural',time_slot:'afternoon',duration_hours:2,cost_inr:0,energy_level:'low'},{id:'scuba_diving',name:'Pondicherry Scuba Diving',type:'outdoor',time_slot:'morning',duration_hours:4,cost_inr:2500,energy_level:'medium'}],
    coorg:[{id:'coffee_tour',name:'Plantation Walk on Coffee Estate',type:'outdoor',time_slot:'morning',duration_hours:3,cost_inr:300,energy_level:'low'},{id:'abbey_falls',name:'Abbey Falls & Forest Trek',type:'outdoor',time_slot:'morning',duration_hours:4,cost_inr:200,energy_level:'medium'},{id:'river_rafting',name:'Barapole River Rafting',type:'outdoor',time_slot:'afternoon',duration_hours:4,cost_inr:1200,energy_level:'high'},{id:'raja_seat',name:"Raja's Seat Sunset Garden",type:'leisure',time_slot:'evening',duration_hours:2,cost_inr:20,energy_level:'low'},{id:'local_food_tour',name:'Coorgi Pandi Curry Food Walk',type:'culinary',time_slot:'evening',duration_hours:2,cost_inr:400,energy_level:'low'},{id:'wildlife',name:'Dubare Elephant Camp Visit',type:'outdoor',time_slot:'morning',duration_hours:4,cost_inr:600,energy_level:'low'}],
  };

  const activities = (ACTIVITY_POOLS[bestId]||ACTIVITY_POOLS.goa).slice(0, days*3);
  const themes = ['Arrival & First Impressions','Exploring the Heart','Hidden Corners & Local Life','Adventure Day','Relaxation & Rejuvenation','Culture & Cuisine','Farewell & Last Memories'];

  const formatSlot = (act,time) => act ? { activity:act.name,time,duration:`${act.duration_hours} hours`,cost:act.cost_inr||0,type:act.type||'leisure',energy:act.energy_level||'low' } : { activity:'Free time / Leisure',time,duration:'2 hours',cost:0,type:'leisure',energy:'low' };

  const itinerary = Array.from({length:days},(_,d) => ({
    day:d+1, theme:themes[Math.min(d,themes.length-1)],
    morning:formatSlot(activities[d*3],'09:00'),
    afternoon:formatSlot(activities[d*3+1],'13:00'),
    evening:formatSlot(activities[d*3+2],'18:00'),
    day_budget:Math.round(budget/days),
  }));

  const tMult={flight:0.40,train:0.15,bus:0.08,car:0.25,bike:0.05};
  const aMult={hostel:0.10,guesthouse:0.15,homestay:0.12,hotel_3star:0.30,hotel_5star:0.45,resort:0.50};
  const t=Math.round(budget*(tMult[prefs.transport]||0.20));
  const a=Math.round(budget*(aMult[prefs.accommodation]||0.30)*days/5);
  const actCost=activities.slice(0,6).reduce((s,ac)=>s+(ac.cost_inr||0),0);
  const f=800*days, sh=Math.max(0,Math.round(budget*0.08));
  const budgetSplit={transport:t,accommodation:a,food:f,activities:actCost,shopping:sh,total:t+a+f+actCost+sh};

  const hiddenGems=[
    {id:'ziro_valley',name:'Ziro Valley',state:'Arunachal Pradesh',type:'nature',popularity_score:0.25,crowd_level:'very_low',uniqueness_value:0.97,description:'Remote valley of the Apatani tribe — UNESCO tentative site.',best_for:['photography','tribal_culture','trekking'],avg_cost_per_day:1200},
    {id:'spiti_valley',name:'Spiti Valley',state:'Himachal Pradesh',type:'mountain',popularity_score:0.35,crowd_level:'low',uniqueness_value:0.93,description:'Middle land between Tibet and India — ancient monasteries.',best_for:['photography','monasteries','cycling'],avg_cost_per_day:1800},
    {id:'majuli',name:'Majuli Island',state:'Assam',type:'cultural',popularity_score:0.20,crowd_level:'very_low',uniqueness_value:0.95,description:"World's largest river island with Vaishnavite monasteries.",best_for:['culture','birdwatching','peaceful_escape'],avg_cost_per_day:900},
  ];

  const PACKING={beach:['swimwear','sunscreen SPF50','flip flops','beach towel','sunglasses'],mountain:['thermal layers','waterproof jacket','trekking boots','first aid kit'],spiritual:['modest clothing','dupatta/scarf','comfortable sandals'],nature:['insect repellent','reusable water bottle','binoculars'],hill_station:['light jacket','camera','hot beverage flask']};
  const weatherExtras={sunny:['sunscreen','hat','sunglasses'],cold:['thermal wear','gloves','woolen socks'],rainy:['raincoat','umbrella','waterproof bag'],warm:['light clothing','hydration bottle'],cool:['light jacket','layers'],humid:['moisture-wicking clothes','insect repellent']};
  const packing={essentials:['passport/ID','travel adapter','first aid kit','medications','cash & cards','phone charger'],destination:PACKING[bestDest.type]||PACKING.nature,weather:weatherExtras[weather]||[],activities:['comfortable shoes','sunscreen','camera','reusable water bottle']};

  const altActs=(ACTIVITY_POOLS[altId]||ACTIVITY_POOLS.darjeeling).slice(0,days*3);
  const altItinerary=Array.from({length:days},(_,d)=>({day:d+1,theme:themes[Math.min(d,themes.length-1)],morning:formatSlot(altActs[d*3],'09:00'),afternoon:formatSlot(altActs[d*3+1],'13:00'),evening:formatSlot(altActs[d*3+2],'18:00'),day_budget:Math.round(budget/days)}));
  const altPlan={reason:'weather_change',destination:altDest,itinerary:altItinerary,budget_split:{...budgetSplit},note:`Plan B selected due to weather change. ${altDest?.name||'Alternative'} is an excellent backup.`};

  const allTags=new Set(activities.flatMap(a=>[a.type||''].map(t=>t.toLowerCase())));
  const userSet=new Set(interests.map(i=>i.toLowerCase()));
  const inter=[...userSet].filter(t=>allTags.has(t)).length;
  const union=userSet.size+allTags.size-inter;
  const compat=Math.round(50+(union>0?(inter/union)*50:25));

  return {
    destination:bestDest, probability_score:Math.round(normalized[bestId]*1000)/10,
    dest_ranking:destRanking, compatibility_score:compat,
    activities, itinerary, budget_split:budgetSplit,
    hidden_gems:hiddenGems, packing_list:packing, alternative_plan:altPlan,
    user_preferences:prefs,
    trip_summary:{ destination:bestDest.name, duration:`${days} Days`, total_budget:`₹${parseInt(budget).toLocaleString('en-IN')}`, estimated_spend:`₹${budgetSplit.total.toLocaleString('en-IN')}`, start_date:prefs.start_date||'', end_date:prefs.end_date||'', group_type:(prefs.group_type||'Solo').charAt(0).toUpperCase()+(prefs.group_type||'solo').slice(1), transport:(prefs.transport||'Train').charAt(0).toUpperCase()+(prefs.transport||'train').slice(1), accommodation:(prefs.accommodation||'hotel_3star').replace(/_/g,' ').replace(/\b\w/g,l=>l.toUpperCase()) },
  };
}
