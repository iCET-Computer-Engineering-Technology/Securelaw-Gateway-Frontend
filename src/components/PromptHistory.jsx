import React, { useState, useEffect } from 'react';
import AuditLogService from '../services/AuditLogService';

const PromptHistory = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchPromptLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [searchTerm, logs]);

  const fetchPromptLogs = async () => {
    try {
      setLoading(true);
      const allLogs = await AuditLogService.getAllLogs();
      const promptLogs = allLogs.filter(log => 
        log.type === 'PROMPT' || log.type?.toLowerCase().includes('prompt')
      );
      setLogs(promptLogs);
      setFilteredLogs(promptLogs);
    } catch (error) {
      console.error('Error fetching prompt logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ipAddress.includes(searchTerm)
      );
    }

    setFilteredLogs(filtered);
    setCurrentPage(1);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const handleViewPrompt = (log) => {
    setSelectedPrompt(log);
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
          <i className="bi bi-chat-dots me-2"></i>
          Prompt History
        </h2>
      </div>

      {/* Search */}
      <div className="col-12 mb-4">
        <div className="card">
          <div className="card-body">
            <div className="row">
              <div className="col-md-8">
                <div className="input-group">
                  <span className="input-group-text bg-primary text-white">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search by name or IP..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <button 
                  className="btn btn-secondary w-100"
                  onClick={() => setSearchTerm('')}
                >
                  <i className="bi bi-eraser me-1"></i>
                  Clear Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prompt History Table */}
      <div className="col-12">
        <div className="card">
          <div className="card-header bg-dark text-white">
            <h5 className="mb-0">Prompt Events</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Date & Time</th>
                    <th>IP Address</th>
                    <th>Type</th>
                    <th>Prompt Content</th>
                    <th>Action</th>
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
                          <i className="bi bi-clock me-1"></i>
                          {new Date(log.dateTime).toLocaleString()}
                        </td>
                        <td>
                          <code>{log.ipAddress}</code>
                        </td>
                        <td>
                          <span className="badge bg-info">
                            <i className="bi bi-chat me-1"></i>
                            {log.type}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleViewPrompt(log)}
                          >
                            <i className="bi bi-eye me-1"></i>
                            View Prompt
                          </button>
                        </td>
                        <td>
                          <span className="badge bg-secondary">{log.device}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        <i className="bi bi-chat-square-text fs-1 d-block text-muted mb-2"></i>
                        No prompt records found
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
                    <button className="page-link" onClick={() => setCurrentPage(1)}>
                      First
                    </button>
                  </li>
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                      Previous
                    </button>
                  </li>
                  <li className="page-item active">
                    <span className="page-link">
                      Page {currentPage} of {totalPages}
                    </span>
                  </li>
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                      Next
                    </button>
                  </li>
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

      {/* Prompt Details Modal */}
      {selectedPrompt && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="bi bi-chat-quote me-2"></i>
                  Prompt Details
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setSelectedPrompt(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="fw-bold">User:</label>
                  <p>{selectedPrompt.name}</p>
                </div>
                <div className="mb-3">
                  <label className="fw-bold">Date & Time:</label>
                  <p>{new Date(selectedPrompt.dateTime).toLocaleString()}</p>
                </div>
                <div className="mb-3">
                  <label className="fw-bold">IP Address:</label>
                  <p><code>{selectedPrompt.ipAddress}</code></p>
                </div>
                <div className="mb-3">
                  <label className="fw-bold">Device:</label>
                  <p>{selectedPrompt.device}</p>
                </div>
                <div className="mb-3">
                  <label className="fw-bold">Prompt Content:</label>
                  <div className="border rounded p-3 bg-light">
                    <p className="mb-0">Sample prompt content would appear here...</p>
                    {/* You would need to store actual prompt content in your database */}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setSelectedPrompt(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptHistory;