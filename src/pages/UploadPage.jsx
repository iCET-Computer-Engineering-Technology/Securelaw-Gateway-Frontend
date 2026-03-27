import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FileUp, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion'; 

export default function UploadPage() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({ name: '', author: '', category: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => { if (e.target.files && e.target.files[0]) setFile(e.target.files[0]); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!file || !formData.name || !formData.author || !formData.category) {
      setStatus({ type: 'error', message: 'Please fill in all required fields (*).' });
      return;
    }

    const data = new FormData();
    data.append('file', file);
    data.append('name', formData.name);
    data.append('author', formData.author);
    data.append('category', formData.category);
    data.append('description', formData.description);

    setLoading(true);
    setStatus(null);

    try {
      await axios.post('http://localhost:8080/api/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus({ type: 'success', message: 'Template successfully saved!' });
      setTimeout(() => navigate('/collection'), 2000);
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to save template.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginLeft: '100px', paddingTop: '40px', width: 'calc(100% - 100px)', minHeight: '100vh' }}>
      <div className="container d-flex justify-content-center">
        
        {/* Apple Spring Animation for the Upload Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
          className="glass-panel p-4 p-md-5 w-100" 
          style={{ maxWidth: '700px' }}
        >
          <div className="text-center mb-5">
            {/* Changed color to pure white as requested in your comment! */}
            <div className="floating-pill d-inline-flex p-3 mb-3" style={{ color: 'var(--text-main)' }}> 
              <FileUp size={32} />
            </div>
            <h2 className="fw-bold mb-2" style={{ color: 'var(--text-main)' }}>Upload New Template</h2>
            <p style={{ color: 'var(--text-main)' }}>Save a new document of pdf</p>
          </div>

          {status && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className={`alert d-flex align-items-center gap-2 mb-4 rounded-3 border-0`} style={{ backgroundColor: status.type === 'success' ? 'rgba(25, 135, 84, 0.1)' : 'rgba(220, 53, 69, 0.1)', color: status.type === 'success' ? '#198754' : '#dc3545' }}>
              {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              {status.message}
            </motion.div>
          )}

          <form onSubmit={handleSave}>
            <div className="mb-4">
              <label className="form-label small fw-bold" style={{ color: 'var(--text-main)' }}>Select Document (PDF/Word) *</label>
              <div
                className="rounded-4 d-flex flex-column align-items-center justify-content-center p-5 text-center position-relative"
                style={{ border: '2px dashed var(--border)', backgroundColor: 'var(--bg-input)', cursor: 'pointer', transition: 'all 0.2s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#7c3aed'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <input type="file" className="position-absolute w-100 h-100 opacity-0" style={{ cursor: 'pointer', left: 0, top: 0 }} onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                <FileText size={40} color={file ? "#7c3aed" : "var(--text-muted)"} className="mb-3" />
                <span style={{ color: 'var(--text-main)', fontSize: '15px', fontWeight: file ? 'bold' : 'normal' }}>
                  {file ? file.name : "Click or drag file to upload"}
                </span>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-bold" style={{ color: 'var(--text-main)' }}>Template Name *</label>
                <input type="text" name="name" className="form-control rounded-3 shadow-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '12px' }} required value={formData.name} onChange={handleInputChange} />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label small fw-bold" style={{ color: 'var(--text-main)' }}>Category *</label>
                <select name="category" className="form-select rounded-3 shadow-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '12px' }} required value={formData.category} onChange={handleInputChange}>
                  <option value="" disabled>Select a category...</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Criminal">Criminal</option>
                  <option value="Family">Family</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Agreements">Agreements</option>
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold" style={{ color: 'var(--text-main)' }}>Author *</label>
              <input type="text" name="author" className="form-control rounded-3 shadow-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '12px' }} required value={formData.author} onChange={handleInputChange} />
            </div>

            <div className="mb-4">
              <label className="form-label small fw-bold" style={{ color: 'var(--text-main)' }}>Brief Description</label>
              <textarea name="description" className="form-control rounded-3 shadow-none" rows="3" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '12px' }} value={formData.description} onChange={handleInputChange}></textarea>
            </div>

            {/* iOS physical tap squish on the button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="btn w-100 py-3 fw-bold rounded-3 d-flex justify-content-center align-items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)', color: '#ffffff', border: 'none', boxShadow: '0 10px 20px rgba(124, 58, 237, 0.3)' }}
              disabled={loading}
            >
              {loading ? <div className="spinner-border spinner-border-sm text-light" role="status"></div> : <FileUp size={20} />}
              {loading ? "Saving to Database..." : "Save Template"}
            </motion.button>
          </form>

        </motion.div>
      </div>
    </div>
  );
}