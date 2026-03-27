import React, { useState } from 'react';
// React Router imports එකතු කරන ලදී
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; 
import UserManagement from './UserManagement';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import RegisterModal from './components/RegisterModal';
import ChatBox from './pages/ChatBox'; 
import { Container, Navbar } from 'react-bootstrap';

function App() {
  const [showModal, setShowModal] = useState(true);

  return (
    <Router> 
      <div className="App">
        
        <nav className="navbar navbar-dark bg-dark mb-4 p-3 shadow">
          <div className="container">
            <span className="navbar-brand mb-0 h1">
              SecureLaw Management System
            </span>
          </div>
        </nav>

        <Navbar expand="lg" className="navbar-custom py-3 px-4">
          <Container>
            <Navbar.Brand href="#" className="fw-bold navbar-brand-glow">
            </Navbar.Brand>
          </Container>
        </Navbar>

        <main>
          <Routes>
            <Route path="/" element={<UserManagement />} />
            
            <Route path="/chat" element={<ChatBox />} />
          </Routes>
        </main>

        <RegisterModal
          show={showModal}
          handleClose={() => setShowModal(false)}
        />

        <footer className="text-center mt-5 py-3 text-muted border-top">
          <p>&copy; 2026 SecureLaw Gateway. All Rights Reserved.</p>
        </footer>

      </div>
    </Router>
  );
}

export default App;