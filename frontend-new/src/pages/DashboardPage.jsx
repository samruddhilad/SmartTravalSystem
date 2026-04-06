// src/pages/DashboardPage.jsx — Cotton Candy Bento Dashboard
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const moodColors = { relaxed:'bento-mint', adventure:'bento-lavender', romantic:'bento-pink', spiritual:'bento-peach', cultural:'bento-sky', fun:'bento-pink', reflective:'bento-lavender' };

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const raw = localStorage.getItem('voyager-itinerary');
  const lastTrip = raw ? (() => { try { return JSON.parse(raw); } catch { return null; } })() : null;
  const dest = lastTrip?.destination;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{minHeight:'100vh',paddingTop:'64px',background:'var(--cc-bg)'}}>
      <Navbar onToggleSidebar={() => { if (window.innerWidth<768) setMobileSidebar(m=>!m); else setSidebarCollapsed(c=>!c); }} />
      <Sidebar collapsed={sidebarCollapsed} mobileOpen={mobileSidebar} onClose={() => setMobileSidebar(false)} onToggleCollapse={() => setSidebarCollapsed(c=>!c)} />

      <div style={{marginLeft: sidebarCollapsed?'68px':'240px', padding:'2rem', transition:'margin-left 0.25s ease'}}
           className={window.innerWidth<768?'':''}>

        {/* Welcome header */}
        <div style={{marginBottom:'2rem'}}>
          <h1 style={{fontSize:'1.75rem',fontWeight:900,marginBottom:'0.3rem'}}>
            Hey {user?.first_name || 'Traveler'} 👋
          </h1>
          <p style={{color:'var(--cc-text-secondary)'}}>Ready for your next adventure? Let's plan something amazing.</p>
        </div>

        {/* Main bento grid */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1.25rem',marginBottom:'1.5rem'}}>

          {/* Quick stats */}
          <div className="bento-card bento-pink">
            <div style={{fontSize:'2.5rem',marginBottom:'0.5rem'}}>✈️</div>
            <div style={{fontFamily:'var(--font-display)',fontSize:'2rem',fontWeight:900,background:'var(--grad-pink)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>{user?.trips_count || 0}</div>
            <div style={{color:'var(--cc-text-secondary)',fontSize:'0.875rem',fontWeight:700}}>Trips Planned</div>
          </div>

          <div className="bento-card bento-lavender">
            <div style={{fontSize:'2.5rem',marginBottom:'0.5rem'}}>🌍</div>
            <div style={{fontFamily:'var(--font-display)',fontSize:'2rem',fontWeight:900,background:'var(--grad-lavender)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>8+</div>
            <div style={{color:'var(--cc-text-secondary)',fontSize:'0.875rem',fontWeight:700}}>Destinations</div>
          </div>

          <div className="bento-card bento-mint">
            <div style={{fontSize:'2.5rem',marginBottom:'0.5rem'}}>🧠</div>
            <div style={{fontFamily:'var(--font-display)',fontSize:'2rem',fontWeight:900,color:'#059669'}}>95%</div>
            <div style={{color:'var(--cc-text-secondary)',fontSize:'0.875rem',fontWeight:700}}>AI Accuracy</div>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'1.25rem',marginBottom:'1.5rem'}}>
          {/* Last trip / CTA */}
          {dest ? (
            <div className="bento-card" style={{background:'var(--grad-pink)',color:'white',padding:'2rem'}}>
              <div style={{fontSize:'0.8rem',fontWeight:700,opacity:0.85,marginBottom:'0.5rem',textTransform:'uppercase',letterSpacing:'0.06em'}}>Last Planned Trip</div>
              <div style={{fontFamily:'var(--font-display)',fontSize:'1.75rem',fontWeight:900,marginBottom:'0.3rem'}}>{dest.name}</div>
              <div style={{opacity:0.85,fontSize:'0.875rem',marginBottom:'1.25rem'}}>{dest.description}</div>
              <Link to="/results" className="btn" style={{background:'rgba(255,255,255,0.25)',color:'white',backdropFilter:'blur(6px)'}}>View Itinerary →</Link>
            </div>
          ) : (
            <div className="bento-card" style={{background:'var(--grad-pink)',color:'white',padding:'2rem',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center'}}>
              <div style={{fontSize:'3rem',marginBottom:'0.75rem'}}>🗺️</div>
              <div style={{fontFamily:'var(--font-display)',fontSize:'1.25rem',fontWeight:900,marginBottom:'0.5rem'}}>Plan Your First Trip!</div>
              <p style={{opacity:0.9,fontSize:'0.875rem',marginBottom:'1.25rem'}}>Let our Bayesian AI craft the perfect itinerary for you.</p>
              <Link to="/#planner" className="btn" style={{background:'rgba(255,255,255,0.25)',color:'white',backdropFilter:'blur(6px)'}}>✨ Start Planning</Link>
            </div>
          )}

          {/* Profile card */}
          <div className="bento-card bento-sky" style={{display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',gap:'0.75rem'}}>
            <div style={{width:'64px',height:'64px',borderRadius:'50%',background:'var(--grad-lavender)',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-display)',fontSize:'1.5rem',fontWeight:900,boxShadow:'4px 4px 12px rgba(196,181,253,0.5)'}}>
              {user?.avatar_initials || 'VU'}
            </div>
            <div>
              <div style={{fontFamily:'var(--font-display)',fontWeight:900,fontSize:'1rem'}}>{user?.first_name} {user?.last_name}</div>
              <div style={{fontSize:'0.75rem',color:'var(--cc-text-muted)'}}>{user?.email}</div>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{marginTop:'auto'}}>🚪 Sign Out</button>
          </div>
        </div>

        {/* Action cards bento */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'1rem'}}>
          {[
            {icon:'🗺️',title:'Plan a New Trip',desc:'Start your Bayesian journey',to:'/#planner',cls:'bento-pink'},
            {icon:'📋',title:'View Itinerary',desc:'See your latest plan',to:'/results',cls:'bento-lavender'},
            {icon:'💎',title:'Hidden Gems',desc:'Discover off-beat places',to:'#',cls:'bento-mint'},
            {icon:'🧳',title:'Packing Lists',desc:'Smart checklist for your trip',to:'/results',cls:'bento-sky'},
          ].map(({icon,title,desc,to,cls})=>(
            <Link key={title} to={to} className={`bento-card ${cls}`} style={{textDecoration:'none',display:'block'}} onClick={(e) => { if(to === '#') { e.preventDefault(); alert('✨ This feature is coming soon!'); } }}>
              <div style={{fontSize:'2rem',marginBottom:'0.5rem'}}>{icon}</div>
              <div style={{fontFamily:'var(--font-display)',fontWeight:800,marginBottom:'0.2rem',color:'var(--cc-text-primary)'}}>{title}</div>
              <div style={{fontSize:'0.8rem',color:'var(--cc-text-secondary)'}}>{desc}</div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
