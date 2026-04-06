import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { travelApi } from '../api/client';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function MyTripsPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  useEffect(() => {
    travelApi.getTrips()
      .then(res => {
        setTrips(res.data.trips || []);
      })
      .catch(err => console.error("Error fetching trips", err))
      .finally(() => setLoading(false));
  }, []);

  const openTrip = (tripData) => {
    localStorage.setItem('voyager-itinerary', JSON.stringify(tripData));
    navigate('/results');
  };

  return (
    <div style={{minHeight:'100vh',paddingTop:'64px',background:'var(--cc-bg)'}}>
      <Navbar onToggleSidebar={() => { if (window.innerWidth<768) setMobileSidebar(m=>!m); else setSidebarCollapsed(c=>!c); }} />
      <Sidebar collapsed={sidebarCollapsed} mobileOpen={mobileSidebar} onClose={() => setMobileSidebar(false)} onToggleCollapse={() => setSidebarCollapsed(c=>!c)} />

      <div style={{marginLeft: sidebarCollapsed?'68px':'240px', padding:'2rem', transition:'margin-left 0.25s ease'}}>
        <div style={{marginBottom:'2rem', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div>
            <h1 style={{fontSize:'1.75rem',fontWeight:900,marginBottom:'0.3rem'}}>My Trips 🌟</h1>
            <p style={{color:'var(--cc-text-secondary)'}}>All your saved AI-generated adventures</p>
          </div>
          <button onClick={() => navigate('/#planner')} className="btn btn-primary" style={{padding:'0.5rem 1.5rem'}}>+ New Trip</button>
        </div>

        {loading ? (
          <div style={{textAlign:'center', padding:'4rem'}}>Loading your adventures...</div>
        ) : trips.length === 0 ? (
          <div className="bento-card" style={{textAlign:'center', padding:'4rem'}}>
            <div style={{fontSize:'3rem', marginBottom:'1rem'}}>🧳</div>
            <h2 style={{fontSize:'1.25rem', marginBottom:'0.5rem'}}>No trips planned yet</h2>
            <p style={{color:'var(--cc-text-secondary)'}}>Your generated itineraries will appear here.</p>
          </div>
        ) : (
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'1.5rem'}}>
            {trips.map((trip, idx) => {
              const dest = trip.destination || {};
              const summary = trip.trip_summary || {};
              const dateStr = new Date(trip.created_at).toLocaleDateString();
              
              return (
                <div key={trip.id || idx} className="bento-card" style={{cursor:'pointer', transition:'transform 0.2s'}} onClick={() => openTrip(trip)} onMouseOver={(e)=>e.currentTarget.style.transform='translateY(-4px)'} onMouseOut={(e)=>e.currentTarget.style.transform='none'}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1rem'}}>
                    <div style={{fontSize:'2.5rem'}}>{dest.type === 'beach' ? '🏖️' : dest.type === 'mountain' ? '🏔️' : '🗺️'}</div>
                    <div style={{fontSize:'0.75rem', color:'var(--cc-text-muted)'}}>{dateStr}</div>
                  </div>
                  <h3 style={{fontSize:'1.25rem', fontWeight:800, marginBottom:'0.25rem'}}>{dest.name || 'Unknown Destination'}</h3>
                  <div style={{fontSize:'0.875rem', color:'var(--cc-text-secondary)', marginBottom:'1rem'}}>{summary.duration} · {summary.group_type}</div>
                  <div style={{display:'flex', gap:'0.5rem'}}>
                    <span className="badge badge-lav">{summary.total_budget || 'Budget'}</span>
                    <span className="badge badge-mint">{trip.probability_score || 90}% Match</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
