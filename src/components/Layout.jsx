import React from 'react';
import { LayoutGrid, MessageSquare, History, FileText, Users, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: <LayoutGrid size={22} />, path: '/dashboard', title: 'Dashboard' },
    { icon: <MessageSquare size={22} />, path: '/chat', title: 'Chat' },
    { icon: <History size={22} />, path: '/login-history', title: 'Login History' },
    { icon: <FileText size={22} />, path: '/collection', title: 'Template Collection' }, // <-- Your new dedicated icon!
    { icon: <Users size={22} />, path: '/users', title: 'User Management' },
  ];

  return (
    <div className="d-flex" style={{ minHeight: '100vh', position: 'relative' }}>
      
      {/* Floating Left Sidebar */}
      <div className="position-fixed d-flex flex-column align-items-center py-4 floating-pill" 
           style={{ width: '60px', left: '20px', top: '90px', bottom: '20px', zIndex: 1000 }}>
        
        <div className="d-flex flex-column gap-4 flex-grow-1 mt-2">
          {navItems.map((item) => (
            <div 
              key={item.path} 
              onClick={() => navigate(item.path)}
              title={item.title}
              style={{ 
                cursor: 'pointer', 
                color: location.pathname === item.path ? 'var(--text-main)' : 'var(--text-muted)',
                transition: 'all 0.2s ease',
                transform: location.pathname === item.path ? 'scale(1.1)' : 'scale(1)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
              onMouseLeave={(e) => { 
                if(location.pathname !== item.path) {
                    e.currentTarget.style.color = 'var(--text-muted)'; 
                    e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              {item.icon}
            </div>
          ))}
        </div>

        <div style={{ cursor: 'pointer', color: 'var(--text-muted)' }} title="Settings">
          <Settings size={22} />
        </div>
      </div>

      {/* Change paddingLeft to 85px to pull everything closer to the sidebar! */}
<main className="flex-grow-1" style={{ paddingLeft: '85px', paddingTop: '20px', paddingRight: '20px' }}>
  {children}
</main>
    </div>
  );
}