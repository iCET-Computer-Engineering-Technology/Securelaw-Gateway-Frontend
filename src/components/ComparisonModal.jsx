import React, { useState, useEffect } from 'react';

const ComparisonModal = ({ show, handleClose, originalText, maskedText }) => {
  const [editableMasked, setEditableMasked] = useState(maskedText);

  useEffect(() => { 
    setEditableMasked(maskedText);
  }, [maskedText]);

  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1055 }}>
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content border-0" style={{ backgroundColor: '#2c2c2e', borderRadius: '30px', padding: '20px' }}>
          
          <div className="modal-body">
            <div className="row align-items-center justify-content-center">
              
              <div className="col-md-5">
                <p className="text-white text-center mb-3 fw-light">Original Document</p>
                <div className="bg-white p-4 rounded-4 shadow custom-scrollbar" style={{ height: '400px', overflowY: 'auto', color: '#333' }}>
                  <p style={{ lineHeight: '1.6', fontSize: '15px', whiteSpace: 'pre-wrap' }}>{originalText}</p>
                </div>
              </div>

              <div className="col-md-1 text-center d-none d-md-block">
                <div className="text-white">
                  <h2 className="fw-bold">↔</h2>
                </div>
              </div>

              <div className="col-md-5">
                <p className="text-white text-center mb-3 fw-light">Masked Document (Editable)</p>
                <textarea 
                  className="form-control p-4 rounded-4 shadow border-0 custom-scrollbar" 
                  style={{ height: '400px', color: '#333', lineHeight: '1.6', fontSize: '15px', resize: 'none', backgroundColor: '#ffffff' }}
                  value={editableMasked}
                  onChange={(e) => setEditableMasked(e.target.value)} 
                />
              </div>

            </div>

            <div className="text-center mt-5">
              <button 
                className="btn text-white w-50 py-3 fw-bold shadow-sm hover-lift" 
                style={{ backgroundColor: 'var(--accent)', borderRadius: '50px', fontSize: '1.1rem', transition: 'all 0.2s' }}
                onClick={() => handleClose(editableMasked)}
              >
                Save and Close
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonModal;