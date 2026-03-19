import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import NavigationBar from './components/NavigationBar';
import LoginHistory from './components/LoginHistory';
import PromptHistory from './components/PromptHistory';
import RegistrationHistory from './components/RegistrationHistory';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <NavigationBar />
        <div className="container-fluid mt-4">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login-history" element={<LoginHistory />} />
            <Route path="/prompt-history" element={<PromptHistory />} />
            <Route path="/registration-history" element={<RegistrationHistory />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
