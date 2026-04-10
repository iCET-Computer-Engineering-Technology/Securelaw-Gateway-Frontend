import React, { useEffect, useState } from 'react';
import {
  FaEdit,
  FaEye,
  FaTrash,
  FaUserCheck,
  FaSpinner,
  FaSearch,
  FaPlus,
  FaUserCircle,
} from 'react-icons/fa';
import { MdSecurity } from 'react-icons/md';
import RegisterForm from './components/RegisterForm';
import api from './api/axiosConfig';
import { showAiError, showAiSuccess } from './utils/aiAlerts';

const modalOverlayStyle = {
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px 16px',
  backgroundColor: 'rgba(0,0,0,0.58)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  zIndex: 1200,
  overflowY: 'auto',
};

const modalCardStyle = {
  width: '100%',
  maxWidth: '560px',
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border)',
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [deleteUser, setDeleteUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [loadError, setLoadError] = useState('');

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'SENIOR_LAWYER':
        return 'bg-primary';
      case 'JUNIOR_LAWYER':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'SENIOR_LAWYER':
        return 'Senior Lawyer';
      case 'JUNIOR_LAWYER':
        return 'Junior Lawyer';
      default:
        return role ? role.replace(/_/g, ' ') : 'Unknown';
    }
  };

  const getAvatarColor = (role) => {
    const colors = {
      SENIOR_LAWYER: '#ffffff',
      JUNIOR_LAWYER: '#ffffff',
      DEFAULT: '#ffffff',
    };

    return colors[role] || colors.DEFAULT;
  };

  const getAvatarBg = (role, seed) => {
    const backgrounds = {
      SENIOR_LAWYER: [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)',
        'linear-gradient(135deg, #5f2c82 0%, #49a09d 100%)',
      ],
      JUNIOR_LAWYER: [
        'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
        'linear-gradient(135deg, #1f4037 0%, #99f2c8 100%)',
      ],
      DEFAULT: [
        'linear-gradient(135deg, #757F9A 0%, #D7DDE8 100%)',
        'linear-gradient(135deg, #649173 0%, #DBD5A4 100%)',
      ],
    };

    const roleBackgrounds = backgrounds[role] || backgrounds.DEFAULT;
    return roleBackgrounds[seed % roleBackgrounds.length];
  };

  const generateProfilePic = (user) => {
    const numericSeed = Number(user.id) || 1;
    return {
      color: getAvatarColor(user.role),
      background: getAvatarBg(user.role, numericSeed),
      initials: user.name ? user.name.charAt(0).toUpperCase() : 'U',
    };
  };

  const normalizeUser = (user) => ({
    ...user,
    active:
      typeof user.active === 'boolean'
        ? user.active
        : typeof user.isActive === 'boolean'
          ? user.isActive
          : true,
    profilePic: generateProfilePic(user),
  });

  const filterUsers = (userList, term) => {
    const activeUsers = userList.filter((user) => user.active);
    if (!term.trim()) {
      setFilteredUsers(activeUsers);
      return;
    }

    const normalizedTerm = term.toLowerCase();
    setFilteredUsers(
      activeUsers.filter(
        (user) =>
          user.name?.toLowerCase().includes(normalizedTerm) ||
          user.email?.toLowerCase().includes(normalizedTerm),
      ),
    );
  };

  const getErrorMessage = (error, fallbackMessage) => {
    if (typeof error?.response?.data === 'string' && error.response.data.trim()) {
      return error.response.data;
    }

    if (error?.response?.data?.message) {
      return error.response.data.message;
    }

    if (error?.response?.data?.error) {
      return error.response.data.error;
    }

    if (error?.message) {
      return error.message;
    }

    return fallbackMessage;
  };

  const fetchUsers = async () => {
    setLoading(true);
    setLoadError('');

    try {
      const response = await api.get('/users/all');
      const normalizedUsers = Array.isArray(response.data)
        ? response.data.map(normalizeUser)
        : [];

      setUsers(normalizedUsers);
    } catch (error) {
      console.error('Error fetching users', error);
      setUsers([]);
      setFilteredUsers([]);
      setLoadError(getErrorMessage(error, 'Unable to load users right now.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterUsers(users, searchTerm);
  }, [searchTerm, users]);

  const closeAllModals = () => {
    setShowViewModal(false);
    setShowUpdateModal(false);
    setShowDeleteModal(false);
    setSelectedUser(null);
    setDeleteUser(null);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser({ ...user });
    setShowUpdateModal(true);
  };

  const showDeleteConfirmation = (user) => {
    setDeleteUser(user);
    setShowDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    if (!deleteUser) return;

    setDeletingId(deleteUser.id);
    setShowDeleteModal(false);

    try {
      await api.patch(`/users/${deleteUser.id}/deactivate`);
      await fetchUsers();
      showAiSuccess({
        title: 'User Deactivated',
        text: `User "${deleteUser.name}" has been deactivated successfully.`,
        timer: 2400,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Delete error:', error);
      showAiError({
        title: 'Unable to Deactivate User',
        text: getErrorMessage(error, 'Failed to deactivate user.'),
      });
    } finally {
      setDeletingId(null);
      setDeleteUser(null);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const updateData = {
        name: selectedUser.name,
        email: selectedUser.email,
        role: selectedUser.role,
      };

      await api.put(`/users/${selectedUser.id}`, updateData);
      setShowUpdateModal(false);
      await fetchUsers();
      showAiSuccess({
        title: 'User Updated',
        text: 'User updated successfully.',
        timer: 2400,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Update error', error);
      showAiError({
        title: 'Update Failed',
        text: getErrorMessage(error, 'Update failed.'),
      });
    }
  };

  const handleRegisterSuccess = async () => {
    await fetchUsers();
  };

  return (
    <div className="user-management-page app-container">
      <div className="container-fluid main-content user-management-content">
        <div className="d-flex justify-content-between align-items-center mb-4 px-2 gap-3 flex-wrap">
          <div>
            <h2 className="mb-1 fw-bold" style={{ color: 'var(--text-main)' }}>
              <FaUserCheck className="me-2" style={{ color: 'var(--accent)' }} />
              User Management
            </h2>
            <p className="text-main mb-0">
              <MdSecurity className="me-1" />
              Manage system users and their permissions
            </p>
          </div>
          <button
            type="button"
            className="btn px-4 py-2 fw-bold"
            style={{
              backgroundColor: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
            }}
            onClick={() => setShowRegisterModal(true)}
          >
            <FaPlus className="me-2" />
            Add New User
          </button>
        </div>

        <div className="row mb-4 px-2 gy-3 align-items-center">
          <div className="col-lg-6">
            <div className="input-group glass-panel rounded-pill overflow-hidden">
              <span className="input-group-text bg-transparent border-0 ps-4">
                <FaSearch className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control shadow-none bg-transparent border-0 text-white user-management-search"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="btn btn-outline-secondary border-0"
                  onClick={() => setSearchTerm('')}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <div className="col-lg-6 text-lg-end align-self-center">
            <span
              className="badge p-2 px-3 rounded-pill"
              style={{
                backgroundColor: 'var(--bg-pill)',
                color: 'var(--text-main)',
                border: '1px solid var(--border)',
              }}
            >
              Active Users: {filteredUsers.length}
            </span>
          </div>
        </div>

        {loadError && !loading && (
          <div
            className="mx-2 mb-3 px-3 py-2 rounded-3"
            style={{
              backgroundColor: 'rgba(220, 53, 69, 0.12)',
              border: '1px solid rgba(220, 53, 69, 0.35)',
              color: '#f5c2c7',
            }}
          >
            {loadError}
          </div>
        )}

        {loading ? (
          <div className="text-center py-5">
            <FaSpinner className="spinner-icon text-primary" size={40} />
            <p className="mt-3 text-muted">Loading users...</p>
          </div>
        ) : (
          <div className="glass-panel p-3 user-management-table-shell">
            <div className="table-responsive user-management-table-scroll">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="profile-pic-container">
                            {user.profilePic ? (
                              <div
                                className="profile-pic"
                                style={{
                                  background: user.profilePic.background,
                                  color: user.profilePic.color,
                                }}
                              >
                                {user.profilePic.initials}
                              </div>
                            ) : (
                              <FaUserCircle className="profile-pic-icon" />
                            )}
                          </div>
                        </td>
                        <td className="fw-medium">{user.name}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{user.email}</td>
                        <td>
                          <span className={`badge ${getRoleBadgeClass(user.role)} text-white p-2`}>
                            {getRoleLabel(user.role)}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="d-inline-flex gap-2 flex-wrap justify-content-center">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-info user-action-button"
                              onClick={() => handleViewUser(user)}
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-warning user-action-button"
                              onClick={() => handleEditUser(user)}
                              title="Edit User"
                            >
                              <FaEdit />
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger user-action-button"
                              onClick={() => showDeleteConfirmation(user)}
                              disabled={deletingId === user.id}
                              title="Delete User"
                            >
                              {deletingId === user.id ? <FaSpinner className="spinner-icon" /> : <FaTrash />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-5">
                        <FaUserCheck size={40} className="mb-2 text-muted" />
                        <p className="text-muted mb-0">No active users found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <RegisterForm
          show={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          onSuccess={handleRegisterSuccess}
        />

        {showDeleteModal && deleteUser && (
          <div style={modalOverlayStyle} onClick={closeAllModals}>
            <div className="glass-panel" style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header border-0 bg-danger bg-opacity-25 text-white p-3">
                <h5 className="modal-title m-0">
                  <FaTrash className="me-2" /> Confirm Deletion
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeAllModals}
                />
              </div>
              <div className="modal-body p-4 text-center">
                <h5 className="text-white mt-3">{deleteUser.name}</h5>
                <p className="text-muted">{deleteUser.email}</p>
                <p className="mb-0 text-white mt-4">
                  Are you sure you want to deactivate <strong>{deleteUser.name}</strong>?
                </p>
              </div>
              <div className="modal-footer border-0 p-3">
                <button
                  type="button"
                  className="btn text-white"
                  style={{ backgroundColor: 'var(--bg-pill)' }}
                  onClick={closeAllModals}
                >
                  Cancel
                </button>
                <button type="button" className="btn btn-danger" onClick={handleDeleteUser}>
                  Delete User
                </button>
              </div>
            </div>
          </div>
        )}

        {showViewModal && selectedUser && (
          <div style={modalOverlayStyle} onClick={closeAllModals}>
            <div className="glass-panel" style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header border-0 p-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <h5 className="modal-title text-white m-0">
                  <FaEye className="me-2" /> User Details
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeAllModals}
                />
              </div>
              <div className="modal-body p-4 text-white">
                <h4 className="text-center mb-4">{selectedUser.name}</h4>
                <p>
                  <strong>Email:</strong> <span className="text-muted">{selectedUser.email}</span>
                </p>
                <p>
                  <strong>Role:</strong>{' '}
                  <span className={`badge ${getRoleBadgeClass(selectedUser.role)} ms-2`}>
                    {getRoleLabel(selectedUser.role)}
                  </span>
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`badge ms-2 ${selectedUser.active ? 'bg-success' : 'bg-secondary'}`}>
                    {selectedUser.active ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
              <div className="modal-footer border-0 p-3">
                <button
                  type="button"
                  className="btn w-100 text-white"
                  style={{ backgroundColor: 'var(--bg-pill)' }}
                  onClick={closeAllModals}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {showUpdateModal && selectedUser && (
          <div style={modalOverlayStyle} onClick={closeAllModals}>
            <div className="glass-panel" style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header border-0 p-3 bg-warning bg-opacity-25">
                <h5 className="modal-title text-white m-0">
                  <FaEdit className="me-2" /> Edit User
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeAllModals}
                />
              </div>
              <form onSubmit={handleUpdate}>
                <div className="modal-body p-4 text-white">
                  <div className="mb-3">
                    <label className="form-label text-muted">Name</label>
                    <input
                      type="text"
                      className="form-control shadow-none"
                      style={{
                        backgroundColor: 'var(--bg-input)',
                        color: 'white',
                        border: '1px solid var(--border)',
                      }}
                      value={selectedUser.name}
                      onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Email</label>
                    <input
                      type="email"
                      className="form-control shadow-none"
                      style={{
                        backgroundColor: 'var(--bg-input)',
                        color: 'white',
                        border: '1px solid var(--border)',
                      }}
                      value={selectedUser.email}
                      onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted">Role</label>
                    <select
                      className="form-select shadow-none"
                      style={{
                        backgroundColor: 'var(--bg-input)',
                        color: 'white',
                        border: '1px solid var(--border)',
                      }}
                      value={selectedUser.role}
                      onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                    >
                      <option value="SENIOR_LAWYER" style={{ color: 'black' }}>
                        Senior Lawyer
                      </option>
                      <option value="JUNIOR_LAWYER" style={{ color: 'black' }}>
                        Junior Lawyer
                      </option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-0 p-3">
                  <button
                    type="button"
                    className="btn text-white"
                    style={{ backgroundColor: 'var(--bg-pill)' }}
                    onClick={closeAllModals}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-warning text-dark fw-bold">
                    Update User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .user-management-page {
          height: calc(100vh - 120px);
          max-height: calc(100vh - 120px);
          min-height: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .user-management-content {
          height: 100%;
          min-height: 0;
          display: flex;
          flex-direction: column;
          padding-top: 1.5rem;
          padding-bottom: 1.5rem;
        }
        .user-management-search {
          color: var(--text-main) !important;
        }
        .user-management-search::placeholder {
          color: var(--text-muted) !important;
          opacity: 1;
        }
        .user-management-search::-ms-input-placeholder {
          color: var(--text-muted) !important;
        }
        .user-management-table-shell {
          flex: 1 1 auto;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }
        .user-management-table-scroll {
          flex: 1 1 auto;
          min-height: 0;
          overflow: auto;
          border-radius: 18px;
        }
        .user-management-table-scroll thead th {
          position: sticky;
          top: 0;
          z-index: 2;
          background: var(--bg-glass) !important;
          box-shadow: inset 0 -1px 0 var(--border);
        }
        .user-action-button {
          min-width: 40px;
        }
        .profile-pic-container {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          overflow: hidden;
        }
        .profile-pic {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 18px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        .profile-pic-icon {
          font-size: 40px;
          color: #6c757d;
        }
        .spinner-icon {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default UserManagement;
