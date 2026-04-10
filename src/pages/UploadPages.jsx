import React, { useState } from 'react';
import axios from 'axios';
import { FileUp, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const decodeUserIdFromToken = (token) => {
  if (!token) return null;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const decoded = JSON.parse(jsonPayload);
    return decoded.id || decoded.userId || decoded.sub || null;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// ── FIXED: Only look for the exact "token" key ──
const getAccessToken = () => localStorage.getItem('token') || '';

export default function UploadPages({ onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({ name: '', author: '', category: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const token = getAccessToken();
    const userId = decodeUserIdFromToken(token);

    if (!userId) {
      setStatus({ type: 'error', message: 'User ID not found. Please log in again.' });
      return;
    }

    if (!file) {
      setStatus({ type: 'error', message: 'Please choose a file before saving.' });
      return;
    }

    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('name', formData.name);
    uploadData.append('author', formData.author);
    uploadData.append('category', formData.category);
    uploadData.append('description', formData.description);
    uploadData.append('userId', userId);

    setLoading(true);
    setStatus(null);

    try {
      // 1. Just upload the template to the database
      await axios.post('http://localhost:8080/api/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`, // ── The correct token is now passed here ──
        },
      });

      // 2. Show success message
      setStatus({
        type: 'success',
        message: 'Template uploaded successfully!',
      });

      // 3. Wait a brief moment, then close the modal and go to Collection
      setTimeout(() => {
        if (onUploadSuccess) onUploadSuccess();
        if (onClose) onClose();
        navigate('/collection'); 
      }, 1500);

    } catch (error) {
      console.error('Upload Error:', error.response?.data || error.message);
      setStatus({
        type: 'error',
        message: error.response?.data || 'Failed to save template. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ zIndex: 1050, backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 260, damping: 25 }}
        className="glass-panel p-4 p-md-5 position-relative w-100 custom-scrollbar"
        style={{ maxWidth: '700px', margin: '20px', maxHeight: '90vh', overflowY: 'auto', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="position-absolute btn btn-link p-0 d-flex align-items-center justify-content-center"
          style={{
            top: '20px',
            right: '20px',
            color: 'var(--text-muted)',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-input)',
            border: 'none',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-pill)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-input)')}
        >
          <X size={20} />
        </button>

        <div className="text-center mb-5 mt-2">
          <div className="floating-pill d-inline-flex p-3 mb-3" style={{ color: 'var(--accent)' }}>
            <FileUp size={32} />
          </div>
          <h2 className="fw-bold mb-2" style={{ color: 'var(--text-main)' }}>
            Upload New Template
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>Save a new document or pdf</p>
        </div>

        {status && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="alert d-flex align-items-center gap-2 mb-4 rounded-3 border-0"
            style={{
              backgroundColor: status.type === 'success' ? 'rgba(25, 135, 84, 0.1)' : 'rgba(220, 53, 69, 0.1)',
              color: status.type === 'success' ? '#198754' : '#dc3545',
            }}
          >
            {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {status.message}
          </motion.div>
        )}

        <form onSubmit={handleSave}>
          <div className="mb-4">
            <label className="form-label small fw-bold" style={{ color: 'var(--text-main)' }}>
              Select Document (PDF/Word) *
            </label>
            <div
              className="rounded-4 d-flex flex-column align-items-center justify-content-center p-4 text-center position-relative"
              style={{
                border: '2px dashed var(--border)',
                backgroundColor: 'var(--bg-input)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <input
                type="file"
                className="position-absolute w-100 h-100 opacity-0"
                style={{ cursor: 'pointer', left: 0, top: 0 }}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
              />
              <FileText
                size={36}
                color={file ? 'var(--accent)' : 'var(--text-muted)'}
                className="mb-2"
              />
              <span
                style={{
                  color: 'var(--text-main)',
                  fontSize: '14px',
                  fontWeight: file ? 'bold' : 'normal',
                }}
              >
                {file ? file.name : 'Click or drag file to upload'}
              </span>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-bold" style={{ color: 'var(--text-main)' }}>
                Template Name *
              </label>
              <input
                type="text"
                name="name"
                className="form-control rounded-3 shadow-none"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-main)',
                  padding: '10px 12px',
                }}
                required
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label small fw-bold" style={{ color: 'var(--text-main)' }}>
                Category *
              </label>
              <select
                name="category"
                className="form-select rounded-3 shadow-none"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-main)',
                  padding: '10px 12px',
                }}
                required
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="" disabled style={{ color: '#000' }}>
                  Select a category...
                </option>
                <option value="Corporate" style={{ color: '#000' }}>Corporate</option>
                <option value="Criminal" style={{ color: '#000' }}>Criminal</option>
                <option value="Family" style={{ color: '#000' }}>Family</option>
                <option value="Real Estate" style={{ color: '#000' }}>Real Estate</option>
                <option value="Agreements" style={{ color: '#000' }}>Agreements</option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label small fw-bold" style={{ color: 'var(--text-main)' }}>
              Author *
            </label>
            <input
              type="text"
              name="author"
              className="form-control rounded-3 shadow-none"
              style={{
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border)',
                color: 'var(--text-main)',
                padding: '10px 12px',
              }}
              required
              value={formData.author}
              onChange={handleInputChange}
            />
          </div>

          <div className="mb-4">
            <label className="form-label small fw-bold" style={{ color: 'var(--text-main)' }}>
              Brief Description
            </label>
            <textarea
              name="description"
              className="form-control rounded-3 shadow-none"
              rows="2"
              style={{
                backgroundColor: 'var(--bg-input)',
                border: '1px solid var(--border)',
                color: 'var(--text-main)',
                padding: '10px 12px',
              }}
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="btn w-100 py-3 fw-bold rounded-3 d-flex justify-content-center align-items-center gap-2"
            style={{ background: 'var(--accent)', color: '#ffffff', border: 'none', transition: 'all 0.2s' }}
            disabled={loading}
          >
            {loading ? <div className="spinner-border spinner-border-sm text-light" role="status"></div> : <FileUp size={20} />}
            {loading ? 'Saving to Database...' : 'Save Template'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}