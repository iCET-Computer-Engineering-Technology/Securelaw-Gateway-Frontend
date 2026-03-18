import React from 'react';

const TemplateCard = ({ name }) => {
  return (
    <div   
      className="d-flex flex-column align-items-center text-center" 
      style={{ width: '120px', cursor: 'pointer' }}
    >
      <div className="template-preview rounded-1 p-2 shadow-sm mb-2">
        
        <div className="mock-line w-25"></div>
        <div className="mock-line w-100"></div>
        <div className="mock-line w-100"></div>
        <div className="mock-line w-75"></div>
        <div className="mock-line w-100 mt-3"></div>
        <div className="mock-line" style={{ width: '90%' }}></div>
        <div className="mock-line w-100"></div>
        <div className="mock-line w-75"></div>
      </div>
      
     
      <span className="small text-secondary fw-medium">
        {name}
      </span>
    </div>
  );
};

export default TemplateCard;