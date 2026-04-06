// src/components/Navbar.jsx
import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate  = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="navbar-menu-btn" onClick={onToggleSidebar} title="Menu">☰</button>
        <span className="navbar-logo">✈️ Voyager AI</span>
      </div>

      <div className="navbar-links">
        <Link to="/"          className={`navbar-link ${isActive('/')}`}>Home</Link>
        <Link to="/dashboard" className={`navbar-link ${isActive('/dashboard')}`}>Dashboard</Link>
        <Link to="/results"   className={`navbar-link ${isActive('/results')}`}>My Trips</Link>
      </div>

      <div className="navbar-right">
        <div className="navbar-divider" />
        <button className="navbar-icon-btn" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <button className="navbar-icon-btn" title="Notifications" onClick={() => alert('✨ Notifications are coming soon!')}>
          🔔 <span className="notif-dot" />
        </button>

        {user && (
          <div style={{ position: 'relative' }} ref={menuRef}>
            <div className="navbar-avatar" onClick={() => setMenuOpen(m => !m)}
                 title={user.first_name}>
              {user.avatar_initials}
            </div>
            {menuOpen && (
              <div className="user-menu">
                <div className="user-menu-header">
                  <div className="user-menu-name">{user.first_name} {user.last_name}</div>
                  <div className="user-menu-email">{user.email}</div>
                </div>
                <div className="user-menu-divider" />
                <button className="user-menu-item" onClick={() => { navigate('/dashboard'); setMenuOpen(false); }}>
                  🏠 Dashboard
                </button>
                <button className="user-menu-item" onClick={() => { alert('✨ Settings are coming soon!'); setMenuOpen(false); }}>
                  ⚙️ Settings
                </button>
                <div className="user-menu-divider" />
                <button className="user-menu-item danger" onClick={handleLogout}>
                  🚪 Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
