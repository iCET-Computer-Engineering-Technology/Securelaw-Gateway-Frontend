import React from 'react'
import UserManagement from './UserManagement' 

import { useState } from 'react'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import RegisterModal from './components/RegisterModal';
import { Container, Navbar } from 'react-bootstrap';

function App() {
  return (
    <div className="App">
    
      <nav className="navbar navbar-dark bg-dark mb-4 p-3 shadow">
        <div className="container">
          <span className="navbar-brand mb-0 h1">SecureLaw Management System</span>
        </div>
      </nav>

     
      <main>
        <UserManagement />
      </main>

     
      <footer className="text-center mt-5 py-3 text-muted border-top">
        <p>&copy; 2026 SecureLaw Gateway. All Rights Reserved.</p>
      </footer>


  const [showModal, setShowModal] = useState(true);

  return (
    <div className="main-wrapper bg-white min-vh-100">

      <Navbar expand="lg" className="navbar-custom py-3 px-4">
        <Container>
          <Navbar.Brand href="#" className="fw-bold navbar-brand-glow">
            
          </Navbar.Brand>
        </Container>
      </Navbar>

      <RegisterModal
        show={showModal}
        handleClose={() => setShowModal(false)}
      />

    </div>
  )
}


export default App

export default App;

