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
      const registrationLogs = allLogs.filter(log => 
        log.type === 'REGISTRATION' || log.type === 'Admin' 
      );
      setLogs(registrationLogs);
      setFilteredLogs(registrationLogs);
    } catch (error) {
      console.error('Error fetching registration logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ipAddress.includes(searchTerm)
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(log => log.type === roleFilter);
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
          <i className="bi bi-person-plus me-2"></i>
          Registration History
        </h2>
      </div>

      {/* Filters */}
      <div className="col-12 mb-4">
        <div className="card">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-5">
                <div className="input-group">
                  <span className="input-group-text bg-primary text-white">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name, email, or IP..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <select 
                  className="form-select"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="Admin">Admin</option>
                  <option value="USER">User</option>
                  <option value="MODERATOR">Moderator</option>
                </select>
              </div>
              <div className="col-md-4">
                <button 
                  className="btn btn-secondary me-2"
                  onClick={() => {
                    setSearchTerm('');
                    setRoleFilter('all');
                  }}
                >
                  <i className="bi bi-arrow-counterclockwise me-1"></i>
                  Reset Filters
                </button>
                <button 
                  className="btn btn-success"
                  onClick={() => window.print()}
                >
                  <i className="bi bi-printer me-1"></i>
                  Print Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration History Table */}
      <div className="col-12">
        <div className="card">
          <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Registration Events</h5>
            <span className="badge bg-primary">Total: {filteredLogs.length}</span>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover table-striped">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Date & Time</th>
                    <th>IP Address</th>
                    <th>Role</th>
                    <th>Device</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((log, index) => (
                      <tr key={log.id || index}>
                        <td>{indexOfFirstItem + index + 1}</td>
                        <td>
                          <strong>{log.name}</strong>
                        </td>
                        <td>
                          <i className="bi bi-envelope me-1"></i>
                          {log.email || `${log.name.toLowerCase().replace(' ', '.')}@gmail.com`}
                        </td>
                        <td>
                          <i className="bi bi-calendar-check me-1"></i>
                          {new Date(log.dateTime).toLocaleString()}
                        </td>
                        <td>
                          <code>{log.ipAddress}</code>
                        </td>
                        <td>
                          <span className={`badge bg-${log.type === 'Admin' ? 'warning' : 'info'}`}>
                            <i className={`bi bi-${log.type === 'Admin' ? 'shield' : 'person'} me-1`}></i>
                            {log.type}
                          </span>
                        </td>
                        <td>
                          <i className="bi bi-laptop me-1"></i>
                          {log.device || 'Desktop'}
                        </td>
                        <td>
                          <span className="badge bg-success">
                            <i className="bi bi-check-circle me-1"></i>
                            Active
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
                        <i className="bi bi-person-plus fs-1 d-block text-muted mb-2"></i>
                        No registration records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="mt-4">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setCurrentPage(1)}
                    >
                      First
                    </button>
                  </li>
                  {[...Array(totalPages)].map((_, i) => (
                    <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      Last
                    </button>
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