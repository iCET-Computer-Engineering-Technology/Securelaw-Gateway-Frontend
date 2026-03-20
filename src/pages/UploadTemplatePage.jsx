import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate!
import Layout from '../components/Layout';

export default function UploadTemplatePage() {
  const [file, setFile] = useState(null);
  const [templateName, setTemplateName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  
  // 2. Add this missing line back in to fix the crash!
  const [status, setStatus] = useState(''); 

  // 3. Initialize the navigate function
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

    setStatus('uploading'); // This line will work perfectly now!
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', templateName);
    formData.append('category', category);
    formData.append('description', description);
    formData.append('author', author); 

    try {
      // 4. Double check this URL matches your Spring Boot controller exactly!
      await axios.post('http://localhost:8080/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setStatus('success');
      
      // 5. Automatically redirect to the collection page to see the new file!
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

                <div className="w-100 rounded-4 shadow-lg" style={{ maxWidth: '900px', backgroundColor: '#222534', border: '1px solid #32364a' }}>

                    <div className="px-4 py-3" style={{ borderBottom: '1px solid #32364a' }}>
                        <h4 className="text-white m-0 fs-5">Upload Template</h4>
                    </div>

                    <div className="p-4 p-md-5">
                        <form onSubmit={handleUpload}>

                            <div className="row mb-4">

                                <div className="col-md-6 mb-3 mb-md-0 d-flex flex-column">
                                    <label className="text-secondary small mb-2">Upload Document (PDF/Docx)</label>
                                    <label
                                        className="flex-grow-1 d-flex flex-column align-items-center justify-content-center rounded-3 position-relative"
                                        style={{
                                            backgroundColor: '#1a1c29',
                                            border: '1px dashed #495057',
                                            cursor: 'pointer',
                                            minHeight: '140px'
                                        }}
                                    >
                                        <input
                                            type="file"
                                            className="position-absolute w-100 h-100 opacity-0"
                                            style={{ cursor: 'pointer' }}
                                            onChange={handleFileChange}
                                            accept=".pdf,.doc,.docx,.txt"
                                        />
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                            <polyline points="17 8 12 3 7 8"></polyline>
                                            <line x1="12" y1="3" x2="12" y2="15"></line>
                                        </svg>
                                        <span className="text-secondary small">
                                            {file ? file.name : "Click or drag to upload"}
                                        </span>
                                    </label>
                                </div>

                                <div className="col-md-6 d-flex flex-column gap-3">
                                    {/* ... Template Category Dropdown is here ... */}

                                    {/* 3. Add this new Author Input Box */}
                                    <div>
                                        <label className="text-secondary small mb-2">Author Name</label>
                                        <input
                                            type="text"
                                            className="form-control border-0 text-white"
                                            style={{ backgroundColor: '#1a1c29' }}
                                            value={author}
                                            onChange={(e) => setAuthor(e.target.value)}
                                            placeholder="e.g. Yasith"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-secondary small mb-2">Template Name</label>
                                        <input
                                            type="text"
                                            className="form-control border-0 text-white"
                                            style={{ backgroundColor: '#1a1c29' }}
                                            value={templateName}
                                            onChange={(e) => setTemplateName(e.target.value)}
                                            placeholder="e.g. Non-Disclosure Agreement"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-secondary small mb-2">Template Category</label>
                                        <select
                                            className="form-select border-0 text-white"
                                            style={{ backgroundColor: '#1a1c29' }}
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
                                <label className="text-secondary small mb-2">Description</label>
                                <textarea
                                    className="form-control border-0 text-white"
                                    style={{ backgroundColor: '#1a1c29', minHeight: '100px' }}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Briefly describe the contents of this template..."
                                />
                            </div>

                            <div className="d-flex justify-content-end gap-3 mt-4">
                                <button
                                    type="button"
                                    className="btn text-white"
                                    style={{ backgroundColor: '#1a1c29', border: '1px solid #32364a' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary px-4"
                                    disabled={status === 'uploading'}
                                    style={{ backgroundColor: '#0d6efd', border: 'none' }}
                                >
                                    {status === 'uploading' ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
}