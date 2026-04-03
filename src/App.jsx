import React from 'react';
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
import ChatBox from './pages/ChatBox';

function App() {
  
  

  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="App min-vh-100 d-flex flex-column">
          
          <Routes>
            
            <Route path="/login" element={<Login />} />

            
            <Route
              path="*"
              element={
                <Layout>
                  <NavigationBar />
                  
                  <main className="flex-grow-1" style={{ marginTop: '80px' }}>
                    <Routes>
                      {/* Default Route */}
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
                      
                      {/* 404 Redirect */}
                      <Route path="*" element={<Navigate to="/collection" replace />} />
                    </Routes>
                  </main>

                  
                  
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