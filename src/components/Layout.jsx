import React, { useState, useEffect } from 'react';
import { LayoutGrid, MessageSquare, MessageCircle, History, FileText, Users, Settings, Terminal, X, Check } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSenior, setIsSenior] = useState(false);

  // ── STATE FOR SETTINGS MODAL ──
  const [showSettings, setShowSettings] = useState(false);
  const [tempColor, setTempColor] = useState('#0d6efd'); // The color actively in the picker
  const [activeThemeColor, setActiveThemeColor] = useState(''); // The officially applied color

  useEffect(() => {
    // Check user role
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload.role || payload.authorities || '';
        if (role.toUpperCase().includes('SENIOR') || role.toUpperCase().includes('ADMIN')) {
          setIsSenior(true);
        }
      } catch (e) {
        console.error("Token decode error", e);
      }
    }

    // Load saved custom color on mount
    const savedColor = localStorage.getItem('customAppColor');
    if (savedColor) {
      setTempColor(savedColor);
      setActiveThemeColor(savedColor);
      document.documentElement.style.setProperty('--accent', savedColor);
    }
  }, []);

  // ── APPLY COLOR TO ENTIRE UI ──
  const handleApplyColor = () => {
    setActiveThemeColor(tempColor);
    document.documentElement.style.setProperty('--accent', tempColor);
    localStorage.setItem('customAppColor', tempColor);
  };

  // ── RESET TO DEFAULT BLUE/GREY ──
  const resetToDefault = () => {
    setTempColor('#0d6efd');
    setActiveThemeColor(''); // This turns off the background tint!
    document.documentElement.style.removeProperty('--accent');
    localStorage.removeItem('customAppColor');
  };

  const allNavItems = [
    { icon: <MessageSquare size={22} />, path: '/chat', title: 'AI Chat', seniorOnly: false },
    { icon: <MessageCircle size={22} />, path: '/messages', title: 'Team Messages', seniorOnly: false },
    { icon: <Terminal size={22} />, path: '/prompt-history', title: 'Prompt History', seniorOnly: false },
    
    { icon: <LayoutGrid size={22} />, path: '/dashboard', title: 'Dashboard', seniorOnly: true }, 
    { icon: <History size={22} />, path: '/login-history', title: 'Login History', seniorOnly: true },
    { icon: <FileText size={22} />, path: '/collection', title: 'Template Collection', seniorOnly: true },
    { icon: <Users size={22} />, path: '/users', title: 'User Management', seniorOnly: true },
  ];

  const visibleNavItems = allNavItems.filter(item => !item.seniorOnly || isSenior);
  const isChatPage = location.pathname === '/chat' || location.pathname === '/messages';

  return (
    <>
      {/* ── THE MAGIC: Dynamic CSS Theme Generator ── */}
      {/* This gently mixes your chosen color into all the backgrounds! */}
      {activeThemeColor && (
        <style>
          {`
            :root {
              --bg-main: color-mix(in srgb, var(--accent) 6%, #f4f6f8) !important;
              --bg-glass: color-mix(in srgb, var(--accent) 8%, #ffffff) !important;
              --bg-card: color-mix(in srgb, var(--accent) 8%, #ffffff) !important;
              --bg-pill: color-mix(in srgb, var(--accent) 15%, #e9ecef) !important;
              --bg-input: color-mix(in srgb, var(--accent) 6%, #ffffff) !important;
            }
            [data-theme='dark'] {
              --bg-main: color-mix(in srgb, var(--accent) 8%, #1a1c23) !important;
              --bg-glass: color-mix(in srgb, var(--accent) 12%, #252830) !important;
              --bg-card: color-mix(in srgb, var(--accent) 12%, #2d3039) !important;
              --bg-pill: color-mix(in srgb, var(--accent) 25%, #252830) !important;
              --bg-input: color-mix(in srgb, var(--accent) 10%, #1a1c23) !important;
            }
          `}
        </style>
      )}

      <div className="d-flex" style={{ minHeight: '100vh', position: 'relative', backgroundColor: 'var(--bg-main)', transition: 'background-color 0.3s ease' }}>
        
        <div 
          className="position-fixed d-flex flex-column" 
          style={{ 
            width: isExpanded ? '260px' : '72px', left: '0', top: '100px', bottom: '0', zIndex: 1000,
            backgroundColor: 'var(--bg-main)', borderRight: '1px solid var(--border)', 
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease', overflow: 'hidden'
          }}
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
        >
          <div className="d-flex flex-column flex-grow-1 mt-3 w-100">
            {visibleNavItems.map((item) => (
              <div 
                key={item.path} onClick={() => navigate(item.path)} title={!isExpanded ? item.title : ''} 
                className="d-flex align-items-center"
                style={{ 
                  cursor: 'pointer', margin: '4px 12px', padding: '12px 0', borderRadius: '12px', whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  color: location.pathname === item.path ? 'var(--text-main)' : 'var(--text-muted)',
                  backgroundColor: location.pathname === item.path ? 'var(--bg-input)' : 'transparent',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.backgroundColor = 'var(--bg-input)'; }}
                onMouseLeave={(e) => { if(location.pathname !== item.path) { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; } }}
              >
                <div style={{ minWidth: '48px', display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
                <span style={{ opacity: isExpanded ? 1 : 0, transition: 'opacity 0.2s ease', fontWeight: 500, fontSize: '14px', marginLeft: '4px' }}>
                  {item.title}
                </span>
              </div>
            ))}
          </div>

          <div className="mb-4 w-100">
            <div 
              onClick={() => setShowSettings(true)}
              className="d-flex align-items-center"
              style={{ cursor: 'pointer', color: 'var(--text-muted)', margin: '4px 12px', padding: '12px 0', borderRadius: '12px', transition: 'all 0.2s ease', whiteSpace: 'nowrap' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.backgroundColor = 'var(--bg-input)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <div style={{ minWidth: '48px', display: 'flex', justifyContent: 'center' }}><Settings size={22} /></div>
              <span style={{ opacity: isExpanded ? 1 : 0, transition: 'opacity 0.2s ease', fontWeight: 500, fontSize: '14px', marginLeft: '4px' }}>Settings</span>
            </div>
          </div>
        </div>

        <main 
          className="flex-grow-1" 
          style={{ 
            paddingLeft: isExpanded ? '260px' : '72px', 
            paddingTop: isChatPage ? '0px' : '20px', 
            paddingRight: isChatPage ? '0px' : '20px',
            transition: 'padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            width: '100%', minHeight: 'calc(100vh - 70px)'
          }}
        >
          {children}
        </main>

        {/* ── Settings Modal Popup ── */}
        {showSettings && (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 1050 }}>
            <div className="glass-panel p-4 position-relative shadow-lg" style={{ width: '90%', maxWidth: '420px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0 fw-bold" style={{ color: 'var(--text-main)' }}>Appearance Settings</h5>
                <button 
                  onClick={() => setShowSettings(false)} 
                  className="btn p-0 d-flex align-items-center justify-content-center" 
                  style={{ color: 'var(--text-main)', width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-pill)', border: '1px solid var(--border)' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mb-4">
                <label className="fw-bold mb-3 d-block text-uppercase" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '1px' }}>
                  UI Accent Color
                </label>

                <div className="d-flex align-items-center justify-content-between p-3 rounded-4 mb-3" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)' }}>
                  <div className="d-flex align-items-center gap-3">
                    <input
                      type="color"
                      className="form-control form-control-color shadow-none p-0 border-0 rounded-circle overflow-hidden"
                      value={tempColor}
                      onChange={(e) => setTempColor(e.target.value)}
                      style={{ width: '45px', height: '45px', cursor: 'pointer', backgroundColor: 'transparent' }}
                      title="Choose your color"
                    />
                    <div>
                      <h6 className="mb-1 fw-bold" style={{ color: 'var(--text-main)' }}>Custom Theme</h6>
                      <p className="mb-0" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Pick a color</p>
                    </div>
                  </div>

                  <button 
                    onClick={handleApplyColor} 
                    className="btn btn-sm px-3 py-2 fw-bold rounded-pill d-flex align-items-center gap-2 shadow-sm" 
                    style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', transition: 'all 0.2s' }}
                  >
                    <Check size={16} /> Apply
                  </button>
                </div>
              </div>

              <button 
                onClick={resetToDefault} 
                className="btn w-100 fw-bold py-2 shadow-sm" 
                style={{ backgroundColor: 'var(--bg-pill)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '12px' }}
              >
                Reset to Default Theme
              </button>

            </div>
          </div>
        )}

      </div>
    </>
  );
}