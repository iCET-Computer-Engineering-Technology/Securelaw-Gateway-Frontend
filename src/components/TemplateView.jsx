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
      {/* ── Toggle Button ── */}
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

      {/* ── Sidebar Panel ── */}
      <div
        className="sidebar"
        style={{
          width: isOpen ? "220px" : "0px",
          minWidth: isOpen ? "220px" : "0px",
          overflow: "hidden",
          transition: "width 0.3s ease, min-width 0.3s ease",
        }}
      >
        <div className="sidebar-header">Templates</div>

        {/* Search Bar */}
        <TemplateSearchBar onResults={onResults} />

        {/* Template Grid */}
        <div className="template-grid">
          {templates.length === 0 ? (
            <p className="no-templates">No templates found.</p>
          ) : (
            templates.map((template) => (
              <div
                key={template.id}
                className={`template-card ${selectedId === template.id ? "selected" : ""}`}
                onClick={() => onSelect(template)}
                onKeyDown={(e) => handleKeyDown(e, template)}
                tabIndex={0}
                role="button"
                aria-pressed={selectedId === template.id}
                aria-label={template.title || "Agreement"}
              >
                <div className="template-icon">
                  <svg width="28" height="32" viewBox="0 0 28 32" fill="none">
                    <path
                      d="M4 0H20L28 8V28C28 30.2 26.2 32 24 32H4C1.8 32 0 30.2 0 28V4C0 1.8 1.8 0 4 0Z"
                      fill="rgba(255,255,255,0.08)"
                    />
                    <path d="M20 0L28 8H22C20.9 8 20 7.1 20 6V0Z" fill="rgba(255,255,255,0.15)" />
                    <rect x="6" y="13" width="16" height="1.5" rx="0.75" fill="rgba(255,255,255,0.5)" />
                    <rect x="6" y="17" width="12" height="1.5" rx="0.75" fill="rgba(255,255,255,0.35)" />
                    <rect x="6" y="21" width="14" height="1.5" rx="0.75" fill="rgba(255,255,255,0.35)" />
                  </svg>
                </div>
                <span className="template-label">{template.title || "Agreement"}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default TemplateView;
