// src/pages/HomePage.jsx — Cotton Candy Neumorphism Bento
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { travelApi } from '../api/client';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import './HomePage.css';

const MOODS = [
  { id:'relaxed',    emoji:'😌', label:'Relaxed' },
  { id:'adventure',  emoji:'🏔️', label:'Adventure' },
  { id:'romantic',   emoji:'💕', label:'Romantic' },
  { id:'spiritual',  emoji:'🙏', label:'Spiritual' },
  { id:'cultural',   emoji:'🎭', label:'Cultural' },
  { id:'fun',        emoji:'🎉', label:'Fun' },
  { id:'reflective', emoji:'🌙', label:'Reflective' },
];

const INTERESTS = [
  'beaches','trekking','temples','water_sports','nightlife',
  'food','culture','history','nature','photography',
  'yoga','adventure','wildlife','heritage','camping',
  'backwaters','monasteries','ayurveda','cycling','birdwatching',
];

const WEATHER = [
  { id:'sunny', emoji:'☀️', label:'Sunny', sub:'Hot & bright' },
  { id:'cold',  emoji:'❄️', label:'Cold',  sub:'Snow & chill' },
  { id:'rainy', emoji:'🌧️', label:'Rainy', sub:'Monsoon season' },
  { id:'warm',  emoji:'🌤️', label:'Warm',  sub:'Pleasant & mild' },
  { id:'cool',  emoji:'🌬️', label:'Cool',  sub:'Breezy & fresh' },
  { id:'humid', emoji:'💧', label:'Humid', sub:'Tropical warmth' },
];

const FEATURES = [
  { icon:'🎯', title:'P(Destination | Mood, Budget)', desc:'We compute conditional probability using Bayesian CPTs to score every destination and pick the highest-probability match.', cls:'bento-lavender' },
  { icon:'🗺️', title:'Activity Inference', desc:'Activities are ranked by P(activity | destination, interest, weather), ensuring every hour is optimal and enjoyable.', cls:'bento-pink' },
  { icon:'💰', title:'Budget Optimization', desc:'A probabilistic cost model distributes your budget across transport, accommodation, food, and activities.', cls:'bento-mint' },
  { icon:'🔄', title:'Plan A & Plan B', desc:'The engine automatically generates an alternative itinerary using the second-ranked Bayesian destination.', cls:'bento-sky' },
  { icon:'💎', title:'Hidden Gems', desc:'Scored by (1 - popularity) × uniqueness value, we surface off-the-beaten-path locations that fit your travel DNA.', cls:'bento-peach' },
  { icon:'🧳', title:'Smart Packing', desc:'Packing lists generated contextually from destination type, weather conditions, and your specific activities.', cls:'bento-lavender' },
];

