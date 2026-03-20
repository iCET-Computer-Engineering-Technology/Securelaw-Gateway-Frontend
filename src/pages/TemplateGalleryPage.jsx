import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import TemplateCard from '../components/TemplateCard';
import TemplateModal from '../components/TemplateModel'; // Make sure the spelling matches your file!

export default function TemplateGalleryPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    // Fetch templates from Spring Boot
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
        {/* Main Dark Box */}
        <div className="w-100 rounded-4 shadow-lg overflow-hidden" 
             style={{ maxWidth: '1000px', backgroundColor: '#222534', border: '1px solid #32364a' }}>
          
          {/* Header */}
          <div className="px-4 py-3" style={{ borderBottom: '1px solid #32364a' }}>
            <h1 className="h6 text-light mb-0" style={{ fontWeight: '500' }}>Upload Template Collection</h1>
          </div>

          {/* Grid Area */}
          <div className="p-4 p-md-5">
            {loading && <div className="text-center text-light">Loading templates...</div>}
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
            
            {/* Scroll indicator (Down Arrow) */}
            <div className="d-flex justify-content-center mt-5">
              <div style={{
                width: '12px', height: '12px',
                borderBottom: '2px solid #5a5f73', borderRight: '2px solid #5a5f73',
                transform: 'rotate(45deg)', cursor: 'pointer'
              }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* The Popup Modal */}
      <TemplateModal 
        template={selectedTemplate} 
        onClose={() => setSelectedTemplate(null)} 
      />
    </Layout>
  );
}