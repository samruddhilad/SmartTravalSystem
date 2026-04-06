// src/components/Sidebar.jsx
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const NAV_ITEMS = [
  { section: 'Main', items: [
    { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { to: '/',          icon: '🗺️', label: 'Plan a Trip', badge: 'AI' },
    { to: '/results',   icon: '📋', label: 'My Itineraries' },
  ]},
  { section: 'Discover', items: [
    { to: '/#how-it-works', icon: '🧠', label: 'How It Works' },
    { to: '/my-trips',      icon: '🌟', label: 'My Trips' },
    { to: '#',              icon: '💎', label: 'Hidden Gems' },
  ]},
  { section: 'Account', items: [
    { to: '#', icon: '⚙️', label: 'Settings' },
    { to: '#', icon: '❓', label: 'Help' },
  ]},
];

export default function Sidebar({ collapsed, mobileOpen, onClose, onToggleCollapse }) {
  const location = useLocation();

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/';
    if (to === '#') return false;
    return location.pathname.startsWith(to.split('#')[0]); // Basic check
  };

  return (
    <>
      <div className={`sidebar-overlay ${mobileOpen ? 'active' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {NAV_ITEMS.map((group) => (
          <div key={group.section}>
            <div className="sidebar-section-label">{group.section}</div>
            {group.items.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={`sidebar-link ${isActive(item.to) ? 'active' : ''}`}
                onClick={(e) => {
                    if (item.to === '#') {
                        e.preventDefault();
                        alert('✨ This feature is coming soon!');
                    }
                    if (onClose) onClose();
                }}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-text">{item.label}</span>
                {item.badge && <span className="sidebar-badge">{item.badge}</span>}
              </Link>
            ))}
          </div>
        ))}

        <div className="sidebar-footer">
          <button className="sidebar-collapse-btn" onClick={onToggleCollapse}>
            <span>{collapsed ? '▶' : '◀'}</span>
            <span className="sidebar-collapse-btn-text">Collapse</span>
          </button>
        </div>
      </aside>
    </>
  );
}