export default function HomePage() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebar, setMobileSidebar]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Form state
  const [mood,          setMood]          = useState('');
  const [groupType,     setGroupType]     = useState('');
  const [durationDays,  setDurationDays]  = useState('');
  const [budget,        setBudget]        = useState(30000);
  const [startDate,     setStartDate]     = useState('');
  const [endDate,       setEndDate]       = useState('');
  const [transport,     setTransport]     = useState('');
  const [accommodation, setAccommodation] = useState('');
  const [interests,     setInterests]     = useState([]);
  const [weather,       setWeather]       = useState('');

  // Intersection observer for reveal
  const revealRefs = useRef([]);
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1 }
    );
    revealRefs.current.forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const addReveal = (el) => { if (el) revealRefs.current.push(el); };

  const toggleInterest = (i) => {
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const nextStep = (step) => {
    // Simple validation
    if (step === 1 && (!mood || !groupType || !durationDays)) {
      alert('Please select mood, group type, and duration!'); return;
    }
    setCurrentStep(step + 1);
    window.scrollTo({ top: document.getElementById('planner')?.offsetTop - 80, behavior: 'smooth' });
  };
  const prevStep = (step) => setCurrentStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!weather) { alert('Please select weather conditions!'); return; }
    setLoading(true);
    const prefs = { mood, budget, weather, group_type: groupType, duration_days: parseInt(durationDays),
                    interests, transport, accommodation, start_date: startDate, end_date: endDate };
    try {
      const res = await travelApi.generateItinerary(prefs);
      localStorage.setItem('voyager-itinerary', JSON.stringify(res.data.data || res.data));
      navigate('/results');
    } catch (err) {
      alert('Error connecting to Voyager AI Bayesian engine. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatBudget = (v) => `₹${parseInt(v).toLocaleString('en-IN')}`;

  const stepDone  = (s) => currentStep > s;
  const stepActive = (s) => currentStep === s;

  const summaryItems = [
    ['Mood', MOODS.find(m=>m.id===mood)?.label || '—'],
    ['Group', groupType || '—'],
    ['Duration', durationDays ? `${durationDays} Days` : '—'],
    ['Budget', formatBudget(budget)],
    ['Transport', transport || '—'],
    ['Stay', accommodation?.replace(/_/g,' ') || '—'],
    ['Interests', interests.length ? `${interests.length} selected` : 'None'],
    ['Weather', WEATHER.find(w=>w.id===weather)?.label || '—'],
  ];

  return (
    <div className="home-root">
      {loading && (
        <div className="loading-overlay">
          <div className="loading-plane">✈️</div>
          <div className="loading-dots">
            <div className="loading-dot"/><div className="loading-dot"/><div className="loading-dot"/>
          </div>
          <div className="loading-text">Calculating Your Perfect Trip...</div>
          <div className="loading-sub">Running Bayesian inference across destinations & activities...</div>
        </div>
      )}

      <Navbar onToggleSidebar={() => { if (window.innerWidth < 768) setMobileSidebar(m=>!m); else setSidebarCollapsed(c=>!c); }} />
      <Sidebar collapsed={sidebarCollapsed} mobileOpen={mobileSidebar} onClose={() => setMobileSidebar(false)} onToggleCollapse={() => setSidebarCollapsed(c=>!c)} />

      <div className={`home-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>

        {/* ── HERO ── */}
        <header className="hero" id="home">
          <div className="hero-orb hero-orb-1"/><div className="hero-orb hero-orb-2"/><div className="hero-orb hero-orb-3"/>
          <div className="hero-content">
            <div className="hero-badge">🧠 Bayesian Network Powered AI</div>
            <h1>
              Smart Travel Itinerary{' '}
              <span className="gradient-text">Planner</span>
            </h1>
            <p className="hero-sub">
              Experience AI-powered travel planning using probabilistic reasoning. Personalized itineraries, hidden gems, and budget optimization — tailored just for you.
            </p>
            <div className="hero-actions">
              <a href="#planner" className="btn btn-primary btn-lg">✨ Plan My Itinerary</a>
              <a href="#how-it-works" className="btn btn-secondary btn-lg">How It Works</a>
            </div>
            <div className="hero-stats-bento">
              {[['8+','Destinations'],['10','AI Modules'],['∞','Unique Plans'],['95%','Accuracy']].map(([v,l],i)=>(
                <div className="hero-stat-card" key={i}>
                  <div className="hero-stat-val">{v}</div>
                  <div className="hero-stat-label">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* ── HOW IT WORKS ── */}
        <section className="how-section" id="how-it-works">
          <div className="container">
            <div className="section-header" ref={addReveal} style={{opacity:1,transform:'none'}}>
              <div className="section-tag">🔬 The Science</div>
              <h2 className="section-title">How Bayesian AI Plans Your Trip</h2>
              <p className="section-sub">Our engine calculates conditional probabilities across mood, budget, weather, and group dynamics to deliver the mathematically optimal itinerary.</p>
            </div>
            <div className="feature-bento">
              {FEATURES.map((f, i) => (
                <div key={i} className={`feature-card bento-card ${f.cls}`} ref={addReveal}
                     style={{ animationDelay: `${i*0.1}s` }}>
                  <div className="feature-icon-box">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PLANNER ── */}
        <section className="planner-section" id="planner">
          <div className="container-narrow">
            <div className="section-header">
              <div className="section-tag">✈️ Start Planning</div>
              <h2 className="section-title">Tell Us About Your Dream Trip</h2>
              <p className="section-sub">Answer a few questions and our Bayesian engine will craft your perfect itinerary in seconds.</p>
            </div>

            {/* Stepper */}
            <div className="stepper">
              {[['Mood &\nDestination','1'],['Budget &\nDates','2'],['Interests &\nStyle','3'],['Weather &\nConfirm','4']].map(([label,num],i)=>(
                <>
                  <div className={`step-item ${stepActive(i+1)?'active':''} ${stepDone(i+1)?'done':''}`} key={num}>
                    <div className="step-dot">{stepDone(i+1) ? '✓' : num}</div>
                    <div className="step-label">{label.split('\n').map((l,j)=><span key={j}>{l}<br/></span>)}</div>
                  </div>
                  {i < 3 && <div className={`step-connector ${stepDone(i+1)?'done':''}`} key={`c-${i}`}/>}
                </>
              ))}
            </div>

            {/* Planner card */}
            <div className="planner-card">
              <form onSubmit={handleSubmit}>

                {/* ── STEP 1 ── */}
                <div className={`step-area ${currentStep===1?'active':''}`}>
                  <span className="badge badge-lav" style={{marginBottom:'0.5rem'}}>Step 1 of 4</span>
                  <h3 style={{marginBottom:'0.3rem',fontSize:'1.2rem'}}>What's your travel mood?</h3>
                  <p style={{color:'var(--cc-text-secondary)',marginBottom:'1.5rem',fontSize:'0.9rem'}}>This is the core signal for our Bayesian destination inference engine.</p>

                  <div className="f-group">
                    <label className="f-label">Select Your Mood</label>
                    <div className="mood-chips">
                      {MOODS.map(m => (
                        <div key={m.id} className={`mood-chip ${mood===m.id?'selected':''}`} onClick={() => setMood(m.id)}>
                          <span>{m.emoji}</span><span>{m.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="f-group">
                      <label className="f-label">Travel Group</label>
                      <select className="neu-select" value={groupType} onChange={e => setGroupType(e.target.value)}>
                        <option value="">Select group type</option>
                        <option value="solo">🧍 Solo</option>
                        <option value="couple">👫 Couple</option>
                        <option value="family">👨‍👩‍👧‍👦 Family</option>
                        <option value="friends">👥 Friends</option>
                        <option value="corporate">💼 Corporate</option>
                      </select>
                    </div>
                    <div className="f-group">
                      <label className="f-label">Trip Duration</label>
                      <select className="neu-select" value={durationDays} onChange={e => setDurationDays(e.target.value)}>
                        <option value="">Select duration</option>
                        <option value="2">Weekend (2 days)</option>
                        <option value="3">Short Trip (3 days)</option>
                        <option value="5">Week Trip (5 days)</option>
                        <option value="7">Full Week (7 days)</option>
                        <option value="10">Extended (10 days)</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-nav">
                    <div />
                    <button type="button" className="btn btn-primary btn-md" onClick={() => nextStep(1)}>Next: Budget & Dates →</button>
                  </div>
                </div>

                {/* ── STEP 2 ── */}
                <div className={`step-area ${currentStep===2?'active':''}`}>
                  <span className="badge badge-pink" style={{marginBottom:'0.5rem'}}>Step 2 of 4</span>
                  <h3 style={{marginBottom:'0.3rem',fontSize:'1.2rem'}}>Budget & Travel Dates</h3>
                  <p style={{color:'var(--cc-text-secondary)',marginBottom:'1.5rem',fontSize:'0.9rem'}}>Your budget shapes the probability distribution across accommodation, transport, and activities.</p>

                  <div className="f-group">
                    <label className="f-label">Total Trip Budget (₹)</label>
                    <div className="budget-display">{formatBudget(budget)}</div>
                    <input type="range" className="budget-slider" min="5000" max="200000" step="1000" value={budget}
                           onChange={e => setBudget(parseInt(e.target.value))} />
                    <div className="budget-range"><span>₹5,000</span><span>₹2,00,000</span></div>
                  </div>

                  <div className="date-pair">
                    <div className="f-group">
                      <label className="f-label">Start Date</label>
                      <input type="date" className="neu-input" style={{paddingLeft:'1rem'}} value={startDate} onChange={e => setStartDate(e.target.value)} />
                    </div>
                    <div className="f-group">
                      <label className="f-label">End Date</label>
                      <input type="date" className="neu-input" style={{paddingLeft:'1rem'}} value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="f-group">
                      <label className="f-label">Transport Mode</label>
                      <select className="neu-select" value={transport} onChange={e => setTransport(e.target.value)}>
                        <option value="">Select transport</option>
                        <option value="flight">✈️ Flight</option>
                        <option value="train">🚂 Train</option>
                        <option value="bus">🚌 Bus</option>
                        <option value="car">🚗 Private Car</option>
                        <option value="bike">🏍️ Bike</option>
                      </select>
                    </div>
                    <div className="f-group">
                      <label className="f-label">Accommodation</label>
                      <select className="neu-select" value={accommodation} onChange={e => setAccommodation(e.target.value)}>
                        <option value="">Select stay type</option>
                        <option value="hostel">🛏️ Hostel</option>
                        <option value="guesthouse">🏡 Guesthouse</option>
                        <option value="homestay">🏠 Homestay</option>
                        <option value="hotel_3star">⭐⭐⭐ 3-Star Hotel</option>
                        <option value="hotel_5star">⭐⭐⭐⭐⭐ 5-Star Hotel</option>
                        <option value="resort">🌴 Resort</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-nav">
                    <button type="button" className="btn btn-secondary btn-md" onClick={() => prevStep(2)}>← Back</button>
                    <button type="button" className="btn btn-primary btn-md" onClick={() => nextStep(2)}>Next: Interests →</button>
                  </div>
                </div>

                {/* ── STEP 3 ── */}
                <div className={`step-area ${currentStep===3?'active':''}`}>
                  <span className="badge badge-mint" style={{marginBottom:'0.5rem'}}>Step 3 of 4</span>
                  <h3 style={{marginBottom:'0.3rem',fontSize:'1.2rem'}}>What interests you most?</h3>
                  <p style={{color:'var(--cc-text-secondary)',marginBottom:'1.5rem',fontSize:'0.9rem'}}>Select all that apply. These feed into P(activity | destination, interest) in our Bayesian engine.</p>

                  <div className="interests-grid">
                    {INTERESTS.map(i => (
                      <div key={i} className={`pill ${interests.includes(i)?'selected':''}`} onClick={() => toggleInterest(i)}>
                        {interests.includes(i) ? '✓ ' : ''}{i.replace(/_/g,' ')}
                      </div>
                    ))}
                  </div>

                  <div className="form-nav">
                    <button type="button" className="btn btn-secondary btn-md" onClick={() => prevStep(3)}>← Back</button>
                    <button type="button" className="btn btn-primary btn-md" onClick={() => nextStep(3)}>Next: Weather →</button>
                  </div>
                </div>

                {/* ── STEP 4 ── */}
                <div className={`step-area ${currentStep===4?'active':''}`}>
                  <span className="badge badge-sky" style={{marginBottom:'0.5rem'}}>Step 4 of 4</span>
                  <h3 style={{marginBottom:'0.3rem',fontSize:'1.2rem'}}>Expected Weather & Final Review</h3>
                  <p style={{color:'var(--cc-text-secondary)',marginBottom:'1.5rem',fontSize:'0.9rem'}}>Weather adjusts P(dest|weather) probabilities and filters suitable activities.</p>

                  <div className="f-group">
                    <label className="f-label">Weather Conditions</label>
                    <div className="weather-grid">
                      {WEATHER.map(w => (
                        <div key={w.id} className={`weather-opt ${weather===w.id?'selected':''}`} onClick={() => setWeather(w.id)}>
                          <span className="w-emoji">{w.emoji}</span>
                          <div><div className="w-label">{w.label}</div><div className="w-sub">{w.sub}</div></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{marginTop:'1.5rem'}}>
                    <label className="f-label">Trip Summary Preview</label>
                    <div className="summary-bento">
                      {summaryItems.map(([label, val]) => (
                        <div className="summary-item" key={label}>
                          <div className="summary-item-label">{label}</div>
                          <div className="summary-item-val">{val}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-nav">
                    <button type="button" className="btn btn-secondary btn-md" onClick={() => prevStep(4)}>← Back</button>
                    <button type="submit" className="btn btn-primary btn-lg">🧠 Generate My Itinerary</button>
                  </div>
                </div>

              </form>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="footer">
          <div className="footer-brand">✈️ Voyager AI</div>
          <p>Powered by Bayesian Network probabilistic reasoning. Built with FastAPI + React.</p>
          <p style={{marginTop:'0.3rem'}}>© 2025 Smart Travel Itinerary Planner</p>
        </footer>

      </div>
    </div>
  );
}
