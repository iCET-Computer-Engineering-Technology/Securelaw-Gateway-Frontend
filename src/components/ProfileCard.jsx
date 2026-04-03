import React, { useState } from 'react';
import { Pencil, Moon, User, Sun, FileText, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import './ProfileCard.css';

const ProfileCard = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <section className={`profile-page ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>

      <div className="top-icons">
        <div className="left-group">
          <div onClick={toggleTheme} className="theme-toggle-wrapper">
            {isDarkMode ? <Sun size={22} className="icon-item" /> : <Moon size={22} className="icon-item" />}
          </div>

          <FileText size={22} className="icon-item" />

          <div
            className={`icon-wrapper ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={22} className="icon-item" />
          </div>
        </div>

        <div className="right-group">
          <div
            className={`icon-wrapper ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
            style={{ cursor: 'pointer' }}
          >
            <ChevronLeft size={24} className="icon-item" />
          </div>
          <div
            className={`icon-wrapper ${activeTab === 'next' ? 'active' : ''}`}
            onClick={() => setActiveTab('next')}
            style={{ cursor: 'pointer' }}
          >
            <ChevronRight size={24} className="icon-item" />
          </div>
        </div>
      </div>
      <div className="content-container">
        {activeTab === 'profile' ? (
          <div className="profile-card animate-in">
            <div className="profile-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="profile-avatar-icon">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div className="profile-content">
              <h1 className="profile-name">Amal Perera</h1>
              <p className="profile-role">Senior Lawyer</p>
              <p className="profile-email">amalperera@gmail.com</p>
              <button className="edit-btn">
                <Pencil size={16} color="#FFFFFF" strokeWidth={2.5} />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="profile-card animate-in edit-mode">
            <div className="edit-grid">
              <div className="profile-avatar large">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="profile-avatar-icon">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="input-group-container">
                <input type="text" placeholder="Fullname" className="custom-input" />
                <input type="email" placeholder="Email" className="custom-input" />
                <input type="password" placeholder="Password" className="custom-input" />
              </div>
            </div>
            <button className="save-btn">
              Save
            </button>
          </div>
        )}
      </div>

    </section>
  );
};

export default ProfileCard;
