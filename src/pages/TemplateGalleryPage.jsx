import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import TemplateCard from '../components/TemplateCard';
import TemplateModal from '../components/TemplateModel'; 

export default function TemplateGalleryPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8080/api/templates')
      .then((response) => {
        setTemplates(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching templates:", err);
        setError("Failed to load templates.");
        setLoading(false);
      });
  }, []);

  return (
    <Layout>
      <div className="w-100 mt-2 d-flex justify-content-center">
        <div className="w-100 rounded-4 shadow-lg overflow-hidden" 
             style={{ maxWidth: '1000px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', transition: 'background-color 0.3s ease' }}>
          
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <h1 className="h6 mb-0" style={{ fontWeight: '500', color: 'var(--text-main)' }}>Upload Template Collection</h1>
          </div>

          <div className="p-4 p-md-5">
            {loading && <div className="text-center" style={{ color: 'var(--text-main)' }}>Loading templates...</div>}
            {error && <div className="text-center text-danger">{error}</div>}

            {!loading && !error && (
              <div className="d-flex flex-wrap justify-content-center gap-4">
                {templates.map((tmpl) => (
                  <TemplateCard 
                    key={tmpl.id} 
                    template={tmpl} 
                    onClick={setSelectedTemplate} 
                  />
                ))}
              </div>
            )}
            
            <div className="d-flex justify-content-center mt-5">
              <div style={{
                width: '12px', height: '12px',
                borderBottom: '2px solid var(--text-muted)', borderRight: '2px solid var(--text-muted)',
                transform: 'rotate(45deg)', cursor: 'pointer'
              }}></div>
            </div>
          </div>
        </div>
      </div>

      <TemplateModal 
        template={selectedTemplate} 
        onClose={() => setSelectedTemplate(null)} 
      />
    </Layout>
  );
}