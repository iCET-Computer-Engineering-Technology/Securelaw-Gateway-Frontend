import React from 'react';
import TemplateCard from '../components/TemplateCard';

import { UserCircle } from 'lucide-react'; 

const TemplateGalleryPage = () => {
  const templates = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    name: "Template ex",
  }));
  
  return (
    <div className="d-flex flex-column align-items-center p-4">

      <div className="container" style={{ maxWidth: '1150px' }}>
        
        <div className="d-flex justify-content-end mb-4">
          <UserCircle 
            size={32} 
            className="text-secondary" 
            style={{ cursor: 'pointer' }} 
          />
        </div>

        <div className="bg-dark-card rounded-4 overflow-hidden shadow-lg border border-secondary">
          
          <div className="p-4 border-bottom border-secondary">
            <h1 className="h4 text-light mb-0">Upload Template</h1>
          </div>

          <div className="p-4 p-md-5">
            
            <div className="d-flex flex-wrap justify-content-center gap-4">
              {templates.map((tmpl) => (
                <TemplateCard key={tmpl.id} name={tmpl.name} />
              ))}
            </div>
            
            <div className="d-flex justify-content-center mt-5">
              <div 
                style={{
                  width: '16px',
                  height: '16px',
                  borderBottom: '2px solid #6c757d',
                  borderRight: '2px solid #6c757d',
                  transform: 'rotate(45deg)',
                  cursor: 'pointer'
                }}
              ></div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateGalleryPage;