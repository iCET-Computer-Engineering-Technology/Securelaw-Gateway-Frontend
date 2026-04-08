import React, { useState } from 'react';
import axios from 'axios';
import { FileUp, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { motion } from 'framer-motion'; 

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');
const USE_CREDENTIALS = import.meta.env.VITE_USE_CREDENTIALS === 'true';

const getAuthToken = () =>
  localStorage.getItem('authToken') ||
  sessionStorage.getItem('authToken') ||
  localStorage.getItem('token') ||
  sessionStorage.getItem('token');

const getCookieValue = (name) => {
  const row = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`));
  return row ? decodeURIComponent(row.split('=').slice(1).join('=')) : '';
};

// Function name updated to UploadPages to match your file name perfectly!
export default function UploadPages({ onClose, onUploadSuccess }) {
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
      const token = getAuthToken();
      const csrfToken = getCookieValue('XSRF-TOKEN') || getCookieValue('CSRF-TOKEN');

      const baseHeaders = {
        'Content-Type': 'multipart/form-data',
        ...(csrfToken ? { 'X-XSRF-TOKEN': csrfToken } : {})
      };

      const endpointCandidates = [
        `${API_BASE_URL}/api/upload`,
        `${API_BASE_URL}/api/templates/upload`,
        `${API_BASE_URL}/api/templates`,
      ];

      const requestCandidates = [];
      requestCandidates.push({
        label: 'no-auth',
        config: {
          headers: baseHeaders,
          withCredentials: false,
        }
      });
      if (token) {
        requestCandidates.push({
          label: 'bearer-token',
          config: {
            headers: { ...baseHeaders, Authorization: `Bearer ${token}` },
            withCredentials: false,
          }
        });
      }
      if (USE_CREDENTIALS) {
        requestCandidates.push({
          label: 'cookie-session',
          config: {
            headers: baseHeaders,
            withCredentials: true,
          }
        });
        if (token) {
          requestCandidates.push({
            label: 'token-and-cookie',
            config: {
              headers: { ...baseHeaders, Authorization: `Bearer ${token}` },
              withCredentials: true,
            }
          });
        }
      }

      let uploaded = false;
      let lastError = null;
      const attemptErrors = [];

      for (const endpoint of endpointCandidates) {
        for (const requestAttempt of requestCandidates) {
          try {
            await axios.post(endpoint, data, { ...requestAttempt.config, timeout: 30000 });
            uploaded = true;
            break;
          } catch (err) {
            const statusCode = err?.response?.status;
            const backendMessage =
              err?.response?.data?.message ||
              err?.response?.data?.error ||
              (typeof err?.response?.data === 'string' ? err.response.data : err?.message);

            lastError = err;
            attemptErrors.push(
              `${requestAttempt.label} @ ${endpoint} => ${statusCode || 'NO_STATUS'} ${backendMessage || ''}`.trim()
            );

            if (statusCode && statusCode !== 403 && statusCode !== 404) {
              throw err;
            }
          }
        }
        if (uploaded) break;
      }

      if (!uploaded) {
        const error = new Error('Upload request was rejected.');
        error.attemptDetails = attemptErrors;
        throw lastError || error;
      }

      setStatus({ type: 'success', message: 'Template successfully saved!' });
      
      // Wait 1.5s to show success, then refresh the grid and close the popup
      setTimeout(() => {
        if (onUploadSuccess) onUploadSuccess();
        if (onClose) onClose();
      }, 1500);
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (typeof error?.response?.data === 'string' ? error.response.data : null) ||
        (Array.isArray(error?.attemptDetails) ? error.attemptDetails.join(' | ') : null);
      const statusCode = error?.response?.status;
      setStatus({
        type: 'error',
        message: backendMessage
          ? `${backendMessage}${statusCode ? ` (HTTP ${statusCode})` : ''}`
          : `Failed to save template${statusCode ? ` (HTTP ${statusCode})` : ''}.`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    /* ── POPUP OVERLAY BACKGROUND ── */
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
      style={{ zIndex: 1050, backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(6px)' }}
      onClick={onClose} // Closes popup if you click outside of it
    >
      
      {/* ── YOUR UPLOAD CARD ── */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
        className="glass-panel p-4 p-md-5 position-relative w-100 custom-scrollbar" 
        style={{ maxWidth: '700px', margin: '20px', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside the form
      >
        
        {/* CLOSE BUTTON */}
        <button 
          onClick={onClose}
          className="position-absolute btn btn-link p-0 d-flex align-items-center justify-content-center"
          style={{ top: '20px', right: '20px', color: 'var(--text-muted)', width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--bg-input)', border: 'none', transition: 'all 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-pill)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-input)'}
        >
          <X size={20} />
        </button>

        <div className="text-center mb-5 mt-2">
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
              className="rounded-4 d-flex flex-column align-items-center justify-content-center p-4 text-center position-relative"
              style={{ border: '2px dashed var(--border)', backgroundColor: 'var(--bg-input)', cursor: 'pointer', transition: 'all 0.2s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#7c3aed'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <input type="file" className="position-absolute w-100 h-100 opacity-0" style={{ cursor: 'pointer', left: 0, top: 0 }} onChange={handleFileChange} accept=".pdf,.doc,.docx" />
              <FileText size={36} color={file ? "#7c3aed" : "var(--text-muted)"} className="mb-2" />
              <span style={{ color: 'var(--text-main)', fontSize: '14px', fontWeight: file ? 'bold' : 'normal' }}>
                {file ? file.name : "Click or drag file to upload"}
              </span>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-bold" style={{ color: 'var(--text-main)' }}>Template Name *</label>
              <input type="text" name="name" className="form-control rounded-3 shadow-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '10px 12px' }} required value={formData.name} onChange={handleInputChange} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-bold" style={{ color: 'var(--text-main)' }}>Category *</label>
              <select name="category" className="form-select rounded-3 shadow-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '10px 12px' }} required value={formData.category} onChange={handleInputChange}>
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
            <input type="text" name="author" className="form-control rounded-3 shadow-none" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '10px 12px' }} required value={formData.author} onChange={handleInputChange} />
          </div>

          <div className="mb-4">
            <label className="form-label small fw-bold" style={{ color: 'var(--text-main)' }}>Brief Description</label>
            <textarea name="description" className="form-control rounded-3 shadow-none" rows="2" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '10px 12px' }} value={formData.description} onChange={handleInputChange}></textarea>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="btn w-100 py-3 fw-bold rounded-3 d-flex justify-content-center align-items-center gap-2"
            style={{ background: 'var(--accent)' , color: '#ffffff', border: 'none', boxShadow: '0 1px 1px var(--accent)' }}
            disabled={loading}
          >
            {loading ? <div className="spinner-border spinner-border-sm text-light" role="status"></div> : <FileUp size={20} />}
            {loading ? "Saving to Database..." : "Save Template"}
          </motion.button>
        </form>

      </motion.div>
    </div>
  );
}
