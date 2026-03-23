import React, { useState, useEffect } from 'react';
import AuditLogService from '../services/AuditLogService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalLogs: 0,
    loginCount: 0,
    promptCount: 0,
    registrationCount: 0,
    recentLogs: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const logs = await AuditLogService.getAllLogs();
      
      const loginCount = logs.filter(log => log.type === 'LOGIN').length;
      const promptCount = logs.filter(log => log.type === 'PROMPT').length;
      const registrationCount = logs.filter(log => log.type === 'REGISTRATION').length;
      
      setStats({
        totalLogs: logs.length,
        loginCount,
        promptCount,
        registrationCount,
        recentLogs: logs.slice(0, 5)
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
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      <div className="col-12 mb-4">
        <h2 className="mb-4">
          <i className="bi bi-speedometer2 me-2"></i>
          Dashboard
        </h2>
      </div>

      {/* Statistics Cards */}
      <div className="col-md-3 mb-4">
        <div className="card bg-primary text-white h-100">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="card-title">Total Logs</h6>
                <h2 className="mb-0">{stats.totalLogs}</h2>
              </div>
              <i className="bi bi-files fs-1"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-3 mb-4">
        <div className="card bg-success text-white h-100">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="card-title">Login Events</h6>
                <h2 className="mb-0">{stats.loginCount}</h2>
              </div>
              <i className="bi bi-box-arrow-in-right fs-1"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-3 mb-4">
        <div className="card bg-info text-white h-100">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="card-title">Prompt Events</h6>
                <h2 className="mb-0">{stats.promptCount}</h2>
              </div>
              <i className="bi bi-chat-dots fs-1"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-3 mb-4">
        <div className="card bg-warning text-white h-100">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="card-title">Registrations</h6>
                <h2 className="mb-0">{stats.registrationCount}</h2>
              </div>
              <i className="bi bi-person-plus fs-1"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Logs Table */}
      <div className="col-12">
        <div className="card">
          <div className="card-header bg-dark text-white">
            <h5 className="mb-0">Recent Activity</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Date & Time</th>
                    <th>Type</th>
                    <th>IP Address</th>
                    <th>Device</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentLogs.map((log, index) => (
                    <tr key={index}>
                      <td>{log.name}</td>
                      <td>{new Date(log.dateTime).toLocaleString()}</td>
                      <td>
                        <span className={`badge bg-${getBadgeColor(log.type)}`}>
                          {log.type}
                        </span>
                      </td>
                      <td>{log.ipAddress}</td>
                      <td>{log.device}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getBadgeColor = (type) => {
  switch(type) {
    case 'LOGIN': return 'success';
    case 'PROMPT': return 'info';
    case 'REGISTRATION': return 'warning';
    default: return 'secondary';
  }
};

export default Dashboard;