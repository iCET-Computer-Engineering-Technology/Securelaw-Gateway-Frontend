import React, { useState } from "react";
import TemplateSearchBar from "./TemplateSearchBar";

const TemplateView = ({ templates, onSelect, selectedId, onResults }) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleKeyDown = (e, template) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(template);
    }
  };

  return (
    <>
      <button
        className="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? "Hide panel" : "Show panel"}
      >
        {isOpen ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      <div
        className="sidebar d-flex flex-column"
        style={{
          width: isOpen ? "340px" : "0px",
          minWidth: isOpen ? "340px" : "0px",
          /* ── THE FIX: Changed from 300px to 100% so it stretches all the way down ── */
          height: "100%", 
          minHeight: "100%",
          overflowY: "auto", // Allows scrolling inside the sidebar if you have many templates
          overflowX: "hidden",
          transition: "width 0.3s ease, min-width 0.3s ease",
          borderRight: isOpen ? "1px solid var(--border)" : "none"
        }}
      >
        <div className="sidebar-header px-2 pt-2 pb-1" style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px', color: 'var(--text-muted)' }}>
          TEMPLATES
        </div>
        
        <TemplateSearchBar onResults={onResults} />

        <div className="template-grid mt-2 pb-4">
          {templates.length === 0 ? (
            <p className="no-templates text-center w-100 mt-4" style={{ gridColumn: '1 / -1' }}>No templates found.</p>
          ) : (
            templates.map((template) => (
              <div
                key={template.id}
                className={`sidebar-template-card ${selectedId === template.id ? "selected" : ""}`}
                onClick={() => onSelect(template)}
                onKeyDown={(e) => handleKeyDown(e, template)}
                tabIndex={0}
                role="button"
                aria-pressed={selectedId === template.id}
              >
                <div className="template-icon mb-1">
                  <svg width="24" height="28" viewBox="0 0 28 32" fill="none">
                    <path d="M4 0H20L28 8V28C28 30.2 26.2 32 24 32H4C1.8 32 0 30.2 0 28V4C0 1.8 1.8 0 4 0Z" fill="rgba(100,100,100,0.1)" />
                    <path d="M20 0L28 8H22C20.9 8 20 7.1 20 6V0Z" fill="rgba(100,100,100,0.2)" />
                    <rect x="6" y="13" width="16" height="1.5" rx="0.75" fill="rgba(100,100,100,0.4)" />
                    <rect x="6" y="17" width="12" height="1.5" rx="0.75" fill="rgba(100,100,100,0.4)" />
                    <rect x="6" y="21" width="14" height="1.5" rx="0.75" fill="rgba(100,100,100,0.4)" />
                  </svg>
                </div>
                <span className="template-label text-center" style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-main)' }}>
                  {template.name || template.title || "Untitled"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default TemplateView;