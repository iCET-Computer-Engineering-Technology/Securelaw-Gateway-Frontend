import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

export default function UploadTemplatePage() {
  const [file, setFile] = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  
  const [status, setStatus] = useState(''); 
  const navigate = useNavigate(); 

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !templateName || !author) {
      alert("Please provide a Template Name, Author, and a File.");
      return;
    }

    setStatus('uploading');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', templateName);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('author', author); 

    try {
      await axios.post('http://localhost:8080/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus('success');
      navigate('/collection');
    } catch (error) {
      console.error("Upload failed", error);
      setStatus('error');
      alert("Failed to upload. Make sure your Spring Boot server is running!");
    }
  };

  return (
    <Layout>
      <div className="w-100 mt-2 d-flex justify-content-center">
        <div className="w-100 rounded-4 shadow-lg" style={{ maxWidth: '900px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', transition: 'background-color 0.3s ease' }}>
          
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <h4 className="m-0 fs-5" style={{ color: 'var(--text-main)' }}>Upload Template</h4>
          </div>

          <div className="p-4 p-md-5">
            <form onSubmit={handleUpload}>
              
              <div className="row mb-4">
                <div className="col-md-6 mb-3 mb-md-0 d-flex flex-column">
                  <label className="small mb-2 fw-medium" style={{ color: 'var(--text-muted)' }}>Upload Document (PDF/Docx)</label>
                  <label 
                    className="flex-grow-1 d-flex flex-column align-items-center justify-content-center rounded-3 position-relative"
                    style={{ 
                      backgroundColor: 'var(--bg-input)', 
                      border: '2px dashed var(--border-color)', 
                      cursor: 'pointer',
                      minHeight: '160px',
                      transition: 'background-color 0.3s ease'
                    }}
                  >
                    <input 
                      type="file" 
                      className="position-absolute w-100 h-100 opacity-0" 
                      style={{ cursor: 'pointer' }}
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.txt"
                    />
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <span className="small fw-medium text-center px-3" style={{ color: 'var(--text-muted)' }}>
                      {file ? file.name : "Click or drag to upload"}
                    </span>
                  </label>
                </div>

                <div className="col-md-6 d-flex flex-column gap-3">
                  <div>
                    <label className="small mb-2 fw-medium" style={{ color: 'var(--text-muted)' }}>Author Name</label>
                    <input 
                      type="text" 
                      className="form-control shadow-none" 
                      style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="e.g. Yasith"
                    />
                  </div>
                  <div>
                    <label className="small mb-2 fw-medium" style={{ color: 'var(--text-muted)' }}>Template Name</label>
                    <input 
                      type="text" 
                      className="form-control shadow-none" 
                      style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="e.g. Non-Disclosure Agreement"
                    />
                  </div>
                  <div>
                    <label className="small mb-2 fw-medium" style={{ color: 'var(--text-muted)' }}>Template Category</label>
                    <select 
                      className="form-select shadow-none" 
                      style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="">Select Category...</option>
                      <option value="corporate">Corporate Law</option>
                      <option value="criminal">Criminal Law</option>
                      <option value="family">Family Law</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="small mb-2 fw-medium" style={{ color: 'var(--text-muted)' }}>Description</label>
                <textarea 
                  className="form-control shadow-none" 
                  style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', border: '1px solid var(--border-color)', minHeight: '100px' }}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe the contents of this template..."
                />
              </div>

              <div className="d-flex justify-content-end gap-3 mt-4">
                <button 
                  type="button" 
                  className="btn" 
                  onClick={() => navigate('/collection')}
                  style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary px-4 fw-medium"
                  disabled={status === 'uploading'}
                  style={{ backgroundColor: '#0d6efd', border: 'none' }}
                >
                  {status === 'uploading' ? 'Uploading...' : 'Upload Document'}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}