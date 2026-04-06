// src/pages/ResultsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import './ResultsPage.css';

const DEST_EMOJIS = { beach:'🏖️', mountain:'🏔️', spiritual:'🙏', nature:'🌿', hill_station:'🌄', heritage:'🏛️' };
const SLOT_COLORS  = { morning:'badge-sky', afternoon:'badge-peach', evening:'badge-lav', full_day:'badge-mint' };
const TYPE_COLORS  = { outdoor:'badge-mint', cultural:'badge-lav', culinary:'badge-peach', leisure:'badge-sky', wellness:'badge-pink' };

function fmt(n) { return `₹${parseInt(n||0).toLocaleString('en-IN')}`; }

export default function ResultsPage() {
  const navigate = useNavigate();
  const [data, setData]     = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [activeDay, setActiveDay] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem('voyager-itinerary');
    if (raw) { try { setData(JSON.parse(raw)); } catch { setData(null); } }
  }, []);

  if (!data) return (
    <div className="results-root">
      <Navbar onToggleSidebar={() => setSidebarCollapsed(c=>!c)} />
      <Sidebar collapsed={sidebarCollapsed} mobileOpen={mobileSidebar} onClose={() => setMobileSidebar(false)} onToggleCollapse={() => setSidebarCollapsed(c=>!c)} />
      <div className={`results-main ${sidebarCollapsed?'sidebar-collapsed':''}`}>
        <div className="no-results">
          <div className="no-results-emoji">🗺️</div>
          <h2>No Itinerary Yet</h2>
          <p>Plan a trip first to see your personalized itinerary here.</p>
          <Link to="/#planner" className="btn btn-primary btn-md" style={{marginTop:'1rem'}}>✨ Plan a Trip</Link>
        </div>
      </div>
    </div>
  );

  const dest  = data.destination || {};
  const bs    = data.budget_split || {};
  const trip  = data.trip_summary || {};
  const alt   = data.alternative_plan || {};
  const packing = data.packing_list || {};
  const gems  = data.hidden_gems || [];
  const ranking = data.dest_ranking || [];
  const days  = data.itinerary || [];

  const emoji = DEST_EMOJIS[dest.type] || '🌍';

  return (
    <div className="results-root">
      <Navbar onToggleSidebar={() => { if (window.innerWidth < 768) setMobileSidebar(m=>!m); else setSidebarCollapsed(c=>!c); }} />
      <Sidebar collapsed={sidebarCollapsed} mobileOpen={mobileSidebar} onClose={() => setMobileSidebar(false)} onToggleCollapse={() => setSidebarCollapsed(c=>!c)} />

      <div className={`results-main ${sidebarCollapsed?'sidebar-collapsed':''}`}>

        {/* ── Action bar ── */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.5rem',flexWrap:'wrap',gap:'0.75rem'}}>
          <div>
            <h1 style={{fontSize:'1.4rem',fontWeight:900,marginBottom:'0.2rem'}}>Your AI-Generated Itinerary</h1>
            <p style={{color:'var(--cc-text-secondary)',fontSize:'0.875rem'}}>Powered by Bayesian probabilistic reasoning</p>
          </div>
          <div style={{display:'flex',gap:'0.75rem'}}>
            <button onClick={() => navigate('/#planner')} className="btn btn-secondary btn-sm">🔄 New Trip</button>
            <button onClick={() => window.print()} className="btn btn-primary btn-sm">📄 Export PDF</button>
          </div>
        </div>

        {/* ── Hero bento ── */}
        <div className="results-hero-bento">
          <div className="dest-hero-card">
            <div className="dest-hero-deco">{emoji}</div>
            <span className="dest-hero-emoji">{emoji}</span>
            <div className="dest-hero-name">{dest.name}</div>
            <div className="dest-hero-type">{dest.type?.replace(/_/g,' ')} · {trip.duration}</div>
            <div className="dest-hero-badge">
              🧠 {data.probability_score}% Bayesian Match
            </div>
            {dest.description && <p style={{marginTop:'1rem',fontSize:'0.875rem',opacity:0.9}}>{dest.description}</p>}
          </div>

          <div className="stats-col">
            <div className="stat-card bento-card bento-lavender">
              <div className="stat-card-val gradient-text">{data.compatibility_score}%</div>
              <div className="stat-card-label">Compatibility Score</div>
            </div>
            <div className="stat-card bento-card bento-mint">
              <div className="stat-card-val" style={{color:'#059669'}}>{trip.total_budget}</div>
              <div className="stat-card-label">Total Budget</div>
            </div>
            <div className="stat-card bento-card bento-pink">
              <div className="stat-card-val" style={{color:'var(--cc-pink-deep)'}}>{trip.group_type}</div>
              <div className="stat-card-label">Travel Group</div>
            </div>
          </div>
        </div>

        {/* ── Trip details bar ── */}
        <div className="bento-card" style={{marginBottom:'1.5rem',background:'var(--cc-surface-2)'}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:'1rem'}}>
            {[['✈️ Transport',trip.transport],['🏨 Stay',trip.accommodation],['📅 Dates',trip.start_date?`${trip.start_date} → ${trip.end_date}`:'Not specified'],['💰 Estimated Spend',trip.estimated_spend]].map(([label,val])=>(
              <div key={label}>
                <div style={{fontSize:'0.72rem',fontWeight:800,color:'var(--cc-text-muted)',textTransform:'uppercase',letterSpacing:'0.05em'}}>{label}</div>
                <div style={{fontFamily:'var(--font-display)',fontWeight:800,color:'var(--cc-text-primary)',marginTop:'0.2rem'}}>{val||'—'}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="results-layout">
          {/* ── Main column ── */}
          <div>
            {/* Budget breakdown */}
            <div className="bento-card budget-bento">
              <h3 style={{marginBottom:'1rem',fontSize:'1rem'}}>💰 Budget Breakdown</h3>
              <div className="budget-grid">
                {[['✈️','Transport',bs.transport],['🏨','Accommodation',bs.accommodation],['🍽️','Food',bs.food],['🎯','Activities',bs.activities],['🛍️','Shopping',bs.shopping]].map(([icon,label,val])=>(
                  <div className="budget-item bento-lavender" key={label}>
                    <div className="budget-item-icon">{icon}</div>
                    <div className="budget-item-label">{label}</div>
                    <div className="budget-item-val">{fmt(val)}</div>
                  </div>
                ))}
              </div>
              <div style={{textAlign:'right',fontFamily:'var(--font-display)',fontWeight:900,color:'var(--cc-text-primary)'}}>
                Total: <span className="gradient-text" style={{fontSize:'1.1rem'}}>{fmt(bs.total)}</span>
              </div>
            </div>

            {/* Itinerary */}
            <div className="bento-card" style={{marginBottom:'1.25rem'}}>
              <h3 style={{marginBottom:'1rem',fontSize:'1rem'}}>📅 Day-by-Day Itinerary</h3>
              {days.map((day) => (
                <div className="day-card" key={day.day}>
                  <div className="day-header" onClick={() => setActiveDay(activeDay===day.day?null:day.day)} style={{cursor:'pointer'}}>
                    <div>
                      <div className="day-num">Day {day.day}</div>
                      <div className="day-theme">{day.theme}</div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:'0.75rem'}}>
                      <div className="day-budget-chip">{fmt(day.day_budget)}/day</div>
                      <span style={{fontSize:'0.8rem'}}>{activeDay===day.day?'▲':'▼'}</span>
                    </div>
                  </div>
                  {(activeDay===null || activeDay===day.day) && (
                    <div className="day-slots">
                      {[['🌅 Morning',day.morning],['☀️ Afternoon',day.afternoon],['🌆 Evening',day.evening]].map(([time,slot])=>(
                        slot && <div className="slot" key={time}>
                          <div className="slot-time">{time}</div>
                          <div className="slot-activity">{slot.activity}</div>
                          <div className="slot-meta">
                            <span className={`badge ${TYPE_COLORS[slot.type]||'badge-lav'}`}>{slot.type}</span>
                            <span className="badge badge-sky">⏱ {slot.duration}</span>
                            {slot.cost > 0 && <span className="badge badge-peach">{fmt(slot.cost)}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Alt plan */}
            {alt.destination && (
              <div className="alt-plan-card" style={{marginBottom:'1.25rem'}}>
                <div className="alt-plan-header">
                  <h3 style={{fontWeight:900,marginBottom:'0.2rem'}}>🔄 Plan B — {alt.destination.name}</h3>
                  <p style={{opacity:0.9,fontSize:'0.85rem'}}>{alt.note}</p>
                </div>
                <div className="alt-plan-body">
                  <p style={{color:'var(--cc-text-secondary)',fontSize:'0.875rem',marginBottom:'0.75rem'}}>{alt.destination.description}</p>
                  {alt.itinerary?.slice(0,2).map(day=>(
                    <div key={day.day} style={{marginBottom:'0.5rem',padding:'0.75rem',background:'var(--cc-surface-2)',borderRadius:'var(--r-md)',boxShadow:'var(--neu-shadow-in-sm)'}}>
                      <strong>Day {day.day}: {day.theme}</strong>
                      <div style={{fontSize:'0.8rem',color:'var(--cc-text-secondary)',marginTop:'0.3rem'}}>
                        {[day.morning,day.afternoon,day.evening].filter(Boolean).map(s=>s.activity).join(' · ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar col ── */}
          <div className="results-sidebar-col">

            {/* Bayesian ranking */}
            <div className="bento-card">
              <h3 style={{marginBottom:'1rem',fontSize:'1rem'}}>🧠 Bayesian Ranking</h3>
              <div className="ranking-list">
                {ranking.map((r,i)=>(
                  <div className="rank-item" key={r.id}>
                    <div className="rank-num">#{i+1}</div>
                    <div className="rank-name">{r.name}</div>
                    <div className="rank-bar"><div className="rank-fill" style={{width:`${r.probability}%`}}/></div>
                    <div className="rank-pct">{r.probability}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hidden gems */}
            <div className="bento-card bento-mint">
              <h3 style={{marginBottom:'1rem',fontSize:'1rem'}}>💎 Hidden Gems</h3>
              <div className="gem-cards">
                {gems.map(g=>(
                  <div className="gem-card" key={g.id} style={{background:'rgba(255,255,255,0.5)'}}>
                    <div className="gem-name">{g.name}</div>
                    <div className="gem-state">📍 {g.state} · {fmt(g.avg_cost_per_day)}/day</div>
                    <div className="gem-desc">{g.description}</div>
                    <div style={{display:'flex',gap:'0.3rem',flexWrap:'wrap'}}>
                      {g.best_for?.map(t=><span className="badge badge-mint" key={t}>{t.replace(/_/g,' ')}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Packing list */}
            <div className="bento-card bento-lavender">
              <h3 style={{marginBottom:'0.5rem',fontSize:'1rem'}}>🧳 Packing List</h3>
              {[['Essentials 📋',packing.essentials],['Destination 🎯',packing.destination],['Weather ⛅',packing.weather],['Activities 🏃',packing.activities]].map(([title,items])=>(
                items?.length ? (
                  <div key={title}>
                    <div className="packing-section-title">{title}</div>
                    <div className="packing-chips">
                      {items.map(item=><span className="packing-chip" key={item}>{item}</span>)}
                    </div>
                  </div>
                ) : null
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
