import React from 'react';
import { Bookmark } from 'lucide-react'; 

export default function TemplateModel({ template, onClose }) {
  if (!template) return null;

  // This is the URL that points to your new Spring Boot endpoint
  const pdfViewUrl = `http://localhost:8080/api/templates/${template.id}/view`;

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 1050, backdropFilter: 'blur(3px)' }}
      onClick={onClose} 
    >
      <div 
        className="rounded-4 p-4 p-md-5 d-flex flex-column flex-md-row gap-4 shadow-lg position-relative"
        style={{ backgroundColor: '#222534', border: '1px solid #32364a', maxWidth: '900px', width: '95%' }}
        onClick={(e) => e.stopPropagation()} 
      >
        
        {/* LEFT SIDE: The REAL PDF Viewer using an iframe */}
        <div 
          className="rounded-2 shadow-sm overflow-hidden" 
          style={{ width: '100%', maxWidth: '350px', height: '450px', backgroundColor: '#e2e4e9' }}
        >
          {/* If it's a PDF, show it in the iframe */}
          {template.fileType === 'application/pdf' ? (
            <iframe 
              src={`${pdfViewUrl}#toolbar=0&navpanes=0`} // Hides the clunky PDF toolbars
              title={template.name}
              width="100%" 
              height="100%" 
              style={{ border: 'none' }}
            />
          ) : (
            /* Fallback just in case they uploaded a .docx or .txt file */
            <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-dark p-4 text-center">
              <div className="fs-5 fw-bold mb-2">{template.name}</div>
              <div className="small text-secondary">Document Preview Not Available for this file type.</div>
            </div>
          )}
        </div>

        {/* RIGHT SIDE: Real Details from Database */}
        <div className="d-flex flex-column justify-content-center flex-grow-1 py-3">
          <h2 className="text-white mb-1" style={{ fontSize: '28px', fontWeight: '500' }}>
            {template.name}
          </h2>
          <p className="text-secondary mb-4" style={{ fontSize: '14px' }}>
            By {template.author || 'Unknown'} • {template.category || 'Uncategorized'}
          </p>
          
          {/* Shows the actual description you typed in the upload form */}
          <p className="text-light mb-5" style={{ fontSize: '14px', lineHeight: '1.6', opacity: 0.8 }}>
            {template.description || 'No description provided for this template.'}
          </p>

          <div className="d-flex gap-3 mt-auto align-items-center">
            {/* The Download Button */}
            <a 
              href={`http://localhost:8080/api/templates/${template.id}/download`}
              className="btn btn-primary flex-grow-1 rounded-3 py-2 d-flex justify-content-center align-items-center text-decoration-none" 
              style={{ backgroundColor: '#1da1f2', border: 'none', fontWeight: '500' }}
            >
              Download Template
            </a>
            
            <button 
              className="btn rounded-3 d-flex align-items-center justify-content-center px-3"
              style={{ border: '1px solid #495057', height: '100%' }}
            >
              <Bookmark size={20} className="text-secondary" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}