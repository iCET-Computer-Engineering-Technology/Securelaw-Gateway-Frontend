import React, { useState, useEffect } from 'react';
import AuditLogService from '../services/AuditLogService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalLogs: 0,
    loginCount: 0,
    promptCount: 0,
    registrationCount: 0,
    recentLogins: [],
    activeUsers: [] 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await AuditLogService.getAllLogs();
      
      // 🚀 Inspect -> Console එකේ මේක බලන්න. Backend එකෙන් එන නියම නම් ටික මෙතන තියෙනවා.
      console.log("Dashboard Data received:", data); 

      const uniqueActiveUsers = [];
      const seenNames = new Set();
      
      // දත්ත Array එකක්ද කියලා check කරලා loop එක රන් කරනවා
      const recentLoginsArray = data.recentLogins || data.recentActivity || [];

      if (Array.isArray(recentLoginsArray)) {
        for (const log of recentLoginsArray) {
          if (log.name && !seenNames.has(log.name)) {
            seenNames.add(log.name);
            uniqueActiveUsers.push(log);
          }
          if (uniqueActiveUsers.length >= 5) break; 
        }
      }

      // Backend එකේ Keys සහ Frontend එකේ Keys මෙතනදී ගලපනවා
      setStats({
        totalLogs: data.totalLogs || data.allLogsCount || 0,
        loginCount: data.loginEvents || data.totalLogins || 0,
        promptCount: data.promptEvents || data.totalPrompts || 0,
        registrationCount: data.registrations || data.registrationEvents || 0,
        recentLogins: recentLoginsArray,
        activeUsers: uniqueActiveUsers 
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="row">
      <div className="col-12 mb-4">
        <h2 className="mb-4 fw-bold" style={{ color: 'var(--text-main)' }}>
          <i className="bi bi-speedometer2 me-2" style={{ color: 'var(--accent)' }}></i>
          Dashboard
        </h2>
      </div>

      {/* Stats Cards */}
      <div className="col-md-3 mb-4">
        <div className="glass-panel h-100 p-4 position-relative overflow-hidden">
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: '#0d6efd' }}></div>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 style={{ color: 'var(--text-muted)' }}>Total Logs</h6>
              <h2 className="mb-0 fw-bold" style={{ color: 'var(--text-main)' }}>{stats.totalLogs}</h2>
            </div>
            <i className="bi bi-files fs-1" style={{ color: '#0d6efd', opacity: 0.8 }}></i>
          </div>
        </div>
      </div>

      <div className="col-md-3 mb-4">
        <div className="glass-panel h-100 p-4 position-relative overflow-hidden">
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: '#198754' }}></div>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 style={{ color: 'var(--text-muted)' }}>Login Events</h6>
              <h2 className="mb-0 fw-bold" style={{ color: 'var(--text-main)' }}>{stats.loginCount}</h2>
            </div>
            <i className="bi bi-box-arrow-in-right fs-1" style={{ color: '#198754', opacity: 0.8 }}></i>
          </div>
        </div>
      </div>

      <div className="col-md-3 mb-4">
        <div className="glass-panel h-100 p-4 position-relative overflow-hidden">
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: '#0dcaf0' }}></div>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 style={{ color: 'var(--text-muted)' }}>Prompt Events</h6>
              <h2 className="mb-0 fw-bold" style={{ color: 'var(--text-main)' }}>{stats.promptCount}</h2>
            </div>
            <i className="bi bi-chat-dots fs-1" style={{ color: '#0dcaf0', opacity: 0.8 }}></i>
          </div>
        </div>
      </div>

      <div className="col-md-3 mb-4">
        <div className="glass-panel h-100 p-4 position-relative overflow-hidden">
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: '#ffc107' }}></div>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h6 style={{ color: 'var(--text-muted)' }}>Registrations</h6>
              <h2 className="mb-0 fw-bold" style={{ color: 'var(--text-main)' }}>{stats.registrationCount}</h2>
            </div>
            <i className="bi bi-person-plus fs-1" style={{ color: '#ffc107', opacity: 0.8 }}></i>
          </div>
        </div>
      </div>

      {/* Recent Activity Table (Left - 8 columns) */}
      <div className="col-lg-8 mb-4">
        <div className="glass-panel h-100">
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <h5 className="mb-0 fw-bold" style={{ color: 'var(--text-main)' }}>Recent Activity</h5>
          </div>
          <div className="p-3">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Date</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentLogins.length > 0 ? stats.recentLogins.map((log, index) => (
                    <tr key={index}>
                      <td className="fw-medium">{log.name}</td>
                      <td>
                        <span className="badge bg-primary bg-opacity-75">{log.role}</span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{log.date}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{log.time}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="text-center py-4" style={{ color: 'var(--text-muted)' }}>
                        No recent activity found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Active Users Panel (Right - 4 columns) */}
      <div className="col-lg-4 mb-4">
        <div className="glass-panel h-100">
          <div className="px-4 py-3 d-flex justify-content-between align-items-center" style={{ borderBottom: '1px solid var(--border)' }}>
            <h5 className="mb-0 fw-bold" style={{ color: 'var(--text-main)' }}>Active Users</h5>
            <span className="badge bg-success bg-opacity-75 d-flex align-items-center gap-1">
              <span className="rounded-circle bg-white" style={{ width: '6px', height: '6px' }}></span> Online
            </span>
          </div>
          <div className="p-3">
            {stats.activeUsers.length > 0 ? (
              <ul className="list-group list-group-flush bg-transparent">
                {stats.activeUsers.map((user, index) => (
                  <li key={index} className="list-group-item bg-transparent d-flex justify-content-between align-items-center px-2 py-3" style={{ borderBottom: '1px solid var(--border)', borderTop: 'none' }}>
                    <div className="d-flex align-items-center gap-3">
                      <div className="position-relative">
                        <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '42px', height: '42px', backgroundColor: 'var(--bg-pill)', color: 'var(--text-main)', fontSize: '1.2rem' }}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="position-absolute bottom-0 end-0 p-1 bg-success border border-dark rounded-circle" style={{ width: '12px', height: '12px', transform: 'translate(20%, 20%)' }}></span>
                      </div>
                      <div>
                        <h6 className="mb-1 fw-bold" style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{user.name}</h6>
                        <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          {user.time ? `Logged in at ${user.time}` : 'Active now'}
                        </small>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-5">
                 <i className="bi bi-people fs-1 d-block mb-2" style={{ color: 'var(--text-muted)' }}></i>
                 <span style={{ color: 'var(--text-muted)' }}>No active users right now.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;