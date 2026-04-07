import React, { useState } from 'react';
import { LayoutGrid, MessageSquare, History, FileText, Users, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isExpanded, setIsExpanded] = useState(false);

  const navItems = [
    { icon: <LayoutGrid size={22} />, path: '/dashboard', title: 'Dashboard' },
    { icon: <MessageSquare size={22} />, path: '/chat', title: 'Chat' },
    { icon: <History size={22} />, path: '/login-history', title: 'Login History' },
    { icon: <FileText size={22} />, path: '/collection', title: 'Template Collection' },
    { icon: <Users size={22} />, path: '/users', title: 'User Management' },
  ];

  // ── NEW: Logout Logic ──
  const handleLogout = () => {
    // Frontend storage එකෙන් විතරක් දත්ත අයින් කරනවා
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    
    console.log("Logged out from frontend. Storage cleared.");
    
    // කෙලින්ම Login පේජ් එකට යවනවා
    navigate('/login');
  };

  // Check if we are currently on the Chat page
  const isChatPage = location.pathname === '/chat';

  return (
    <div className="d-flex" style={{ minHeight: '100vh', position: 'relative' }}>
      
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
        
        {/* Top Icons Area */}
        <div className="d-flex flex-column flex-grow-1 mt-3 w-100">
          {navItems.map((item) => (
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

        {/* Bottom Settings Icon (Acts as Logout) */}
        <div className="mb-4 w-100">
          <div 
            className="d-flex align-items-center"
            onClick={handleLogout} // මුළු row එකම එබුවම logout වෙන්න දුන්නා
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
            <span 
                style={{ 
                    opacity: isExpanded ? 1 : 0, 
                    transition: 'opacity 0.2s ease', 
                    fontWeight: 500, 
                    fontSize: '14px', 
                    marginLeft: '4px'
                }} 
            >
                Settings (Logout)
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
          height: 'calc(100vh - 70px)'
        }}
      >
        {children}
      </main>
    </div>
  );
}