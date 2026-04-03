import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';


// Context & Layouts
import { ThemeProvider } from './context/Themecontext';
import Layout from './components/Layout';
import NavigationBar from './components/NavigationBar';

// Pages & Components
import TemplateGalleryPage from './pages/TemplateGalleryPage';
import WorkspacePage from './pages/WorkspacePage';
import UserManagement from './UserManagement';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import LoginHistory from './components/LoginHistory';
import PromptHistory from './components/PromptHistory';
import RegistrationHistory from './components/RegistrationHistory';
import ChatBox from './pages/ChatBox';
import UploadPages from './pages/UploadPages';
import RegisterForm from './components/RegisterForm';
import ProfileCard from './components/ProfileCard';


function App() {
  const [showModal, setShowModal] = useState(true);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="App min-vh-100 d-flex flex-column" style={{background: 'var(--bg-main)'}}>
          
          <Routes>
            
            <Route path="/login" element={<Login />} />

            
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
                      <Route path="/upload" element={<UploadPages />} />
                      <Route path="/users" element={<UserManagement />} />
                      <Route path="/chat" element={<ChatBox />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/login-history" element={<LoginHistory />} />
                      <Route path="/prompt-history" element={<PromptHistory />} />
                      <Route path="/registration-history" element={<RegistrationHistory />} />
                      <Route path='/profile-card' element={<ProfileCard />} />
                      
                      {/* 404 Redirect */}
                      <Route path="*" element={<Navigate to="/collection" replace />} />
                    </Routes>
                  </main>

                  {/* Modal components */}
                  <RegisterForm
                    show={showModal}
                    onClose={() => setShowModal(false)}
                  />

                 
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