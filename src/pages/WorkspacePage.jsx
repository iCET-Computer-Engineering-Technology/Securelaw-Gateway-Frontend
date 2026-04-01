import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Download, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import mammoth from 'mammoth'; 

export default function WorkspacePage() {
    const [activeTemplate, setActiveTemplate] = useState(null);
    const navigate = useNavigate();

   
    const [docxContent, setDocxContent] = useState('');
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractError, setExtractError] = useState(false);

    useEffect(() => {
        const savedTemplate = sessionStorage.getItem('activeTemplate');
        if (savedTemplate) setActiveTemplate(JSON.parse(savedTemplate));
    }, []);

    
    const fileType = activeTemplate?.fileType || activeTemplate?.name || '';
    const isPdf = fileType.toLowerCase().includes('pdf');
    const isImage = fileType.match(/\.(jpeg|jpg|gif|png)$/) != null || fileType.includes('image');
    const isWord = fileType.includes('word') || fileType.includes('document') || fileType.toLowerCase().endsWith('.docx');
    
    const pdfViewUrl = activeTemplate ? `http://localhost:8080/api/templates/${activeTemplate.id}/view` : '';

    
    useEffect(() => {
        if (isWord && activeTemplate) {
            setIsExtracting(true);
            setExtractError(false);
            
            axios.get(pdfViewUrl, { responseType: 'arraybuffer' })
                .then(response => mammoth.convertToHtml({ arrayBuffer: response.data }))
                .then(result => {
                    setDocxContent(result.value);
                    setIsExtracting(false);
                })
                .catch(err => {
                    console.error("Mammoth extraction failed:", err);
                    setExtractError(true);
                    setIsExtracting(false);
                });
        }
    }, [isWord, activeTemplate, pdfViewUrl]);


    if (!activeTemplate) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
                <h2 style={{ color: 'var(--text-main)' }}>No active workspace found.</h2>
                <p style={{ color: 'var(--text-muted)' }}>Please select a template from the gallery to start working.</p>
                <button className="btn btn-primary mt-3 px-4 py-2 rounded-3" onClick={() => navigate('/collection')} >Go to Gallery</button>
            </div>
        );
    }

    
    const editorBgColor = isPdf ? '#e2e4e9' : 'var(--bg-input)';

    return (
            <div className="container-fluid py-4" style={{ height: 'calc(100vh - 80px)' }}>
                {/* Header animation */}
                <motion.div 
                    initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} 
                    className="d-flex justify-content-between align-items-center mb-4"
                >
                    <div className="d-flex align-items-center gap-3">
                        <motion.button whileTap={{ scale: 0.9 }} className="btn btn-sm d-flex align-items-center justify-content-center rounded-circle" style={{ width: '40px', height: '40px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }} onClick={() => { sessionStorage.removeItem('activeTemplate'); navigate('/collection'); }}>
                            <ArrowLeft size={20} />
                        </motion.button>
                        <div>
                            <h4 className="mb-0 fw-bold" style={{ color: 'var(--text-main)' }}>Workspace: {activeTemplate.name}</h4>
                            <small style={{ color: 'var(--text-muted)' }}>Editing mode</small>
                        </div>
                    </div>
                    <div className="d-flex gap-2">
                        <motion.button whileTap={{ scale: 0.95 }} className="btn d-flex align-items-center gap-2 px-3 rounded-3" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}><Download size={18} /> Export</motion.button>
                        <motion.button whileTap={{ scale: 0.95 }} className="btn btn-primary d-flex align-items-center gap-2 px-4 rounded-3" style={{ backgroundColor: '#4a47a3', border: 'none', color: 'white' }}><Save size={18} /> Save Progress</motion.button>
                    </div>
                </motion.div>

                {/* Staggered Row Animation */}
                <motion.div 
                    initial="hidden" animate="show" 
                    variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15 } } }}
                    className="row h-100 gx-4"
                >
                    {/* LEFT COLUMN: THE DOCUMENT EDITOR */}
                    <motion.div variants={{ hidden: { opacity: 0, x: -30 }, show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 200 } } }} className="col-lg-8 h-100 mb-4 mb-lg-0">
                        <div className="w-100 h-100 rounded-4 shadow-sm overflow-hidden d-flex flex-column" style={{ border: '1px solid var(--border)', backgroundColor: editorBgColor }}>
                            
                            {isPdf ? (
                                <iframe src={`${pdfViewUrl}#toolbar=0`} title="Document Editor" width="100%" height="100%" style={{ border: 'none' }} />
                            ) : isImage ? (
                                <div className="w-100 h-100 d-flex align-items-center justify-content-center p-4">
                                   <img src={pdfViewUrl} alt={activeTemplate.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }} />
                                </div>
                            ) : isWord ? (
                                <div className="w-100 h-100 d-flex flex-column align-items-center p-4" style={{ overflowY: 'auto' }}>
                                    <div 
                                        className="shadow-sm docx-paper position-relative"
                                        style={{
                                            backgroundColor: 'var(--bg-card)', 
                                            border: '1px solid var(--border)',
                                            borderRadius: '8px',
                                            width: '100%',
                                            maxWidth: '800px', // Wider paper for the workspace
                                            minHeight: '100%',
                                            padding: '60px 50px',
                                            color: 'var(--text-main)', 
                                            textAlign: 'left'
                                        }}
                                    >
                                        <style>{`
                                            .docx-paper p, .docx-paper h1, .docx-paper h2, .docx-paper h3, .docx-paper li {
                                                color: var(--text-main) !important;
                                            }
                                        `}</style>

                                        {isExtracting ? (
                                            <div className="d-flex flex-column align-items-center justify-content-center h-100 opacity-50 text-center pt-5">
                                                <div className="spinner-border text-primary mb-3" role="status"></div>
                                                <p>Loading document into workspace...</p>
                                            </div>
                                        ) : extractError ? (
                                            <div className="text-center pt-5 text-danger opacity-75">
                                                <FileText size={40} className="mb-3" />
                                                <p>Could not extract text from this document.</p>
                                                <a href={pdfViewUrl} download className="btn btn-outline-danger mt-3">Download Original</a>
                                            </div>
                                        ) : (
                                            <div dangerouslySetInnerHTML={{ __html: docxContent }} style={{ fontSize: '15px', lineHeight: '1.8' }} />
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-center p-4">
                                    <p className="text-muted">Editor not available for this file type.</p>
                                </div>
                            )}

                        </div>
                    </motion.div>

                    {/* RIGHT COLUMN: DOCUMENT DETAILS & FORM */}
                    <motion.div variants={{ hidden: { opacity: 0, x: 30 }, show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 200 } } }} className="col-lg-4 h-100">
                        <div className="w-100 h-100 rounded-4 p-4 shadow-sm overflow-auto" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                            <h5 className="fw-bold mb-4" style={{ color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '15px' }}>Document Details</h5>
                            <div className="mb-3"><label className="form-label small text-uppercase fw-bold" style={{ color: 'var(--text-muted)' }}>Category</label><div style={{ color: 'var(--text-main)' }}>{activeTemplate.category}</div></div>
                            <div className="mb-3"><label className="form-label small text-uppercase fw-bold" style={{ color: 'var(--text-muted)' }}>Author</label><div style={{ color: 'var(--text-main)' }}>{activeTemplate.author}</div></div>
                            <div className="mb-4"><label className="form-label small text-uppercase fw-bold" style={{ color: 'var(--text-muted)' }}>Brief</label><p className="small" style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{activeTemplate.description}</p></div>
                            <div className="alert mt-5" style={{ backgroundColor: 'rgba(74, 71, 163, 0.1)', border: '1px solid #4a47a3', color: 'var(--text-main)' }}><small>Ready for your custom editor logic! You can add form fields here to map data into the document.</small></div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
    );
}
