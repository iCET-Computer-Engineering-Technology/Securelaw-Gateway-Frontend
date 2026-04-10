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
import ProfileCard from './components/ProfileCard';

// ── අලුතෙන් එකතු කරපු Route Guard එක ──
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  
  // 1. Token එකක් නැත්තම් (ලොග් වෙලා නැත්තම්) කෙලින්ම Login එකට යවනවා
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    // 2. Token එක ඇතුලේ තියෙන Role එක කියවනවා
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userRole = payload.role || payload.authorities || '';

    // 3. මේ Page එකට යන්න විශේෂ Role එකක් ඕනෙද කියලා බලනවා
    if (allowedRoles && allowedRoles.length > 0) {
      // User ගේ Role එක allowedRoles ලිස්ට් එකේ නැත්තම්...
      const hasPermission = allowedRoles.some(role => userRole.toUpperCase().includes(role));
      
      if (!hasPermission) {
        // අවසර නැත්තම්, එයාව ආපහු Chat එකටම විසි කරනවා!
        return <Navigate to="/chat" replace />;
      }
    }
  } catch (e) {
    // Token එක අවුල් නම් Login එකට යවනවා
    return <Navigate to="/login" replace />;
  }

  // ඔක්කොම හරි නම්, එයාට යන්න හදපු Page එකට යන්න දෙනවා
  return children;
};

function App() {
  const [showModal, setShowModal] = useState(false);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="App min-vh-100 d-flex flex-column" style={{ backgroundColor: 'var(--bg-main)' }}>
          
          <Routes>
            {/* ── Redirect directly to Login ── */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            <Route path="/login" element={<Login />} />

            {/* All other routes wrapped inside the Main Layout */}
            <Route
              path="*"
              element={
                <Layout>
                  <NavigationBar />
                  
                  <main className="flex-grow-1" style={{ marginTop: '80px' }}>
                    <Routes>
                      {/* Default Route */}
                      <Route path="/" element={<Navigate to="/login" replace />} />
                      
                      {/* ── හැමෝටම (Junior & Senior) යන්න පුළුවන් Pages ── */}
                      <Route path="/collection" element={
                        <ProtectedRoute>
                          <TemplateGalleryPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/workspace" element={
                        <ProtectedRoute>
                          <WorkspacePage />
                        </ProtectedRoute>
                      } />
                      <Route path="/upload" element={
                        <ProtectedRoute>
                          <UploadPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/chat" element={
                        <ProtectedRoute>
                          <ChatBox />
                        </ProtectedRoute>
                      } />
                      <Route path="/messages" element={
                        <ProtectedRoute>
                          <SecureChat />
                        </ProtectedRoute>
                      } />
                      <Route path="/profile" element={
                        <ProtectedRoute>
                          <ProfileCard />
                        </ProtectedRoute>
                      } />

                      {/* ── SENIOR සහ ADMIN ලාට විතරක් යන්න පුළුවන් Pages ── */}
                      <Route path="/dashboard" element={
                        <ProtectedRoute allowedRoles={['SENIOR', 'ADMIN']}>
                          <Dashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="/login-history" element={
                        <ProtectedRoute allowedRoles={['SENIOR', 'ADMIN']}>
                          <LoginHistory />
                        </ProtectedRoute>
                      } />
                      <Route path="/prompt-history" element={
                        <ProtectedRoute allowedRoles={['SENIOR', 'ADMIN']}>
                          <PromptHistory />
                        </ProtectedRoute>
                      } />
                      <Route path="/registration-history" element={
                        <ProtectedRoute allowedRoles={['SENIOR', 'ADMIN']}>
                          <RegistrationHistory />
                        </ProtectedRoute>
                      } />
                      <Route path="/users" element={
                        <ProtectedRoute allowedRoles={['SENIOR', 'ADMIN']}>
                          <UserManagement />
                        </ProtectedRoute>
                      } />

                      {/* Fallback */}
                      <Route path="*" element={<Navigate to="/chat" replace />} />
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