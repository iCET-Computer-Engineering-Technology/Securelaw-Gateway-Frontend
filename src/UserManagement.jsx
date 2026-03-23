import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    FaEdit, FaEye, FaTrash, FaUserCheck, 
    FaSpinner, FaSearch, FaPlus, FaSun, FaMoon,
    FaUserCircle
} from 'react-icons/fa';
import { MdEmail, MdPerson, MdSecurity } from 'react-icons/md';

const UserManagement = () => {
    // State declarations
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteUser, setDeleteUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [darkMode, setDarkMode] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const API_BASE_URL = 'http://localhost:8080/api/v1/users';

    // Theme Toggle
    const toggleTheme = () => {
        setDarkMode(!darkMode);
        if (!darkMode) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    };

    // Check for saved theme on load
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setDarkMode(true);
            document.body.classList.add('dark-mode');
        }
    }, []);

    // Fetch users with auto-refresh (every 30 seconds)
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/all`);
            console.log("Fetched users:", response.data);
            
            let updatedUsers = response.data.map(user => ({
                ...user,
                profilePic: generateProfilePic(user)
            }));
            
            // Filter only active users for display
            const activeUsers = updatedUsers.filter(user => user.active === true);
            setUsers(updatedUsers);
            filterUsers(activeUsers, searchTerm);
        } catch (error) {
            console.error("Error fetching users", error);
        } finally {
            setLoading(false);
        }
    };

    // Generate consistent profile picture for each user
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

    // Get avatar color based on role and seed
    const getAvatarColor = (role, seed) => {
        const colors = {
            'SENIOR_LAWYER': ['#4a90e2', '#5a6fe0', '#3f51b5', '#673ab7', '#9c27b0'],
            'JUNIOR_LAWYER': ['#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39'],
            'DEFAULT': ['#607d8b', '#795548', '#9e9e9e', '#616161', '#757575']
        };
        
        const roleColors = colors[role] || colors.DEFAULT;
        return roleColors[seed % roleColors.length];
    };

    // Get avatar background based on role and seed
    const getAvatarBg = (role, seed) => {
        const backgrounds = {
            'SENIOR_LAWYER': [
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)',
                'linear-gradient(135deg, #5f2c82 0%, #49a09d 100%)',
                'linear-gradient(135deg, #4568DC 0%, #B06AB3 100%)',
                'linear-gradient(135deg, #834d9b 0%, #d04ed6 100%)'
            ],
            'JUNIOR_LAWYER': [
                'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
                'linear-gradient(135deg, #1f4037 0%, #99f2c8 100%)',
                'linear-gradient(135deg, #0f2027 0%, #203a43 100%, #2c5364 100%)',
                'linear-gradient(135deg, #134e5e 0%, #71b280 100%)'
            ],
            'DEFAULT': [
                'linear-gradient(135deg, #757F9A 0%, #D7DDE8 100%)',
                'linear-gradient(135deg, #649173 0%, #DBD5A4 100%)',
                'linear-gradient(135deg, #8e9eab 0%, #eef2f3 100%)',
                'linear-gradient(135deg, #7F7FD5 0%, #86A8E7 50%, #91EAE4 100%)'
            ]
        };
        
        const roleBgs = backgrounds[role] || backgrounds.DEFAULT;
        return roleBgs[seed % roleBgs.length];
    };

    // Auto-refresh setup
    useEffect(() => {
        fetchUsers();
        const interval = setInterval(fetchUsers, 30000);
        return () => clearInterval(interval);
    }, []);

    // Search filter function
    const filterUsers = (userList, term) => {
        // Filter only active users and apply search
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

    // Handle search
    useEffect(() => {
        filterUsers(users, searchTerm);
    }, [searchTerm, users]);

    // Handle View User
    const handleViewUser = (user) => {
        setSelectedUser(user);
        setShowViewModal(true);
    };

    // Handle Edit User
    const handleEditUser = (user) => {
        setSelectedUser(user);
        setShowUpdateModal(true);
    };

    // Show Delete Confirmation Modal
    const showDeleteConfirmation = (user) => {
        setDeleteUser(user);
        setShowDeleteModal(true);
    };

    // Handle Delete User (Deactivate)
    const handleDeleteUser = async () => {
        if (!deleteUser) return;
        
        setDeletingId(deleteUser.id);
        setShowDeleteModal(false);
        
        try {
            // Call deactivate API
            await axios.patch(`${API_BASE_URL}/${deleteUser.id}/deactivate`);
            
            // Update local state - remove user from display
            setUsers(prevUsers => 
                prevUsers.map(u => 
                    u.id === deleteUser.id ? { ...u, active: false } : u
                )
            );
            
            // Filter out inactive users from display
            setFilteredUsers(prevFiltered => 
                prevFiltered.filter(u => u.id !== deleteUser.id)
            );
            
            alert(`User "${deleteUser.name}" has been deactivated successfully!`);
        } catch (error) {
            console.error("Delete error:", error);
            alert("Failed to deactivate user!");
        }
        
        setDeletingId(null);
        setDeleteUser(null);
    };

    // Handle Update User
    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const updateData = {
                name: selectedUser.name,
                email: selectedUser.email,
                role: selectedUser.role
            };
            
            await axios.put(`${API_BASE_URL}/${selectedUser.id}`, updateData);
            setShowUpdateModal(false);
            fetchUsers();
            alert("User updated successfully!");
        } catch (error) {
            console.error("Update error", error);
            alert("Update failed!");
        }
    };

    // Get role badge class
    const getRoleBadgeClass = (role) => {
        switch(role) {
            case 'SENIOR_LAWYER': return 'bg-primary';
            case 'JUNIOR_LAWYER': return 'bg-info';
            default: return 'bg-secondary';
        }
    };

    return (
        <div className={`app-container ${darkMode ? 'dark-theme' : ''}`}>
            <div className="container-fluid main-content">
                {/* Header with Add Button Only */}
                <div className="d-flex justify-content-between align-items-center header-section">
                    <div>
                        <h2 className="mb-1">
                            <FaUserCheck className="me-2 text-primary" />
                            User Management
                        </h2>
                        <p className="text-muted mb-0">
                            <MdSecurity className="me-1" />
                            Manage system users and their permissions
                        </p>
                    </div>
                    <button 
                        className="btn btn-primary"
                        onClick={() => alert("Add New User feature will be implemented by another developer.")}
                    >
                        <FaPlus className="me-2" />
                        Add New User
                    </button>
                </div>

                {/* Search Bar */}
                <div className="row search-section">
                    <div className="col-md-6">
                        <div className="input-group">
                            <span className="input-group-text bg-white">
                                <FaSearch className="text-muted" />
                            </span>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button 
                                    className="btn btn-outline-secondary"
                                    onClick={() => setSearchTerm('')}
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="col-md-6 text-end">
                        <span className="badge bg-light text-dark p-2 border">
                            Active Users: {filteredUsers.length}
                        </span>
                    </div>
                </div>

                {/* Loading Spinner */}
                {loading ? (
                    <div className="text-center py-5 loading-section">
                        <FaSpinner className="spinner-icon text-primary" size={40} />
                        <p className="mt-3 text-muted">Loading users...</p>
                    </div>
                ) : (
                    /* Users Table - No Status Column */
                    <div className="table-responsive shadow-sm rounded table-section">
                        <table className="table table-hover align-middle mb-0">
                            <thead className={darkMode ? 'bg-dark text-white' : 'bg-light'}>
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
                                                        <div 
                                                            className="profile-pic"
                                                            style={{
                                                                background: user.profilePic.background,
                                                                color: 'white'
                                                            }}
                                                        >
                                                            {user.profilePic.initials}
                                                        </div>
                                                    ) : (
                                                        <FaUserCircle className="profile-pic-icon" />
                                                    )}
                                                </div>
                                            </td>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span className={`badge ${getRoleBadgeClass(user.role)} text-white p-2`}>
                                                    {user.role === 'SENIOR_LAWYER' ? '👨‍⚖️ Senior' : '👨‍🎓 Junior'}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <button
                                                    className="btn btn-sm btn-outline-info me-2"
                                                    onClick={() => handleViewUser(user)}
                                                    title="View Details"
                                                >
                                                    <FaEye />
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-warning me-2"
                                                    onClick={() => handleEditUser(user)}
                                                    title="Edit User"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => showDeleteConfirmation(user)}
                                                    disabled={deletingId === user.id}
                                                    title="Delete User"
                                                >
                                                    {deletingId === user.id ? (
                                                        <FaSpinner className="spinner-icon" />
                                                    ) : (
                                                        <FaTrash />
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5">
                                            <FaUserCheck size={40} className="mb-2 text-muted" />
                                            <p className="text-muted">
                                                {searchTerm ? 'No matching active users found' : 'No active users found'}
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Theme Toggle Button - Bottom Right - Icon Only */}
                <div className="theme-toggle-container">
                    <button 
                        className={`btn theme-toggle-btn ${darkMode ? 'btn-light' : 'btn-dark'}`}
                        onClick={toggleTheme}
                        title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
                    </button>
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteModal && deleteUser && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header bg-danger text-white">
                                    <h5 className="modal-title">
                                        <FaTrash className="me-2" />
                                        Confirm Deletion
                                    </h5>
                                    <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)} />
                                </div>
                                <div className="modal-body">
                                    <div className="text-center mb-3">
                                        <div className="profile-pic-large mb-3">
                                            {deleteUser.profilePic ? (
                                                <div 
                                                    style={{
                                                        background: deleteUser.profilePic.background,
                                                        color: 'white',
                                                        width: '80px',
                                                        height: '80px',
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '32px',
                                                        fontWeight: 'bold',
                                                        margin: '0 auto'
                                                    }}
                                                >
                                                    {deleteUser.profilePic.initials}
                                                </div>
                                            ) : (
                                                <FaUserCircle style={{ fontSize: '80px', color: '#ccc' }} />
                                            )}
                                        </div>
                                        <h5>{deleteUser.name}</h5>
                                        <p className="text-muted">{deleteUser.email}</p>
                                    </div>
                                    
                                    <div className="alert alert-warning">
                                        <p className="mb-0 text-center">
                                            <strong>Warning:</strong> This user will be deactivated and removed from the active users list.
                                        </p>
                                    </div>
                                    
                                    <p className="text-center mb-0">
                                        Are you sure you want to delete user <strong>{deleteUser.name}</strong>?
                                    </p>
                                </div>
                                <div className="modal-footer">
                                    <button 
                                        className="btn btn-secondary" 
                                        onClick={() => setShowDeleteModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        className="btn btn-danger"
                                        onClick={handleDeleteUser}
                                    >
                                        Delete User
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* View Modal */}
                {showViewModal && selectedUser && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header bg-info text-white">
                                    <h5 className="modal-title">
                                        <FaEye className="me-2" />User Details
                                    </h5>
                                    <button type="button" className="btn-close" onClick={() => setShowViewModal(false)} />
                                </div>
                                <div className="modal-body">
                                    <div className="text-center mb-4">
                                        <div className="profile-photo-large-container">
                                            {selectedUser.profilePic ? (
                                                <div 
                                                    className="profile-photo-large"
                                                    style={{
                                                        background: selectedUser.profilePic.background,
                                                        color: 'white'
                                                    }}
                                                >
                                                    {selectedUser.profilePic.initials}
                                                </div>
                                            ) : (
                                                <FaUserCircle className="profile-photo-large-icon" />
                                            )}
                                        </div>
                                        <h4 className="mt-2">{selectedUser.name}</h4>
                                        <p className="text-muted">{selectedUser.email}</p>
                                    </div>

                                    <table className="table table-borderless">
                                        <tbody>
                                            <tr>
                                                <th style={{ width: '30%' }}>User ID:</th>
                                                <td><strong>#{selectedUser.id}</strong></td>
                                            </tr>
                                            <tr>
                                                <th>Full Name:</th>
                                                <td>{selectedUser.name}</td>
                                            </tr>
                                            <tr>
                                                <th>Email Address:</th>
                                                <td>{selectedUser.email}</td>
                                            </tr>
                                            <tr>
                                                <th>Role:</th>
                                                <td>
                                                    <span className={`badge ${getRoleBadgeClass(selectedUser.role)} text-white p-2`}>
                                                        {selectedUser.role === 'SENIOR_LAWYER' ? '👨‍⚖️ Senior Lawyer' : '👨‍🎓 Junior Lawyer'}
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th>Status:</th>
                                                <td>
                                                    <span className="badge bg-success p-2">
                                                        <FaUserCheck className="me-1" /> Active
                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-secondary" onClick={() => setShowViewModal(false)}>
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {showUpdateModal && selectedUser && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header bg-warning text-white">
                                    <h5 className="modal-title">
                                        <FaEdit className="me-2" />Edit User
                                    </h5>
                                    <button type="button" className="btn-close" onClick={() => setShowUpdateModal(false)} />
                                </div>
                                <form onSubmit={handleUpdate}>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Name</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={selectedUser.name}
                                                onChange={e => setSelectedUser({...selectedUser, name: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={selectedUser.email}
                                                onChange={e => setSelectedUser({...selectedUser, email: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">Role</label>
                                            <select
                                                className="form-select"
                                                value={selectedUser.role}
                                                onChange={e => setSelectedUser({...selectedUser, role: e.target.value})}
                                            >
                                                <option value="SENIOR_LAWYER">Senior Lawyer</option>
                                                <option value="JUNIOR_LAWYER">Junior Lawyer</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowUpdateModal(false)}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-warning text-white">
                                            Update User
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Styles */}
            <style>{`
                .app-container {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                }
                
                .main-content {
                    flex: 1;
                    padding: 30px 40px 100px 40px;
                }
                
                /* Section Spacing */
                .header-section {
                    margin-bottom: 30px;
                    padding: 0 5px;
                }
                
                .search-section {
                    margin-bottom: 25px;
                    padding: 0 5px;
                }
                
                .loading-section {
                    padding: 50px 5px;
                }
                
                .table-section {
                    margin-top: 10px;
                    padding: 0 5px;
                }
                
                /* Spinner Animation */
                .spinner-icon {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                /* Profile Picture Styles */
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
                    text-transform: uppercase;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                }
                
                .profile-pic-icon {
                    font-size: 40px;
                    color: #6c757d;
                }
                
                .profile-photo-large-container {
                    width: 120px;
                    height: 120px;
                    margin: 0 auto;
                }
                
                .profile-photo-large {
                    width: 120px;
                    height: 120px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 48px;
                    text-transform: uppercase;
                    margin: 0 auto;
                }
                
                .profile-photo-large-icon {
                    font-size: 120px;
                    color: #6c757d;
                }
                
                .profile-pic-large {
                    width: 80px;
                    height: 80px;
                    margin: 0 auto;
                }
                
                /* Theme Toggle Button */
                .theme-toggle-container {
                    position: fixed;
                    bottom: 30px;
                    right: 40px;
                    z-index: 1000;
                }
                
                .theme-toggle-btn {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    transition: all 0.3s ease;
                    border: none;
                    padding: 0;
                }
                
                .theme-toggle-btn:hover {
                    transform: translateY(-3px) scale(1.1);
                    box-shadow: 0 6px 20px rgba(0,0,0,0.25);
                }
                
                .theme-toggle-btn.btn-dark {
                    background-color: #2d2d2d;
                    color: white;
                }
                
                .theme-toggle-btn.btn-light {
                    background-color: #ffffff;
                    color: #333;
                }
                
                /* Dark Theme Styles */
                .dark-theme {
                    background-color: #1a1a1a;
                    color: #ffffff;
                }
                
                .dark-theme .table {
                    color: #ffffff;
                    background-color: #2d2d2d;
                }
                
                .dark-theme .table thead th {
                    background-color: #333333 !important;
                    color: #ffffff !important;
                }
                
                .dark-theme .table td {
                    background-color: #2d2d2d;
                    color: #ffffff;
                }
                
                .dark-theme .table-hover tbody tr:hover {
                    background-color: #3d3d3d;
                }
                
                .dark-theme .modal-content {
                    background-color: #2d2d2d;
                    color: #ffffff;
                }
                
                .dark-theme .form-control,
                .dark-theme .form-select,
                .dark-theme .input-group-text {
                    background-color: #3d3d3d;
                    border-color: #4d4d4d;
                    color: #ffffff;
                }
                
                .dark-theme .form-control:focus,
                .dark-theme .form-select:focus {
                    background-color: #3d3d3d;
                    color: #ffffff;
                }
                
                .dark-theme .bg-light {
                    background-color: #3d3d3d !important;
                    color: #ffffff !important;
                }
                
                .dark-theme .text-muted {
                    color: #aaaaaa !important;
                }
                
                .dark-theme .profile-pic-icon,
                .dark-theme .profile-photo-large-icon {
                    color: #aaaaaa;
                }
                
                .dark-theme .theme-toggle-btn.btn-dark {
                    background-color: #4d4d4d;
                }
                
                .dark-theme .theme-toggle-btn.btn-dark:hover {
                    background-color: #5d5d5d;
                }
                
                .btn-outline-info, .btn-outline-warning, .btn-outline-danger {
                    margin: 0 2px;
                }
                
                /* Responsive Padding */
                @media (max-width: 768px) {
                    .main-content {
                        padding: 20px 20px 80px 20px;
                    }
                    
                    .theme-toggle-container {
                        right: 20px;
                        bottom: 20px;
                    }
                }
            `}</style>
        </div>
    );
};

export default UserManagement;