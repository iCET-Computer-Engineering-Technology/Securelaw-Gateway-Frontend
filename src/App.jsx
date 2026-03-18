
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import TemplateGalleryPage from './pages/TemplateGalleryPage';
function App() {

  return (
    
      <Router>
        <div className="min-vh-100">

          <Routes>
            
            <Route path="/" element={<TemplateGalleryPage />} />

          </Routes>
        </div>
      </Router>

    
  );
}

export default App
