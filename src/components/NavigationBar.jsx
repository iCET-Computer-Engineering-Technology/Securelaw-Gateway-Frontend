import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Sun, Moon, User, Bell } from 'lucide-react'; 


const NavigationBar = () => {
  const [isDark, setIsDark] = useState(true);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav
      className="navbar navbar-expand-lg fixed-top shadow-sm"
      style={{
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--border)',
        transition: 'background 0.3s ease, border 0.3s ease'
      }}
    >
      <div className="container-fluid px-4">

        {/* Brand Logo / Title */}
        <NavLink
          className="navbar-brand fw-bold d-flex align-items-center"
          to="/dashboard"
          onClick={closeMenu}
          style={{ color: 'var(--text-main)', fontSize: '1.25rem' }}
        >
          <i className="bi bi-shield-lock me-2" style={{ color: 'var(--accent)' }}></i>
          Audit Logs System
        </NavLink>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{ borderColor: 'var(--border)' }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Links & Icons */}
        <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="navbarNav">

          {/* Main Links */}
          <ul className="navbar-nav ms-auto gap-1 me-lg-4">
            <NavItem to="/dashboard" icon="bi-speedometer2" label="Dashboard" onClick={closeMenu} />
            <NavItem to="/login-history" icon="bi-box-arrow-in-right" label="Login History" onClick={closeMenu} />
            <NavItem to="/prompt-history" icon="bi-chat-dots" label="Prompt History" onClick={closeMenu} />
            <NavItem to="/registration-history" icon="bi-person-plus" label="Registration History" onClick={closeMenu} />
            <NavItem to="/profile-card" icon="bi-person-circle"  onClick={closeMenu}/></ul>

          {/* Icons Area */}
          <div
            className="d-flex align-items-center gap-4 ps-lg-4 mt-3 mt-lg-0"
            style={{ borderLeft: '1px solid var(--border)' }}
          >

            {/* ── NEW: Notification Bell with Unread Dot ── */}
            <div
              className="position-relative"
              style={{ cursor: 'pointer', color: 'var(--text-main)', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              title="Notifications"
            >
              <Bell size={20} />
              {/* Red dot indicator for new notifications */}
              <span
                className="position-absolute translate-middle p-1 bg-danger border border-light rounded-circle"
                style={{ top: '4px', right: '-8px' }}
              >
                <span className="visually-hidden">New alerts</span>
              </span>
            </div>

            {/* Theme Toggle */}
            <div
              onClick={() => { setIsDark(!isDark); closeMenu(); }}
              style={{ cursor: 'pointer', color: 'var(--text-main)', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              title="Toggle Theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </div>

            {/* User Login/Logout */}
            <NavLink
              to="/profile-card"
              onClick={closeMenu}
              className="nav-icon"
              title="Profile"
            >
              <User size={20} />
            </NavLink>
          </div>

        </div>
      </div>
    </nav>
  );
};

const NavItem = ({ to, icon, label, onClick }) => (
  <li className="nav-item">
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) => `nav-link rounded-pill px-3 py-2 d-flex align-items-center ${isActive ? 'active' : ''}`}
      style={({ isActive }) => ({
        color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
        backgroundColor: isActive ? 'var(--bg-pill)' : 'transparent',
        fontWeight: isActive ? '600' : '500',
        transition: 'all 0.2s ease'
      })}
      onMouseEnter={(e) => {
        if (!e.currentTarget.classList.contains('active')) {
          e.currentTarget.style.color = 'var(--text-main)';
          e.currentTarget.style.backgroundColor = 'var(--bg-input)';
        }
      }}
      onMouseLeave={(e) => {
        if (!e.currentTarget.classList.contains('active')) {
          e.currentTarget.style.color = 'var(--text-muted)';
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      <i className={`bi ${icon} me-2`}></i> {label}
    </NavLink>
  </li>
);

export default NavigationBar;