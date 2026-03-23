import React from 'react';
import { NavLink } from 'react-router-dom';

const NavigationBar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
      <div className="container-fluid">
        <NavLink className="navbar-brand" to="/dashboard">
          <i className="bi bi-shield-lock me-2"></i>
          Audit Logs System
        </NavLink>
        
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <NavLink 
                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} 
                to="/dashboard"
              >
                <i className="bi bi-speedometer2 me-1"></i> Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} 
                to="/login-history"
              >
                <i className="bi bi-box-arrow-in-right me-1"></i> Login History
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} 
                to="/prompt-history"
              >
                <i className="bi bi-chat-dots me-1"></i> Prompt History
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink 
                className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} 
                to="/registration-history"
              >
                <i className="bi bi-person-plus me-1"></i> Registration History
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;

