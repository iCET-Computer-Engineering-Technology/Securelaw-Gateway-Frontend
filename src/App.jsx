import React, { useState } from 'react';
import UserManagement from './UserManagement';
import RegisterModal from './components/RegisterModal';
import { Container, Navbar } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [showModal, setShowModal] = useState(true);

  return (
    <div className="main-wrapper bg-white min-vh-100">
      {/* Navbar Section */}
      <nav className="navbar navbar-dark bg-dark mb-4 p-3 shadow">
        <div className="container">
          <span className="navbar-brand mb-0 h1">SecureLaw Management System</span>
        </div>
      </nav>

      <Navbar expand="lg" className="navbar-custom py-3 px-4">
        <Container>
          <Navbar.Brand href="#" className="fw-bold navbar-brand-glow">
            {/* Logo හෝ වෙනත් දෙයක් මෙතනට දැමිය හැක */}
          </Navbar.Brand>
        </Container>
      </Navbar>

      {/* Main Content Section */}
      <main className="container">
        <UserManagement />
      </main>

      {/* Footer Section */}
      <footer className="text-center mt-5 py-3 text-muted border-top">
        <p>&copy; 2026 SecureLaw Gateway. All Rights Reserved.</p>
      </footer>

      {/* Modal Section */}
      <RegisterModal
        show={showModal}
        handleClose={() => setShowModal(false)}
      />
    </div>
  );
}

export default App;