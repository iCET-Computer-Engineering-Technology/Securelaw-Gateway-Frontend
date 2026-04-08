import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

// Context & Layouts
import { ThemeProvider } from './context/Themecontext';
import Layout from './components/Layout';
import NavigationBar from './components/NavigationBar';

// Pages & Components
import TemplateGalleryPage from './pages/TemplateGalleryPage';
import WorkspacePage from './pages/WorkspacePage';
import UploadPage from './pages/UploadPages';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import LoginHistory from './components/LoginHistory';
import PromptHistory from './components/PromptHistory';
import RegistrationHistory from './components/RegistrationHistory';

// --- NEWLY ADDED FILES ---
import UserManagement from './UserManagement'; 
import ChatBox from './pages/ChatBox';         // Your new AI Chat page
import RegisterForm from './components/RegisterForm';
import Securechat from './pages/Securechat';

function App() {
  // State for the global RegisterModal
  const [showModal, setShowModal] = useState(false);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="App min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-main)' }}>
          
          <Routes>
            {/* Login Route (Renders full screen, outside the Sidebar Layout) */}
            <Route path="/login" element={<Login />} />

            {/* All other routes wrapped inside the Main Layout with Sidebar and Navbar */}
            <Route
              path="*"
              element={
                <Layout>
                  <NavigationBar />
                  
                  {/* Content Area */}
                  <main className="flex-grow-1" style={{ marginTop: '80px' }}>
                    <Routes>
                      {/* Default Route redirects to Template Collection */}
                      <Route path="/" element={<Navigate to="/collection" replace />} />
                      
                      {/* Core App Pages */}
                      <Route path="/collection" element={<TemplateGalleryPage />} />
                      <Route path="/workspace" element={<WorkspacePage />} />
                      <Route path="/upload" element={<UploadPage />} />
                      
                      {/* Added User Management Route */}
                      <Route path="/users" element={<UserManagement />} />
                      
                      {/* Added ChatBox Route */}
                      <Route path="/chat" element={<ChatBox />} />
                      
                      {/* Admin & Audit Pages */}
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/login-history" element={<LoginHistory />} />
                      <Route path="/prompt-history" element={<PromptHistory />} />
                      <Route path="/registration-history" element={<RegistrationHistory />} />
                      <Route path="/messages" element={<Securechat />} />
                      
                      {/* 404 Catch-All Redirect */}
                      <Route path="*" element={<Navigate to="/collection" replace />} />
                    </Routes>
                  </main>

                  {/* Global Register Modal (Can be triggered from anywhere) */}
                  <RegisterForm show={showModal} onClose={() => setShowModal(false)} />

                  {/* Global Footer */}
                  
                </Layout>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
