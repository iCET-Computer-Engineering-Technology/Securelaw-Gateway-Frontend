import React, { useState, useEffect } from 'react';
import { LayoutGrid, MessageSquare, MessageCircle, History, FileText, Users, Settings, Terminal } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSenior, setIsSenior] = useState(false);

  useEffect(() => {
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
  }, []);

  // ── UPDATED ROLE PERMISSIONS ──
  const allNavItems = [
    { icon: <MessageSquare size={22} />, path: '/chat', title: 'AI Chat', seniorOnly: false },
    { icon: <MessageCircle size={22} />, path: '/messages', title: 'Team Messages', seniorOnly: false },
    { icon: <Terminal size={22} />, path: '/prompt-history', title: 'Prompt History', seniorOnly: false }, // ── Junior CAN see ──
    
    { icon: <LayoutGrid size={22} />, path: '/dashboard', title: 'Dashboard', seniorOnly: true }, // ── Junior CANNOT see ──
    { icon: <History size={22} />, path: '/login-history', title: 'Login History', seniorOnly: true },
    { icon: <FileText size={22} />, path: '/collection', title: 'Template Collection', seniorOnly: true },
    { icon: <Users size={22} />, path: '/users', title: 'User Management', seniorOnly: true },
  ];

  const visibleNavItems = allNavItems.filter(item => !item.seniorOnly || isSenior);
  const isChatPage = location.pathname === '/chat' || location.pathname === '/messages';

  return (
    <div className="d-flex" style={{ minHeight: '100vh', position: 'relative', backgroundColor: 'var(--bg-main)' }}>
      
      <div 
        className="position-fixed d-flex flex-column" 
        style={{ 
          width: isExpanded ? '260px' : '72px', left: '0', top: '100px', bottom: '0', zIndex: 1000,
          backgroundColor: 'var(--bg-main)', borderRight: '1px solid var(--border)', 
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)', overflow: 'hidden'
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
    </div>
  );
}