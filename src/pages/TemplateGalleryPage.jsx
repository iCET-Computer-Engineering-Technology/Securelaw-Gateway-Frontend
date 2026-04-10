import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Mic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TemplateCard from '../components/TemplateCard';
import TemplateModel from '../components/TemplateModel';
import UploadPage from '../pages/UploadPages';
import { showAiError, showAiSuccess, showAiWarning } from '../utils/aiAlerts';

export default function TemplateGalleryPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const fetchAllTemplates = () => {
    setLoading(true);
    const token = localStorage.getItem('token'); // ── FIXED ──
    
    axios.get('http://localhost:8080/api/templates', {
        headers: { Authorization: `Bearer ${token}` } 
    })
      .then(response => {
        setTemplates(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAllTemplates();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (!searchQuery.trim()) {
        fetchAllTemplates();
        return;
      }
      setLoading(true);
      const token = localStorage.getItem('token'); // ── FIXED ──
      
      axios.get(`http://localhost:8080/api/templates/search?query=${searchQuery}`, {
          headers: { Authorization: `Bearer ${token}` } 
      })
        .then(response => {
          setTemplates(response.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const handleDeleteTemplate = async (idToRemove) => {
    const result = await showAiWarning({
      title: 'Delete Template?',
      text: 'Are you sure you want to permanently delete this template?',
      showCancelButton: true,
      confirmButtonText: 'Delete Template',
      cancelButtonText: 'Keep It',
      reverseButtons: true,
      allowOutsideClick: false,
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem('token'); // ── FIXED ──
      await axios.delete(`http://localhost:8080/api/templates/${idToRemove}`, {
          headers: { Authorization: `Bearer ${token}` } 
      });
      setTemplates(prev => prev.filter(tmpl => tmpl.id !== idToRemove));
      setSelectedTemplate(null);
      showAiSuccess({
        title: 'Template Deleted',
        text: 'The selected template has been removed successfully.',
        timer: 2200,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Failed to delete:', error);
      showAiError({
        title: 'Delete Failed',
        text: 'The template could not be deleted right now. Please try again.',
      });
    }
  };

  return (
    <div className="d-flex flex-column w-100 mx-auto app-page-scroll app-page-scroll--column" style={{ maxWidth: '1280px', color: 'var(--text-main)' }}>
      <div className="mb-4 flex-shrink-0">
        <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}>
          <h2 className="fw-bold mb-1" style={{ fontSize: '1.9rem', letterSpacing: '-0.5px' }}>Template Collection</h2>
          <p className="mb-0" style={{ color: 'var(--text-gallery-small)', fontSize: '1.05rem' }}>Browse, upload, and manage your legal documents.</p>
        </motion.div>
      </div>

      <div className="w-100 d-flex flex-column overflow-hidden mb-2" style={{ flexGrow: 1, minHeight: 0 }}>
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 pb-3 flex-shrink-0 w-100" style={{ paddingRight: '15px' }}>
          <form onSubmit={handleSearchSubmit} className="position-relative" style={{ width: '100%', maxWidth: '350px' }}>
            <div className="position-absolute d-flex align-items-center justify-content-center" style={{ left: '15px', top: '0', bottom: '0', pointerEvents: 'none' }}><Search size={18} color="var(--text-muted)" /></div>
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control rounded-pill shadow-none"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-main)', paddingLeft: '45px', paddingRight: '45px', height: '42px', fontWeight: '500' }}
            />
            <div className="position-absolute d-flex align-items-center justify-content-center" style={{ right: '15px', top: '0', bottom: '0', cursor: 'pointer' }}><Mic size={18} color="var(--text-muted)" /></div>
          </form>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="btn d-flex align-items-center px-4 py-2 fw-bold shadow-sm"
            style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '12px', height: '42px' }}
            onClick={() => setIsUploadOpen(true)}
          >
            <i className="bi bi-cloud-arrow-up-fill me-2 fs-5"></i> Upload Template
          </motion.button>
        </div>

        <div className="pt-2 custom-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingRight: '15px', paddingBottom: '60px' }}>
          <motion.div className="d-flex flex-wrap gap-4 pb-5" initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }}>
            {loading ? (
              <h4 style={{ color: 'var(--text-muted)' }}>Searching...</h4>
            ) : templates.length === 0 ? (
              <h4 style={{ color: 'var(--text-muted)' }}>No templates found.</h4>
            ) : (
              templates.map((tmpl) => (
                <motion.div key={tmpl.id} variants={{ hidden: { opacity: 0, scale: 0.8, y: 20 }, show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } } }}>
                  <TemplateCard template={tmpl} onClick={setSelectedTemplate} />
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {selectedTemplate && <TemplateModel template={selectedTemplate} onClose={() => setSelectedTemplate(null)} onDelete={() => handleDeleteTemplate(selectedTemplate.id)} />}
        {isUploadOpen && (
          <UploadPage
            onClose={() => setIsUploadOpen(false)}
            onUploadSuccess={fetchAllTemplates}
          />
        )}
      </AnimatePresence>
    </div>
  );
}