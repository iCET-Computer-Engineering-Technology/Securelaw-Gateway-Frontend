import React, { useState, useEffect } from 'react';
import AuditLogService from '../services/AuditLogService';

const RegistrationHistory = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchRegistrationLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [searchTerm, roleFilter, logs]);

  const fetchRegistrationLogs = async () => {
    try {
      setLoading(true);
      const allLogs = await AuditLogService.getAllLogs();

      if (!Array.isArray(allLogs)) return;

      const registrationLogs = allLogs.filter(log =>
        log.type?.toUpperCase() === 'REGISTRATION' ||
        log.type?.toUpperCase() === 'ADMIN'
      );

      setLogs(registrationLogs);
      setFilteredLogs(registrationLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ipAddress?.includes(searchTerm)
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(log => log.type?.toUpperCase() === roleFilter.toUpperCase() || log.type?.toUpperCase() === 'REGISTRATION');
    }

    setFilteredLogs(filtered);
    setCurrentPage(1);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  if (loading) {
    return (
      <div className="app-page-scroll d-flex align-items-center justify-content-center">
        <div className="text-center mt-5">
          <div className="spinner-border" style={{ color: 'var(--accent)' }} role="status"></div>
        </div>
      </div>
    );
  }

  const inputStyle = { backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', border: '1px solid var(--border)' };
  const optionStyle = { backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' };

  return (
    <div className="app-page-scroll pe-2">
      <div className="d-flex flex-column h-100 gap-4">
        <div className="flex-shrink-0">
          <h2 className="mb-0 fw-bold" style={{ color: 'var(--text-main)' }}>
            <i className="bi bi-person-plus me-2" style={{ color: 'var(--accent)' }}></i>
            Registration History
          </h2>
        </div>

        <div className="glass-panel p-4 flex-shrink-0">
          <div className="row g-3">
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control shadow-none"
                  style={inputStyle}
                  placeholder="Search by name, email, or IP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select shadow-none"
                style={inputStyle}
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all" style={optionStyle}>All Roles</option>
                <option value="Admin" style={optionStyle}>Admin</option>
                <option value="USER" style={optionStyle}>User</option>
                <option value="MODERATOR" style={optionStyle}>Moderator</option>
              </select>
            </div>
            <div className="col-md-4 d-flex gap-2">
              <button className="btn flex-grow-1" style={{ backgroundColor: 'var(--bg-pill)', color: 'var(--text-main)', border: '1px solid var(--border)' }} onClick={() => { setSearchTerm(''); setRoleFilter('all'); }}>
                Reset Filters
              </button>
              <button className="btn btn-success d-flex align-items-center justify-content-center" onClick={() => window.print()}>
                <i className="bi bi-printer me-2"></i> Print Report
              </button>
            </div>
          </div>
        </div>

        <div className="glass-panel d-flex flex-column flex-grow-1" style={{ minHeight: 0 }}>
          <div className="px-4 py-3 d-flex justify-content-between align-items-center flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
            <h5 className="mb-0 fw-bold" style={{ color: 'var(--text-main)' }}>Registration Events</h5>
            <span className="badge" style={{ backgroundColor: 'var(--accent)' }}>Total: {filteredLogs.length}</span>
          </div>
          <div className="p-3 d-flex flex-column flex-grow-1" style={{ minHeight: 0 }}>
            <div className="table-responsive app-panel-scroll">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Date & Time</th>
                    <th>IP Address</th>
                    <th>Event Type</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((log, index) => (
                      <tr key={log.id || index}>
                        <td className="fw-medium">{log.name || 'Unknown'}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{log.email || `${(log.name || 'user').toLowerCase().replace(' ', '.')}@gmail.com`}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{log.dateTime ? new Date(log.dateTime).toLocaleString() : 'N/A'}</td>
                        <td><code style={{ color: 'var(--accent)' }}>{log.ipAddress || '-'}</code></td>
                        <td>
                          <span className={`badge bg-${log.type?.toUpperCase() === 'ADMIN' ? 'warning' : 'info'} text-dark bg-opacity-75`}>
                            {log.type || 'REGISTRATION'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-5">
                        <i className="bi bi-person-plus fs-1 d-block mb-2" style={{ color: 'var(--text-muted)' }}></i>
                        <span style={{ color: 'var(--text-muted)' }}>No records found</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <nav className="mt-4 flex-shrink-0">
                <ul className="pagination justify-content-center mb-0">
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

export default RegistrationHistory;
