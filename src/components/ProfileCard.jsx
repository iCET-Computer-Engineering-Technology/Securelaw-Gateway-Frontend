import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Edit3, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';

const ProfileCard = () => {
  const [isEditing, setIsEditing] = useState(false);
  
  // ── DYNAMIC USER STATE ──
  const [userData, setUserData] = useState({
    name: 'Loading...',
    email: 'Loading...',
    role: 'Loading...',
    initials: '?'
  });

  const [editForm, setEditForm] = useState({ name: '', email: '', password: '' });

  // ── DECODE TOKEN ON LOAD ──
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const decoded = JSON.parse(jsonPayload);
        const userName = decoded.name || 'User';

        setUserData({
          name: userName,
          email: decoded.sub || decoded.email || 'No email provided',
          role: decoded.role || 'User',
          initials: userName.charAt(0).toUpperCase()
        });

        setEditForm({
          name: userName,
          email: decoded.sub || decoded.email || '',
          password: ''
        });
      } catch (error) {
        console.error("Could not decode user token", error);
      }
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    // Axios call to Spring Boot backend to save user goes here
    setIsEditing(false);
  };

  return (
    /* ── THE FIX: Removed height restrictions and added paddingBottom: '80px' so the page scrolls naturally! ── */
    <div className="container-fluid pt-4 d-flex justify-content-center" style={{ paddingBottom: '80px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-100"
        style={{ maxWidth: '500px' }}
      >
        <div
          className="card border-0 shadow-lg"
          style={{
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid var(--border)',
            borderRadius: '24px',
            overflow: 'hidden'
            /* Removed the maxHeight and overflowY here to stop the chopping effect */
          }}
        >
          {/* Header Banner Area */}
          <div style={{ minHeight: '120px', background: 'linear-gradient(135deg, var(--accent) 0%, #764ba2 100%)' }}></div>

          <div className="card-body px-4 px-md-5 pb-5 text-center" style={{ marginTop: '-60px' }}>
            
            {/* Dynamic Avatar */}
            <div
              className="rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-4 shadow"
              style={{ width: '120px', height: '120px', backgroundColor: 'var(--bg-card)', border: '4px solid var(--bg-main)', color: 'var(--text-main)', fontSize: '3.5rem', fontWeight: 'bold', position: 'relative', zIndex: 2 }}
            >
              {userData.initials}
            </div>

            {!isEditing ? (
              // ── VIEW MODE ──
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="fw-bold mb-1" style={{ color: 'var(--text-main)' }}>{userData.name}</h2>
                <p className="mb-4 badge px-3 py-2 rounded-pill" style={{ backgroundColor: 'var(--bg-pill)', color: 'var(--text-main)', border: '1px solid var(--border)', fontSize: '0.85rem' }}>
                  <Shield size={14} className="me-2" style={{ color: 'var(--accent)' }}/>
                  {userData.role.replace('ROLE_', '').replace('_', ' ')}
                </p>

                <div className="d-flex flex-column gap-3 mb-4 text-start p-4 rounded-4" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)' }}>
                  <div className="d-flex align-items-center gap-3">
                    <div className="p-2 rounded-circle" style={{ backgroundColor: 'var(--bg-pill)', color: 'var(--text-muted)' }}><User size={20} /></div>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Full Name</small>
                      <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{userData.name}</span>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3 mt-2">
                    <div className="p-2 rounded-circle" style={{ backgroundColor: 'var(--bg-pill)', color: 'var(--text-muted)' }}><Mail size={20} /></div>
                    <div>
                      <small className="text-muted d-block" style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Email Address</small>
                      <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{userData.email}</span>
                    </div>
                  </div>
                </div>

                <button
                  className="btn w-100 rounded-pill py-3 d-flex align-items-center justify-content-center gap-2 fw-bold"
                  style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', transition: 'transform 0.2s', boxShadow: '0 4px 12px rgba(13, 110, 253, 0.2)' }}
                  onClick={() => setIsEditing(true)}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Edit3 size={18} /> Edit Profile Settings
                </button>
              </motion.div>

            ) : (

              // ── EDIT MODE ──
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="fw-bold mb-0" style={{ color: 'var(--text-main)' }}>Edit Profile</h4>
                  <button className="btn btn-link p-0 text-muted" onClick={() => setIsEditing(false)} title="Cancel"><X size={24} /></button>
                </div>

                <form onSubmit={handleSave} className="text-start">
                  <div className="mb-3">
                    <label className="form-label small fw-bold" style={{ color: 'var(--text-muted)' }}>Full Name</label>
                    <input type="text" className="form-control shadow-none rounded-3 p-3" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-main)' }} value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold" style={{ color: 'var(--text-muted)' }}>Email Address</label>
                    <input type="email" className="form-control shadow-none rounded-3 p-3" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-main)' }} value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} />
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-bold" style={{ color: 'var(--text-muted)' }}>New Password <small className="fw-normal">(Leave blank to keep current)</small></label>
                    <input type="password" placeholder="••••••••" className="form-control shadow-none rounded-3 p-3" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-main)' }} value={editForm.password} onChange={(e) => setEditForm({...editForm, password: e.target.value})} />
                  </div>

                  <button
                    type="submit"
                    className="btn w-100 rounded-pill py-3 d-flex align-items-center justify-content-center gap-2 fw-bold mt-2"
                    style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', transition: 'transform 0.2s', boxShadow: '0 4px 12px rgba(13, 110, 253, 0.2)' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <Save size={18} /> Save Changes
                  </button>
                </form>
              </motion.div>
            )}

          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileCard;