import React, { useState, useEffect } from 'react';
import { X, Trash2, Download, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import mammoth from 'mammoth';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function TemplateModel({ template, onClose, onDelete }) {
  const navigate = useNavigate();
  
  const [docxContent, setDocxContent] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState(false);

  const fileType = template?.fileType || template?.name || '';
  const isPdf = fileType.toLowerCase().includes('pdf');
  const isImage = fileType.match(/\.(jpeg|jpg|gif|png)$/) != null || fileType.includes('image');
  const isWord = fileType.includes('word') || fileType.includes('document') || fileType.toLowerCase().endsWith('.docx');

  const pdfViewUrl = template ? `http://localhost:8080/api/templates/${template.id}/view` : '';

  useEffect(() => {
    if (isWord && template) {
      setIsExtracting(true);
      setExtractError(false);
      axios.get(pdfViewUrl, { responseType: 'arraybuffer' })
        .then(response => mammoth.convertToHtml({ arrayBuffer: response.data }))
        .then(result => { setDocxContent(result.value); setIsExtracting(false); })
        .catch(err => { console.error(err); setExtractError(true); setIsExtracting(false); });
    }
  }, [isWord, template, pdfViewUrl]);

  const handleUseTemplate = () => {
    sessionStorage.setItem('activeTemplate', JSON.stringify(template));
    onClose();
    navigate('/workspace');
  };

  if (!template) return null;

  const previewBgColor = isPdf ? '#ffffff' : 'var(--bg-input)';

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 1050 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 40 }}
        transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.8 }}
        className="glass-panel d-flex flex-column flex-lg-row position-relative overflow-hidden"
        style={{ maxWidth: '1000px', width: '95%', height: '80vh', border: '1px solid var(--border)', boxShadow: '0 30px 60px rgba(0,0,0,0.4)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="btn position-absolute top-0 end-0 m-3 p-2 rounded-circle d-flex align-items-center justify-content-center" style={{ backgroundColor: 'var(--bg-pill)', color: 'var(--text-main)', border: '1px solid var(--border)', zIndex: 10 }}>
          <X size={20} />
        </button>

        {/* LEFT SIDE: PREVIEW PANE */}
        <div className="h-100 position-relative" style={{ flex: '1 1 55%', backgroundColor: previewBgColor, borderRight: '1px solid var(--border)' }}>
          {isPdf ? (
            <iframe src={`${pdfViewUrl}#toolbar=0&navpanes=0`} title={template.name} width="100%" height="100%" style={{ border: 'none', backgroundColor: '#ffffff' }} />
          ) : isImage ? (
            <div className="w-100 h-100 d-flex align-items-center justify-content-center p-3">
               <img src={pdfViewUrl} alt={template.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
          ) : isWord ? (
            <div className="w-100 h-100 d-flex flex-column align-items-center p-4" style={{ overflowY: 'auto' }}>
              <div className="shadow-sm position-relative docx-paper" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', width: '100%', maxWidth: '500px', minHeight: '100%', padding: '50px 40px', color: 'var(--text-main)', textAlign: 'left' }}>
                <style>{`.docx-paper * { color: var(--text-main) !important; }`}</style>
                <a href={pdfViewUrl} download className="btn btn-sm position-absolute top-0 end-0 m-3 d-flex align-items-center shadow-sm" style={{ backgroundColor: 'var(--accent)', color: 'white', borderRadius: '8px' }}><Download size={14} className="me-1" /> Original</a>
                {isExtracting ? (
                    <div className="d-flex flex-column align-items-center justify-content-center h-100 opacity-50 text-center pt-5"><div className="spinner-border text-primary mb-3"></div><p>Extracting text...</p></div>
                ) : extractError ? (
                    <div className="text-center pt-5 text-danger opacity-75"><FileText size={40} className="mb-3" /><p>Could not extract text.</p></div>
                ) : (
                    <div dangerouslySetInnerHTML={{ __html: docxContent }} style={{ fontSize: '14.5px', lineHeight: '1.7', marginTop: '20px' }} />
                )}
              </div>
            </div>
          ) : (
             <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-center p-4"><p className="text-muted">Preview not available.</p></div>
          )}
        </div>

        {/* RIGHT SIDE: DETAILS PANE */}
        <div className="d-flex flex-column p-4 p-md-5" style={{ flex: '1 1 45%', overflowY: 'auto' }}>
          
          <div className="mb-4 mt-2">
            {/* Explicitly forcing var(--text-main) inline so Bootstrap can't override it */}
            <h2 className="mb-2" style={{ fontSize: '28px', fontWeight: '600', color: 'var(--text-main)' }}>
              {template.name}
            </h2>
            <div style={{ fontSize: '14px', color: 'var(--text-main)', opacity: 0.8 }}>
              Published by <span style={{ fontWeight: '600', color: 'var(--text-main)', opacity: 1 }}>{template.author || 'Unknown'}</span>
            </div>
          </div>

          <div className="mb-4">
            <span className="badge px-3 py-2 mb-3" style={{ backgroundColor: 'var(--bg-pill)', border: '1px solid var(--border)', fontWeight: 'normal', color: 'var(--text-main)' }}>
              {template.category || 'Uncategorized'}
            </span>
            <div style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--text-main)', opacity: 0.8 }}>
              {template.description || 'No description provided for this template.'}
            </div>
          </div>

          <div className="mt-auto d-flex gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="btn flex-grow-1 py-3 fw-bold rounded-3"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.2)' }}
              onClick={handleUseTemplate}
            >
              Use Template
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onDelete}
              className="btn rounded-3 d-flex align-items-center justify-content-center px-4"
              style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)', border: '1px solid rgba(255, 0, 0, 0.2)', color: '#ff4d4d' }}
            >
              <Trash2 size={20} />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}