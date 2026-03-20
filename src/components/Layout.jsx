
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Layout({ children }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="d-flex vh-100 w-100 overflow-hidden" style={{ backgroundColor: '#0d0e15' }}>
      
      <aside className="d-flex flex-column align-items-center py-4"
             style={{ width: '72px', minWidth: '72px', backgroundColor: '#13141f', borderRight: '1px solid #232533', zIndex: 20 }}>
        
        <div className="d-flex flex-column gap-4 mt-3">
          
          <button className="btn p-0 border-0" style={{ color: '#6c757d' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>

          <Link to="/collection" className={`btn p-0 border-0 ${isActive('/collection') ? 'text-white' : 'text-secondary'}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
          </Link>

          <Link to="/upload" className={`btn p-0 border-0 ${isActive('/upload') ? 'text-white' : 'text-secondary'}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </Link>

        </div>
      </aside>

      <div className="d-flex flex-column flex-grow-1 position-relative overflow-hidden">
        <header className="d-flex justify-content-end align-items-center px-4"
                style={{ height: '64px', backgroundColor: '#1a1c29', borderBottom: '1px solid #2b2f42', zIndex: 10 }}>
          <button className="btn p-0 text-secondary rounded-circle d-flex align-items-center justify-content-center" 
                  style={{ width: '38px', height: '38px', border: '1px solid #495057' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>
        </header>

        <main className="flex-grow-1 p-4 overflow-auto d-flex flex-column align-items-center">
          {children}
        </main>
      </div>
    </div>
  );
}