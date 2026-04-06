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
import UserManagement from './UserManagement'; 
import ChatBox from './pages/ChatBox';         
import RegisterForm from './components/RegisterForm';
import SecureChat from './pages/Securechat'; 

// ── NEW IMPORT: Add your ProfileCard component here ──
// (Note: Change './components/ProfileCard' to './pages/ProfileCard' if you put the file in the pages folder!)
import ProfileCard from './components/ProfileCard'; 

function App() {
  const [showModal, setShowModal] = useState(false);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="App min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-main)' }}>
          
          <Routes>
            {/* ── CRITICAL FIX: Make the default root url '/' redirect directly to Login ── */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            <Route path="/login" element={<Login />} />

            {/* All other routes wrapped inside the Main Layout with Sidebar and Navbar */}
            <Route
              path="*"
              element={
                <Layout>
                  <NavigationBar />
                  
                  <main className="flex-grow-1" style={{ marginTop: '80px' }}>
                    <Routes>
                      {/* Fallback internal route (if they try to go somewhere that doesn't exist) */}
                      <Route path="*" element={<Navigate to="/chat" replace />} />
                      
                      <Route path="/collection" element={<TemplateGalleryPage />} />
                      <Route path="/workspace" element={<WorkspacePage />} />
                      <Route path="/upload" element={<UploadPage />} />
                      
                      <Route path="/users" element={<UserManagement />} />
                      <Route path="/chat" element={<ChatBox />} />
                      
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/login-history" element={<LoginHistory />} />
                      <Route path="/prompt-history" element={<PromptHistory />} />
                      <Route path="/registration-history" element={<RegistrationHistory />} />
                      <Route path="/messages" element={<SecureChat />} />

                      {/* ── NEW ROUTE: Added the profile page route here ── */}
                      <Route path="/profile" element={<ProfileCard />} />
                      
                    </Routes>
                  </main>

                  <RegisterForm show={showModal} onClose={() => setShowModal(false)} />
                  
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