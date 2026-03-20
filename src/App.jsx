// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import UploadTemplatePage from './pages/UploadTemplatePage'; 
import TemplateGalleryPage from './pages/TemplateGalleryPage'; 

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Navigate to="/collection" />} />
        
        <Route path="/collection" element={<TemplateGalleryPage />} />
        <Route path="/upload" element={<UploadTemplatePage />} />
      </Routes>
    </BrowserRouter>
  );
}