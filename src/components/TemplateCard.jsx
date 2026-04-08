import React from 'react';
import { FileText } from 'lucide-react';

export default function TemplateCard({ template, onClick }) {
  return (
    <div 
      onClick={() => onClick(template)}
      className="d-flex flex-column align-items-center justify-content-center p-3"
      style={{
        width: '135px',       /* REDUCED: Made cards narrower */
        height: '180px',      /* REDUCED: Made cards shorter */
        backgroundColor: 'var(--bg-pill)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '16px', 
        cursor: 'pointer',
        border: '1px solid var(--border)', 
        transition: 'all 0.2s ease',
        boxShadow: 'var(--shadow-premium)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.backgroundColor = 'var(--bg-glass)'; 
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.backgroundColor = 'var(--bg-pill)';
      }}
    >
      {/* Scaled the icon down slightly from 40 to 36 to match the smaller card */}
      <FileText size={36} color="var(--text-main)" className="mb-3" strokeWidth={1.5} />
      
      <span 
        className="text-center px-2 w-100" 
        style={{ 
          color: 'var(--text-main)',
          fontSize: '13px',   /* Scaled the font down slightly */
          fontWeight: '600', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap', 
          transition: 'color 0.3s ease'
        }}
      >
        {template.name || template.title || 'Agreement'}
      </span>
    </div>
  );
}