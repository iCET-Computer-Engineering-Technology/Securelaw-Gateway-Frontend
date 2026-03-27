import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import TemplateCard from '../components/TemplateCard';
import TemplateModel from '../components/TemplateModel'; 
import Layout from '../components/Layout'; 

export default function TemplateGalleryPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const navigate = useNavigate(); 
    
  const fetchAllTemplates = () => {
    setLoading(true);
    axios.get('http://localhost:8080/api/templates')
      .then(response => { setTemplates(response.data); setLoading(false); })
      .catch(err => { console.error("Error:", err); setLoading(false); });
  };

  useEffect(() => { fetchAllTemplates(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return fetchAllTemplates();
    setLoading(true);
    axios.get(`http://localhost:8080/api/templates/search?query=${searchQuery}`)
      .then(response => { setTemplates(response.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  const handleDeleteTemplate = async (idToRemove) => {
    if (!window.confirm("Are you sure you want to permanently delete this template?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/templates/${idToRemove}`);
      setTemplates(prev => prev.filter(tmpl => tmpl.id !== idToRemove));
      setSelectedTemplate(null);
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  return (
    <Layout>
      {/* 1. Pure standard wrapper. w-100 ensures it perfectly matches your Layout.jsx boundaries just like other pages. */}
      <div className="d-flex flex-column w-100" style={{ height: 'calc(100vh - 110px)', color: 'var(--text-main)' }}>
        
        {/* 2. TITLE SECTION: Flushed perfectly to the left, with standard mb-4 spacing */}
        <div className="mb-4 flex-shrink-0">
          <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}>
            <h2 className="fw-bold mb-1" style={{ fontSize: '1.9rem', letterSpacing: '-0.5px' }}>Template Collection</h2>
            <p className="mb-0" style={{ color: 'var(--text-gallery-small)', fontSize: '1.05rem' }}>Browse, upload, and manage your legal documents.</p>
          </motion.div>
        </div>

        {/* 3. MAIN GLASS PANEL: w-100 ensures it stretches exactly to the same edges as Dashboard tables */}
        <div className="glass-panel w-100 d-flex flex-column overflow-hidden" style={{ flexGrow: 1, minHeight: 0 }}>
          
          {/* TOP BAR */}
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 p-4 px-md-5 flex-shrink-0">
            <form onSubmit={handleSearch} className="position-relative" style={{ width: '100%', maxWidth: '350px' }}>
              <div className="position-absolute d-flex align-items-center justify-content-center" style={{ left: '15px', top: '0', bottom: '0', pointerEvents: 'none' }}><Search size={18} color="var(--text-muted)" /></div>
              <input type="text" placeholder="Search templates..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="form-control rounded-pill shadow-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-main)', paddingLeft: '45px', paddingRight: '45px', height: '42px', fontWeight: '500' }} />
              <div className="position-absolute d-flex align-items-center justify-content-center" style={{ right: '15px', top: '0', bottom: '0', cursor: 'pointer' }}><Mic size={18} color="var(--text-muted)" /></div>
            </form>
            
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="btn d-flex align-items-center px-4 py-2 fw-bold shadow-sm" style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '12px' }} onClick={() => navigate('/upload')}>
              <i className="bi bi-cloud-arrow-up-fill me-2 fs-5"></i> Upload Template
            </motion.button>
          </div>

          {/* INNER SCROLL AREA */}
          <div className="p-4 px-md-5 pt-2 custom-scrollbar" style={{ backgroundColor: 'var(--bg-grid-white)', flexGrow: 1, overflowY: 'auto' }}>
            <motion.div className="d-flex flex-wrap justify-content-center gap-4 pb-4" initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }}>
              {loading ? ( <h4 style={{ color: 'var(--text-muted)' }}>Loading...</h4> ) : templates.length === 0 ? ( <h4 style={{ color: 'var(--text-muted)' }}>No templates found.</h4> ) : (
                templates.map((tmpl) => (
                  <motion.div 
                    key={tmpl.id} 
                    variants={{ hidden: { opacity: 0, scale: 0.8, y: 20 }, show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 20 } } }} 
                    whileHover={{ scale: 1.03, y: -5 }} 
                    whileTap={{ scale: 0.95 }} 
                  >
                    <TemplateCard template={tmpl} onClick={setSelectedTemplate} />
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedTemplate && <TemplateModel template={selectedTemplate} onClose={() => setSelectedTemplate(null)} onDelete={() => handleDeleteTemplate(selectedTemplate.id)} />}
      </AnimatePresence>
    </Layout>
  );
}