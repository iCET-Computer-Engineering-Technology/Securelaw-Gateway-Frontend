import React, { useState } from "react";
import TemplateSearchBar from "./TemplateSearchBar";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";

const TemplateView = ({ templates, onSelect, selectedId, onResults }) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleKeyDown = (e, template) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(template);
    }
  };

  return (
    <div className="position-relative d-flex h-100">
      
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn position-absolute d-flex align-items-center justify-content-center p-0 shadow-sm"
        style={{
            top: '20px',
            right: isOpen ? '-16px' : '-40px', // Hangs off the edge
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-pill)',
            border: '1px solid var(--border)',
            color: 'var(--text-main)',
            zIndex: 10,
            transition: 'all 0.3s ease'
        }}
        title={isOpen ? "Hide panel" : "Show panel"}
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* Sidebar Panel */}
      <div
        className="d-flex flex-column h-100"
        style={{
          width: isOpen ? "320px" : "0px",
          minWidth: isOpen ? "320px" : "0px",
          backgroundColor: 'var(--bg-glass)',
          borderRight: isOpen ? "1px solid var(--border)" : "none",
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflowX: "hidden",
          overflowY: "auto"
        }}
      >
        <div className="p-3 border-bottom" style={{ borderColor: 'var(--border)' }}>
            <h6 className="mb-3 fw-bold" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '1px' }}>
                TEMPLATE LIBRARY
            </h6>
            <TemplateSearchBar onResults={onResults} />
        </div>

        <div className="p-3 d-flex flex-column gap-2 overflow-auto custom-scrollbar">
          {templates.length === 0 ? (
            <div className="text-center mt-5 text-muted p-4">
                <FileText size={32} className="mb-2 opacity-50 mx-auto" />
                <p className="mb-0 small">No templates found.</p>
            </div>
          ) : (
            templates.map((template) => {
              const isSelected = selectedId === template.id;
              return (
                <div
                  key={template.id}
                  onClick={() => onSelect(template)}
                  onKeyDown={(e) => handleKeyDown(e, template)}
                  tabIndex={0}
                  role="button"
                  className="p-3 rounded-3 d-flex flex-column align-items-start"
                  style={{
                    backgroundColor: isSelected ? 'var(--accent)' : 'var(--bg-input)',
                    border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                    color: isSelected ? '#fff' : 'var(--text-main)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-pill)';
                  }}
                  onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-input)';
                  }}
                >
                  <div className="d-flex align-items-center gap-2 mb-1 w-100">
                    <FileText size={16} style={{ color: isSelected ? '#fff' : 'var(--accent)' }} />
                    <span className="fw-bold text-truncate" style={{ fontSize: '0.95rem' }}>
                      {template.name || template.title || "Untitled Template"}
                    </span>
                  </div>
                  
                  {template.description && (
                      <span className="small text-truncate w-100" style={{ opacity: isSelected ? 0.9 : 0.6 }}>
                          {template.description}
                      </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateView;