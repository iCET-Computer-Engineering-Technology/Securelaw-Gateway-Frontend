import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Sun, Moon, User, Bell, LogOut } from 'lucide-react'; 

const NavigationBar = () => {
  const [isDark, setIsDark] = useState(true); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState({
    name: 'User',
    email: '',
    initials: 'U'
  });

  // Decode JWT to get user info
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        const decoded = JSON.parse(jsonPayload);
        const userName = decoded.name || 'User';
        setCurrentUser({
          name: userName,
          email: decoded.sub || decoded.email || '', 
          initials: userName.charAt(0).toUpperCase()
        });
      } catch (error) {
        console.error("Could not decode user token", error);
      }
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  // 🚀 LOGOUT LOGIC (Fixed)
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role'); // Role එකත් අයින් කරන එක හොඳයි
    setShowProfileMenu(false);
    navigate('/login');
  };

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
        
        <NavLink 
          className="navbar-brand fw-bold d-flex align-items-center" 
          to="/dashboard"
          onClick={closeMenu} 
          style={{ color: 'var(--text-main)', fontSize: '1.25rem' }}
        >
          <i className="bi bi-shield-lock me-2" style={{ color: 'var(--accent)' }}></i>
          Audit Logs System
        </NavLink>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={() => setIsMenuOpen(!isMenuOpen)} 
          style={{ borderColor: 'var(--border)' }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav ms-auto gap-1 me-lg-4">
            <NavItem to="/dashboard" icon="bi-speedometer2" label="Dashboard" onClick={closeMenu} />
            <NavItem to="/login-history" icon="bi-box-arrow-in-right" label="Login History" onClick={closeMenu} />
            <NavItem to="/prompt-history" icon="bi-chat-dots" label="Prompt History" onClick={closeMenu} />
            <NavItem to="/registration-history" icon="bi-person-plus" label="Registration History" onClick={closeMenu} />
          </ul>

          <div className="d-flex align-items-center gap-4 ps-lg-4 mt-3 mt-lg-0" style={{ borderLeft: '1px solid var(--border)' }}>
            
            <div className="position-relative" style={{ cursor: 'pointer', color: 'var(--text-main)' }} title="Notifications">
              <Bell size={20} />
              <span className="position-absolute translate-middle p-1 bg-danger border border-light rounded-circle" style={{ top: '4px', right: '-8px' }}></span>
            </div>

            {/* Theme Toggle */}
            <div onClick={() => { setIsDark(!isDark); closeMenu(); }} style={{ cursor: 'pointer', color: 'var(--text-main)' }} title="Toggle Theme">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </div>
            
            {/* Profile Dropdown */}
            <div className="position-relative" ref={profileMenuRef}>
              <div 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{ cursor: 'pointer', color: 'var(--text-main)' }}
                title="Profile Menu"
              >
                <User size={20} />
              </div>

              {showProfileMenu && (
                <div 
                  className="dropdown-menu show shadow-lg rounded-4 p-3" 
                  style={{ position: 'absolute', top: '160%', right: '-10px', width: '280px', backgroundColor: 'var(--bg-glass)', border: '1px solid var(--border)', backdropFilter: 'blur(16px)', zIndex: 1050 }}
                >
                  <div className="d-flex flex-column align-items-center text-center mb-3 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div className="rounded-circle d-flex align-items-center justify-content-center mb-2" style={{ width: '50px', height: '50px', backgroundColor: 'var(--accent)', color: '#fff', fontSize: '1.5rem', fontWeight: 'bold' }}>
                      {currentUser.initials}
                    </div>
                    <h6 className="mb-0 fw-bold" style={{ color: 'var(--text-main)' }}>{currentUser.name}</h6>
                    <small style={{ color: 'var(--text-muted)' }}>{currentUser.email}</small>
                  </div>

                  <button 
                    className="btn w-100 text-start d-flex justify-content-center align-items-center gap-2 rounded-pill shadow-none mt-2" 
                    style={{ color: '#dc3545', border: '1px solid rgba(220, 53, 69, 0.3)', padding: '8px 16px' }}
                    onClick={handleLogout}
                  >
                    <LogOut size={18} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavItem = ({ to, icon, label, onClick }) => (
  <li className="nav-item">
    <NavLink 
      to={to} onClick={onClick} className={({ isActive }) => `nav-link rounded-pill px-3 py-2 d-flex align-items-center ${isActive ? 'active' : ''}`}
      style={({ isActive }) => ({ color: isActive ? 'var(--text-main)' : 'var(--text-muted)', backgroundColor: isActive ? 'var(--bg-pill)' : 'transparent', fontWeight: isActive ? '600' : '500', transition: 'all 0.2s ease' })}
    >
      <i className={`bi ${icon} me-2`}></i> {label}
    </NavLink>
  </li>
);

export default NavigationBar;