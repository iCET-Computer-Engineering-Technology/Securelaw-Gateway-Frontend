import React, { useState, useEffect } from 'react';
import AuditLogService from '../services/AuditLogService';

const LoginHistory = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchLoginLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [searchTerm, dateFilter, logs]);

  const fetchLoginLogs = async () => {
    try {
      setLoading(true);
      const allLogs = await AuditLogService.getAllLogs();
      const loginLogs = allLogs.filter(log => log.type === 'LOGIN' || log.type === 'Admin');
      setLogs(loginLogs);
      setFilteredLogs(loginLogs);
    } catch (error) {
      console.error('Error fetching login logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ipAddress.includes(searchTerm) ||
        log.device.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateFilter) {
      filtered = filtered.filter(log => {
        const logDate = new Date(log.dateTime).toDateString();
        const filterDate = new Date(dateFilter).toDateString();
        return logDate === filterDate;
      });
    }

    setFilteredLogs(filtered);
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const getDeviceIcon = (device) => {
    if (device?.toLowerCase().includes('mobile')) return 'bi-phone';
    if (device?.toLowerCase().includes('tablet')) return 'bi-tablet';
    return 'bi-laptop';
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" style={{ color: 'var(--accent)' }} role="status"></div>
      </div>
    );
  }

  const inputStyle = { backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', border: '1px solid var(--border)' };

  return (
    <div className="row">
      <div className="col-12 mb-4">
        <h2 className="mb-4 fw-bold" style={{ color: 'var(--text-main)' }}>
          <i className="bi bi-box-arrow-in-right me-2" style={{ color: 'var(--accent)' }}></i>
          Login History
        </h2>
      </div>

      <div className="col-12 mb-4">
        <div className="glass-panel p-4">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control shadow-none"
                  style={inputStyle}
                  placeholder="Search by name, IP, or device..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <input
                type="date"
                className="form-control shadow-none"
                style={inputStyle}
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <button
                className="btn w-100"
                style={{ backgroundColor: 'var(--bg-pill)', color: 'var(--text-main)', border: '1px solid var(--border)' }}
                onClick={() => {
                  setSearchTerm('');
                  setDateFilter('');
                }}
              >
                <i className="bi bi-x-circle me-1"></i> Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="col-12">
        <div className="glass-panel">
          <div className="px-4 py-3 d-flex justify-content-between align-items-center" style={{ borderBottom: '1px solid var(--border)' }}>
            <h5 className="mb-0 fw-bold" style={{ color: 'var(--text-main)' }}>Login Events</h5>
            <span className="badge" style={{ backgroundColor: 'var(--accent)' }}>Total: {filteredLogs.length}</span>
          </div>
          <div className="p-3">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Date & Time</th>
                    <th>IP Address</th>
                    <th>Type</th>
                    <th>Device</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((log, index) => (
                      <tr key={log.id || index}>
                        <td style={{ color: 'var(--text-muted)' }}>{indexOfFirstItem + index + 1}</td>
                        <td className="fw-medium">{log.name}</td>
                        <td style={{ color: 'var(--text-muted)' }}>
                          <i className="bi bi-calendar me-1"></i>
                          {new Date(log.dateTime).toLocaleString()}
                        </td>
                        <td><code style={{ color: 'var(--accent)' }}>{log.ipAddress}</code></td>
                        <td>
                          <span className="badge bg-success bg-opacity-75">
                            <i className="bi bi-shield-check me-1"></i> {log.type}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>
                          <i className={`bi ${getDeviceIcon(log.device)} me-1`}></i>
                          {log.device || 'Unknown'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
                        <i className="bi bi-inbox fs-1 d-block mb-2" style={{ color: 'var(--text-muted)' }}></i>
                        <span style={{ color: 'var(--text-muted)' }}>No login records found</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <nav className="mt-4">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" style={inputStyle} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>Previous</button>
                  </li>
                  {[...Array(totalPages)].map((_, i) => (
                    <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                      <button className="page-link" style={currentPage === i + 1 ? { backgroundColor: 'var(--accent)', color: '#fff', border: 'none' } : inputStyle} onClick={() => setCurrentPage(i + 1)}>
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" style={inputStyle} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>Next</button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginHistory;