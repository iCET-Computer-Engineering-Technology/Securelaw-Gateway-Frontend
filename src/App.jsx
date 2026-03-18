import { useState } from 'react'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import RegisterModal from './components/RegisterModal';
import { Container, Navbar } from 'react-bootstrap';

function App() {

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

export default App;