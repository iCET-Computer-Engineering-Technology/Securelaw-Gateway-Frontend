import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrashAlt, FaUserCheck, FaUserTimes, FaSpinner } from 'react-icons/fa';
import { MdEmail, MdPerson, MdSecurity } from 'react-icons/md';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const API_BASE_URL = 'http://localhost:8080/api/v1/users';

    const fetchUsers = async () => {
        setLoading(true);
        try {
            console.log("Fetching users from:", `${API_BASE_URL}/all`);
            const response = await axios.get(`${API_BASE_URL}/all`);
            console.log("Backend response DATA:", response.data);
            
            
            let updatedUsers = response.data.map(user => {
               
                const storedStatus = localStorage.getItem(`user_active_${user.id}`);
                if (storedStatus !== null) {
                   
                    return { ...user, active: storedStatus === 'true' };
                } else {
                  
                    return { ...user, active: true };
                }
            });
            
            setUsers(updatedUsers);
        } catch (error) {
            console.error("Error fetching users", error);
            alert("Error fetching users. Please check if backend is running.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeactivate = async (id) => {
        console.log("Deactivate clicked for user ID:", id);
        
        const user = users.find(u => u.id === id);
        
        if (window.confirm(`Are you sure you want to deactivate user "${user?.name}"?`)) {
            try {
               
                const response = await axios.patch(`${API_BASE_URL}/${id}/deactivate`);
                console.log("Deactivate response:", response.data);
                
              
                localStorage.setItem(`user_active_${id}`, 'false');
                
              
                setUsers(prevUsers => 
                    prevUsers.map(u => 
                        u.id === id ? { ...u, active: false } : u
                    )
                );
                
                alert("User deactivated successfully!");
                
            } catch (error) {
                console.error("Deactivation error:", error);
                
               
                if (window.confirm("Backend API failed. Do you want to simulate deactivation for testing?")) {
                    localStorage.setItem(`user_active_${id}`, 'false');
                    setUsers(prevUsers => 
                        prevUsers.map(u => 
                            u.id === id ? { ...u, active: false } : u
                        )
                    );
                    alert("User deactivated in UI only (Simulated)");
                } else {
                    alert("Error deactivating user. Please try again.");
                }
            }
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const updateData = {
                name: selectedUser.name,
                email: selectedUser.email,
                role: selectedUser.role
            };
            
            const response = await axios.put(`${API_BASE_URL}/${selectedUser.id}`, updateData);
            console.log("Update response:", response);
            
         
            localStorage.removeItem(`user_active_${selectedUser.id}`);
            
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
        <div className="container-fluid mt-4">
        
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1">
                        <FaUserCheck className="me-2 text-primary" />
                        User Management
                    </h2>
                    <p className="text-muted">
                        <MdSecurity className="me-1" />
                        Manage system users and their permissions
                    </p>
                   
                </div>
                <div>
                    <button 
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={fetchUsers}
                    >
                        🔄 Refresh
                    </button>
                    <span className="badge bg-light text-dark p-2 border">
                        Total Users: {users.length}
                    </span>
                </div>
            </div>

          
            {loading ? (
                <div className="text-center py-5">
                    <FaSpinner className="spinner-icon text-primary" size={40} />
                    <p className="mt-3 text-muted">Loading users...</p>
                </div>
            ) : (
                <div className="table-responsive shadow-sm rounded">
                    <table className="table table-hover table-bordered align-middle mb-0">
                        <thead className="table-dark">
                            <tr>
                                <th>#ID</th>
                                <th><MdPerson className="me-2" />Name</th>
                                <th><MdEmail className="me-2" />Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length > 0 ? (
                                users.map(user => (
                                    <tr key={user.id}>
                                        <td className="fw-bold">#{user.id}</td>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={`badge ${getRoleBadgeClass(user.role)} text-white p-2`}>
                                                {user.role === 'SENIOR_LAWYER' ? '👨‍⚖️ Senior' : '👨‍🎓 Junior'}
                                            </span>
                                        </td>
                                        <td>
                                            {user.active ? 
                                                <span className="badge bg-success p-2">
                                                    <FaUserCheck className="me-1" /> Active
                                                </span> : 
                                                <span className="badge bg-secondary p-2">
                                                    <FaUserTimes className="me-1" /> Inactive
                                                </span>
                                            }
                                        </td>
                                        <td className="text-center">
                                            <button
                                                className="btn btn-sm btn-outline-warning me-2"
                                                onClick={() => { 
                                                    setSelectedUser(user); 
                                                    setShowUpdateModal(true); 
                                                }}
                                            >
                                                <FaEdit className="me-1" /> Edit
                                            </button>
                                            <button
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => handleDeactivate(user.id)}
                                                disabled={!user.active}
                                            >
                                                <FaTrashAlt className="me-1" /> Deactivate
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-5">
                                        <FaUserTimes size={40} className="mb-2 text-muted" />
                                        <p className="text-muted">No users found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

           
            {showUpdateModal && selectedUser && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header bg-warning text-white">
                                <h5 className="modal-title">
                                    <FaEdit className="me-2" />Edit User
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close btn-close-white" 
                                    onClick={() => setShowUpdateModal(false)}
                                />
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
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary"
                                        onClick={() => setShowUpdateModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn btn-warning text-white"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
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