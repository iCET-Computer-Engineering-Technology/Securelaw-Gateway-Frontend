import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FaEdit, FaEye, FaTrash, FaUserCheck, 
    FaSpinner, FaSearch, FaPlus, FaTimes, FaUserCircle
} from 'react-icons/fa';
import { MdSecurity } from 'react-icons/md';
import RegisterForm from './components/RegisterForm'; 

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

    const API_BASE_URL = 'http://localhost:8080/api/v1/users';

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/all`);
            let updatedUsers = response.data.map(user => ({
                ...user,
                profilePic: generateProfilePic(user)
            }));
            const activeUsers = updatedUsers.filter(user => user.active === true);
            setUsers(updatedUsers);
            filterUsers(activeUsers, searchTerm);
        } catch (error) {
            console.error("Error fetching users", error);
        } finally {
            setLoading(false);
        }
    };

    const generateProfilePic = (user) => {
        const seed = user.id || Math.random();
        return {
            style: (seed % 5) + 1,
            color: getAvatarColor(user.role, seed),
            background: getAvatarBg(user.role, seed),
            initials: user.name ? user.name.charAt(0).toUpperCase() : 'U',
            fullName: user.name || 'User',
        };
    };

    const getAvatarColor = (role, seed) => {
        const colors = {
            'SENIOR_LAWYER': ['#4a90e2', '#5a6fe0', '#3f51b5', '#673ab7', '#9c27b0'],
            'JUNIOR_LAWYER': ['#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39'],
            'DEFAULT': ['#607d8b', '#795548', '#9e9e9e', '#616161', '#757575']
        };
        const roleColors = colors[role] || colors.DEFAULT;
        return '#ffffff';
    };

    const getAvatarBg = (role, seed) => {
        const backgrounds = {
            'SENIOR_LAWYER': [
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)',
                'linear-gradient(135deg, #5f2c82 0%, #49a09d 100%)'
            ],
            'JUNIOR_LAWYER': [
                'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
                'linear-gradient(135deg, #1f4037 0%, #99f2c8 100%)'
            ],
            'DEFAULT': [
                'linear-gradient(135deg, #757F9A 0%, #D7DDE8 100%)',
                'linear-gradient(135deg, #649173 0%, #DBD5A4 100%)'
            ]
        };
        const roleBgs = backgrounds[role] || backgrounds.DEFAULT;
        return roleBgs[seed % roleBgs.length];
    };

    useEffect(() => {
        fetchUsers();
        const interval = setInterval(fetchUsers, 30000);
        return () => clearInterval(interval);
    }, []);

    const filterUsers = (userList, term) => {
        const activeUsers = userList.filter(user => user.active === true);
        if (!term.trim()) {
            setFilteredUsers(activeUsers);
            return;
        }
        const filtered = activeUsers.filter(user => 
            user.name?.toLowerCase().includes(term.toLowerCase()) ||
            user.email?.toLowerCase().includes(term.toLowerCase())
        );
        setFilteredUsers(filtered);
    };

    useEffect(() => {
        filterUsers(users, searchTerm);
    }, [searchTerm, users]);

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setShowViewModal(true);
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
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
            await axios.patch(`${API_BASE_URL}/${deleteUser.id}/deactivate`);
            setUsers(prevUsers => prevUsers.map(u => u.id === deleteUser.id ? { ...u, active: false } : u));
            setFilteredUsers(prevFiltered => prevFiltered.filter(u => u.id !== deleteUser.id));
            alert(`User "${deleteUser.name}" has been deactivated successfully!`);
        } catch (error) {
            console.error("Delete error:", error);
            alert("Failed to deactivate user!");
        }
        setDeletingId(null);
        setDeleteUser(null);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const updateData = { name: selectedUser.name, email: selectedUser.email, role: selectedUser.role };
            await axios.put(`${API_BASE_URL}/${selectedUser.id}`, updateData);
            setShowUpdateModal(false);
            fetchUsers();
            alert("User updated successfully!");
        } catch (error) {
            console.error("Update error", error);
            alert("Update failed!");
        }
    };

    const getRoleBadgeClass = (role) => {
        switch(role) {
            case 'SENIOR_LAWYER': return 'bg-primary';
            case 'JUNIOR_LAWYER': return 'bg-info';
            default: return 'bg-secondary';
        }
    };

    return (
        <div className="app-container pt-4 mt-5">
            <div className="container-fluid main-content">
                
                <div className="d-flex justify-content-between align-items-center mb-4 px-2">
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
                        className="btn px-4 py-2 fw-bold"
                        style={{ backgroundColor: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '12px' }}
                        onClick={() => setShowRegisterModal(true)}
                    >
                        <FaPlus className="me-2" />
                        Add New User
                    </button>
                </div>

                <div className="row mb-4 px-2">
                    <div className="col-md-6">
                        <div className="input-group glass-panel rounded-pill overflow-hidden">
                            <span className="input-group-text bg-transparent border-0 ps-4">
                                <FaSearch className="text-muted" />
                            </span>
                            <input
                                type="text"
                                className="form-control shadow-none bg-transparent border-0 text-white"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button className="btn btn-outline-secondary border-0" onClick={() => setSearchTerm('')}>
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="col-md-6 text-end align-self-center">
                        <span className="badge p-2 px-3 rounded-pill" style={{ backgroundColor: 'var(--bg-pill)', color: 'var(--text-main)', border: '1px solid var(--border)' }}>
                            Active Users: {filteredUsers.length}
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <FaSpinner className="spinner-icon text-primary" size={40} />
                        <p className="mt-3 text-muted">Loading users...</p>
                    </div>
                ) : (
                    <div className="table-responsive glass-panel p-3">
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
                                    filteredUsers.map(user => (
                                        <tr key={user.id}>
                                            <td>
                                                <div className="profile-pic-container">
                                                    {user.profilePic ? (
                                                        <div className="profile-pic" style={{ background: user.profilePic.background, color: 'white' }}>
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
                                                    {user.role === 'SENIOR_LAWYER' ? '👨‍⚖️ Senior' : '👨‍🎓 Junior'}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <button className="btn btn-sm btn-outline-info me-2" onClick={() => handleViewUser(user)} title="View Details"><FaEye /></button>
                                                <button className="btn btn-sm btn-outline-warning me-2" onClick={() => handleEditUser(user)} title="Edit User"><FaEdit /></button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => showDeleteConfirmation(user)} disabled={deletingId === user.id} title="Delete User">
                                                    {deletingId === user.id ? <FaSpinner className="spinner-icon" /> : <FaTrash />}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5">
                                            <FaUserCheck size={40} className="mb-2 text-muted" />
                                            <p className="text-muted">No active users found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {showRegisterModal && (
                    <div 
                        className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                        style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 9999 }}
                        onClick={() => setShowRegisterModal(false)}
                    >
                        <div onClick={e => e.stopPropagation()}>
                            <RegisterForm onClose={() => setShowRegisterModal(false)} />
                        </div>
                    </div>
                )}

                {showDeleteModal && deleteUser && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="glass-panel w-100" style={{ backgroundColor: 'var(--bg-card)' }}>
                                <div className="modal-header border-0 bg-danger bg-opacity-25 text-white p-3">
                                    <h5 className="modal-title m-0"><FaTrash className="me-2" /> Confirm Deletion</h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowDeleteModal(false)} />
                                </div>
                                <div className="modal-body p-4 text-center">
                                    <h5 className="text-white mt-3">{deleteUser.name}</h5>
                                    <p className="text-muted">{deleteUser.email}</p>
                                    <p className="mb-0 text-white mt-4">Are you sure you want to deactivate <strong>{deleteUser.name}</strong>?</p>
                                </div>
                                <div className="modal-footer border-0 p-3">
                                    <button className="btn text-white" style={{ backgroundColor: 'var(--bg-pill)' }} onClick={() => setShowDeleteModal(false)}>Cancel</button>
                                    <button className="btn btn-danger" onClick={handleDeleteUser}>Delete User</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showViewModal && selectedUser && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="glass-panel w-100" style={{ backgroundColor: 'var(--bg-card)' }}>
                                <div className="modal-header border-0 p-3" style={{ borderBottom: '1px solid var(--border)' }}>
                                    <h5 className="modal-title text-white m-0"><FaEye className="me-2" /> User Details</h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowViewModal(false)} />
                                </div>
                                <div className="modal-body p-4 text-white">
                                    <h4 className="text-center mb-4">{selectedUser.name}</h4>
                                    <p><strong>Email:</strong> <span className="text-muted">{selectedUser.email}</span></p>
                                    <p><strong>Role:</strong> <span className={`badge ${getRoleBadgeClass(selectedUser.role)} ms-2`}>{selectedUser.role}</span></p>
                                    <p><strong>Status:</strong> <span className="badge bg-success ms-2">Active</span></p>
                                </div>
                                <div className="modal-footer border-0 p-3">
                                    <button className="btn w-100 text-white" style={{ backgroundColor: 'var(--bg-pill)' }} onClick={() => setShowViewModal(false)}>Close</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showUpdateModal && selectedUser && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="glass-panel w-100" style={{ backgroundColor: 'var(--bg-card)' }}>
                                <div className="modal-header border-0 p-3 bg-warning bg-opacity-25">
                                    <h5 className="modal-title text-white m-0"><FaEdit className="me-2" /> Edit User</h5>
                                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowUpdateModal(false)} />
                                </div>
                                <form onSubmit={handleUpdate}>
                                    <div className="modal-body p-4 text-white">
                                        <div className="mb-3">
                                            <label className="form-label text-muted">Name</label>
                                            <input type="text" className="form-control shadow-none" style={{ backgroundColor: 'var(--bg-input)', color: 'white', border: '1px solid var(--border)' }} value={selectedUser.name} onChange={e => setSelectedUser({...selectedUser, name: e.target.value})} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label text-muted">Email</label>
                                            <input type="email" className="form-control shadow-none" style={{ backgroundColor: 'var(--bg-input)', color: 'white', border: '1px solid var(--border)' }} value={selectedUser.email} onChange={e => setSelectedUser({...selectedUser, email: e.target.value})} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label text-muted">Role</label>
                                            <select className="form-select shadow-none" style={{ backgroundColor: 'var(--bg-input)', color: 'white', border: '1px solid var(--border)' }} value={selectedUser.role} onChange={e => setSelectedUser({...selectedUser, role: e.target.value})}>
                                                <option value="SENIOR_LAWYER" style={{ color: 'black' }}>Senior Lawyer</option>
                                                <option value="JUNIOR_LAWYER" style={{ color: 'black' }}>Junior Lawyer</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="modal-footer border-0 p-3">
                                        <button type="button" className="btn text-white" style={{ backgroundColor: 'var(--bg-pill)' }} onClick={() => setShowUpdateModal(false)}>Cancel</button>
                                        <button type="submit" className="btn btn-warning text-dark fw-bold">Update User</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            <style>{`
                .profile-pic-container { width: 40px; height: 40px; border-radius: 50%; overflow: hidden; }
                .profile-pic { width: 100%; height: 100%; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
                .profile-pic-icon { font-size: 40px; color: #6c757d; }
                .spinner-icon { animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default UserManagement;