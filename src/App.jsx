import React from 'react'
import UserManagement from './UserManagement' 
import './App.css'

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
    </div>
  )
}

export default App