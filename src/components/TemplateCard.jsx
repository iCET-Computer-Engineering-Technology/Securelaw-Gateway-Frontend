import React from 'react';
import { useTheme } from '../context/Themecontext'; 

export default function TemplateCard({ template, onClick }) {
  const { isDarkMode } = useTheme();

  return (
    <div 
      className="d-flex flex-column align-items-center" 
      style={{ width: '130px', cursor: 'pointer', transition: 'transform 0.2s' }}
      onClick={() => onClick(template)}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      <div 
        className="w-100 rounded-2 p-3 shadow-sm mb-2 d-flex flex-column align-items-center justify-content-center text-center overflow-hidden position-relative" 
        style={{ 
          height: '160px', 
          backgroundColor: 'var(--bg-input)', 
          border: '1px solid var(--border-color)', 
          transition: 'background-color 0.3s ease, border-color 0.3s ease' 
        }}
      >
        
        <div className="fw-bold mb-2 w-100" style={{ fontSize: '13px', color: 'var(--text-main)', wordBreak: 'break-word', lineHeight: '1.2' }}>
          {template.name}
        </div>

        <div className="mt-auto mb-2" style={{ color: isDarkMode ? '#ff6b6b' : '#dc3545' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>

        <div style={{ fontSize: '10px', color: 'var(--text-main)', backgroundColor: 'var(--bg-main)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
          {template.category || 'Document'}
        </div>

      </div>
      
      <span className="text-truncate w-100 text-center" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        By {template.author || 'Unknown'}
      </span>
    </div>
  );
}