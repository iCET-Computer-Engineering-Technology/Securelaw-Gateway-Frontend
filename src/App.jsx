import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Context & Layouts
import { ThemeProvider } from './context/Themecontext';
import Layout from './components/Layout';
import NavigationBar from './components/NavigationBar';

// Pages & Components
import TemplateGalleryPage from './pages/TemplateGalleryPage';
import WorkspacePage from './pages/WorkspacePage';
import UploadPage from './pages/UploadPage';
import UserManagement from './UserManagement';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import LoginHistory from './components/LoginHistory';
import PromptHistory from './components/PromptHistory';
import RegistrationHistory from './components/RegistrationHistory';
import RegisterModal from './components/RegisterModal';
import ChatBox from './pages/ChatBox';
import Securechat from './pages/Securechat';



function App() {
  const [showModal, setShowModal] = useState(true);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="App min-vh-100 d-flex flex-column">
          
          <Routes>
            {/* Login route (Layout එකෙන් තොරව) */}
            <Route path="/login" element={<Login />} />

            {/* අනිත් සියලුම routes Layout එක ඇතුළේ */}
            <Route
              path="*"
              element={
                <Layout>
                  <NavigationBar />
                  
                  {/* Content Area */}
                  <main className="flex-grow-1" style={{ marginTop: '80px' }}>
                    <Routes>
                      <Route path="/" element={<Navigate to="/collection" replace />} />
                      <Route path="/collection" element={<TemplateGalleryPage />} />
                      <Route path="/workspace" element={<WorkspacePage />} />
                      <Route path="/upload" element={<UploadPage />} />
                      <Route path="/users" element={<UserManagement />} />
                      <Route path="/chat" element={<ChatBox />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/login-history" element={<LoginHistory />} />
                      <Route path="/prompt-history" element={<PromptHistory />} />
                      <Route path="/registration-history" element={<RegistrationHistory />} />
                      <Route path="/messages" element={<Securechat />} />
                      
                      {/* 404 Redirect */}
                      <Route path="*" element={<Navigate to="/collection" replace />} />
                    </Routes>
                  </main>

                  {/* Modal components */}
                  <RegisterModal
                    show={showModal}
                    handleClose={() => setShowModal(false)}
                  />

                  {/* Global Footer */}
                  <footer className="text-center mt-auto py-3 text-muted border-top">
                    <p>&copy; 2026 SecureLaw Gateway. All Rights Reserved.</p>
                  </footer>
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