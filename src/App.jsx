import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import UploadTemplatePage from './pages/UploadTemplatePage'; 
import TemplateGalleryPage from './pages/TemplateGalleryPage'; 
import { ThemeProvider } from './context/Themecontext';

export default function App() {
  return (
    <ThemeProvider> 
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/collection" />} />
          <Route path="/collection" element={<TemplateGalleryPage />} />
          <Route path="/upload" element={<UploadTemplatePage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}