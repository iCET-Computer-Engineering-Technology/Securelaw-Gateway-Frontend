import React, { useState, useEffect } from 'react';
import AuditLogService from '../services/AuditLogService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalLogs: 0,
    loginCount: 0,
    promptCount: 0,
    registrationCount: 0,
    recentLogins: [] 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const data = await AuditLogService.getAllLogs();
      
      
      setStats({
        totalLogs: data.totalLogs,
        loginCount: data.loginEvents,
        promptCount: data.promptEvents,
        registrationCount: data.registrations,
        recentLogins: data.recentLogins
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

      {/* Recent Activity Table */}
      <div className="col-12">
        <div className="glass-panel">
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
                  {stats.recentLogins && stats.recentLogins.map((log, index) => (
                    <tr key={index}>
                      <td className="fw-medium">{log.name}</td>
                      <td>
                        <span className="badge bg-primary bg-opacity-75">
                          {log.role}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{log.date}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{log.time}</td>
                    </tr>
                  ))}
                  {(!stats.recentLogins || stats.recentLogins.length === 0) && (
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
    </div>
  );
};

export default Dashboard;