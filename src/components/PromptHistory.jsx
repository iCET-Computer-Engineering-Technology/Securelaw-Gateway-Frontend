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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const handleViewPrompt = (log) => setSelectedPrompt(log);

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
          <i className="bi bi-chat-dots me-2" style={{ color: 'var(--accent)' }}></i>
          Prompt History
        </h2>
      </div>

      <div className="col-12 mb-4">
        <div className="glass-panel p-4">
            <div className="row g-3">
              <div className="col-md-9">
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-search"></i></span>
                  <input
                    type="text"
                    className="form-control shadow-none"
                    style={inputStyle}
                    placeholder="Search by name or IP..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <button 
                  className="btn w-100"
                  style={{ backgroundColor: 'var(--bg-pill)', color: 'var(--text-main)', border: '1px solid var(--border)' }}
                  onClick={() => setSearchTerm('')}
                >
                  <i className="bi bi-eraser me-1"></i> Clear Search
                </button>
              </div>
            </div>
        </div>
      </div>

      <div className="col-12">
        <div className="glass-panel">
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <h5 className="mb-0 fw-bold" style={{ color: 'var(--text-main)' }}>Prompt Events</h5>
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
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((log, index) => (
                      <tr key={log.id || index}>
                        <td style={{ color: 'var(--text-muted)' }}>{indexOfFirstItem + index + 1}</td>
                        <td className="fw-medium">{log.name}</td>
                        <td style={{ color: 'var(--text-muted)' }}>
                          <i className="bi bi-clock me-1"></i>
                          {new Date(log.dateTime).toLocaleString()}
                        </td>
                        <td><code style={{ color: 'var(--accent)' }}>{log.ipAddress}</code></td>
                        <td>
                          <span className="badge bg-info bg-opacity-75 text-dark">
                            <i className="bi bi-chat me-1"></i> {log.type}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-sm px-3 rounded-pill"
                            style={{ backgroundColor: 'var(--bg-pill)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
                            onClick={() => handleViewPrompt(log)}
                          >
                            <i className="bi bi-eye me-1"></i> View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
                        <i className="bi bi-chat-square-text fs-1 d-block mb-2" style={{ color: 'var(--text-muted)' }}></i>
                        <span style={{ color: 'var(--text-muted)' }}>No prompt records found</span>
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

      {selectedPrompt && (
        <div className="modal fade show d-flex align-items-center justify-content-center" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' }}>
          <div className="modal-dialog modal-lg w-100">
            <div className="glass-panel" style={{ backgroundColor: 'var(--bg-card)' }}>
              <div className="px-4 py-3 d-flex justify-content-between align-items-center" style={{ borderBottom: '1px solid var(--border)' }}>
                <h5 className="mb-0 fw-bold" style={{ color: 'var(--text-main)' }}>Prompt Details</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedPrompt(null)}></button>
              </div>
              <div className="p-4" style={{ color: 'var(--text-main)' }}>
                <p><strong>User:</strong> {selectedPrompt.name}</p>
                <p><strong>IP:</strong> <code style={{ color: 'var(--accent)' }}>{selectedPrompt.ipAddress}</code></p>
                <div className="p-3 rounded mt-3" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border)' }}>
                  Sample prompt content...
                </div>
              </div>
              <div className="px-4 py-3 text-end" style={{ borderTop: '1px solid var(--border)' }}>
                <button className="btn px-4" style={{ backgroundColor: 'var(--bg-pill)', color: 'var(--text-main)', border: '1px solid var(--border)' }} onClick={() => setSelectedPrompt(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptHistory;