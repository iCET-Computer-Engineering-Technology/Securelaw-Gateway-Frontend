import React, { useState, useEffect } from 'react';
import { LayoutGrid, MessageSquare, History, FileText, Users, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // ── STATE TO HOLD USER ROLE ──
  const [isSenior, setIsSenior] = useState(false);

  // ── DECODE TOKEN TO CHECK ROLE ON LOAD ──
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload.role || payload.authorities || '';
        // Check if role contains SENIOR or ADMIN
        if (role.toUpperCase().includes('SENIOR') || role.toUpperCase().includes('ADMIN')) {
          setIsSenior(true);
        }
      } catch (e) {
        console.error("Token decode error", e);
      }
    }
  }, []);

  // ── DEFINE WHICH ROLES SEE WHICH MENUS ──
  const allNavItems = [
    { icon: <LayoutGrid size={22} />, path: '/dashboard', title: 'Dashboard', seniorOnly: false },
    { icon: <MessageSquare size={22} />, path: '/chat', title: 'Chat', seniorOnly: false },
    { icon: <History size={22} />, path: '/login-history', title: 'Login History', seniorOnly: true },
    { icon: <FileText size={22} />, path: '/collection', title: 'Template Collection', seniorOnly: true },
    { icon: <Users size={22} />, path: '/users', title: 'User Management', seniorOnly: true },
  ];

  // Filter items: If it's a "seniorOnly" item, the user MUST be a senior to see it.
  const visibleNavItems = allNavItems.filter(item => !item.seniorOnly || isSenior);

  const isChatPage = location.pathname === '/chat';

  return (
    // ── THE VISUAL FIX: Added backgroundColor: 'var(--bg-main)' to the root wrapper ──
    <div className="d-flex" style={{ minHeight: '100vh', position: 'relative', backgroundColor: 'var(--bg-main)' }}>
      
      {/* ── EDGE-TO-EDGE GEMINI SIDEBAR ── */}
      <div 
        className="position-fixed d-flex flex-column" 
        style={{ 
          width: isExpanded ? '260px' : '72px', 
          left: '0',        
          top: '100px',      
          bottom: '0',      
          zIndex: 1000,
          backgroundColor: 'var(--bg-main)', 
          borderRight: '1px solid var(--border)', 
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
          overflow: 'hidden'
        }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        
        <div className="d-flex flex-column flex-grow-1 mt-3 w-100">
          {visibleNavItems.map((item) => (
            <div 
              key={item.path} 
              onClick={() => navigate(item.path)}
              title={!isExpanded ? item.title : ''} 
              className="d-flex align-items-center"
              style={{ 
                cursor: 'pointer', 
                color: location.pathname === item.path ? 'var(--text-main)' : 'var(--text-muted)',
                backgroundColor: location.pathname === item.path ? 'var(--bg-input)' : 'transparent',
                margin: '4px 12px', 
                padding: '12px 0', 
                borderRadius: '12px',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => { 
                e.currentTarget.style.color = 'var(--text-main)'; 
                e.currentTarget.style.backgroundColor = 'var(--bg-input)'; 
              }}
              onMouseLeave={(e) => { 
                if(location.pathname !== item.path) {
                    e.currentTarget.style.color = 'var(--text-muted)'; 
                    e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div style={{ minWidth: '48px', display: 'flex', justifyContent: 'center' }}>
                {item.icon}
              </div>

              <span 
                style={{ 
                  opacity: isExpanded ? 1 : 0, 
                  transition: 'opacity 0.2s ease',
                  fontWeight: 500, 
                  fontSize: '14px',
                  marginLeft: '4px'
                }}
              >
                {item.title}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom Settings Icon */}
        <div className="mb-4 w-100">
          <div 
            className="d-flex align-items-center"
            style={{ 
              cursor: 'pointer', color: 'var(--text-muted)', margin: '4px 12px', padding: '12px 0', borderRadius: '12px', 
              transition: 'all 0.2s ease', whiteSpace: 'nowrap' 
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.backgroundColor = 'var(--bg-input)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <div style={{ minWidth: '48px', display: 'flex', justifyContent: 'center' }}>
              <Settings size={22} />
            </div>
            <span style={{ opacity: isExpanded ? 1 : 0, transition: 'opacity 0.2s ease', fontWeight: 500, fontSize: '14px', marginLeft: '4px' }}>
              Settings
            </span>
          </div>
        </div>

      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <main 
        className="flex-grow-1" 
        style={{ 
          paddingLeft: isExpanded ? '260px' : '72px', 
          paddingTop: isChatPage ? '0px' : '20px', 
          paddingRight: isChatPage ? '0px' : '20px',
          transition: 'padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          width: '100%',
          /* ── THE VISUAL FIX: Changed 'height' to 'minHeight' so the dark background stretches! ── */
          minHeight: 'calc(100vh - 70px)'
        }}
      >
        {children}
      </main>
    </div>
  );
}