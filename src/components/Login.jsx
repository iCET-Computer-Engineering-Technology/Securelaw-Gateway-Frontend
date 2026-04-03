import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { X } from 'lucide-react';
import { motion } from 'framer-motion'; 

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false); 
    const navigate = useNavigate(); 

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            
            let ipAddress = "Unknown";
            try {
                const ipRes = await axios.get('https://api.ipify.org?format=json');
                ipAddress = ipRes.data.ip;
            } catch (err) {
                console.error("Could not fetch IP", err);
            }

            
            const loginRequest = {
                email: email,
                password: password,
                ipAddress: ipAddress,
                deviceInfo: window.navigator.userAgent,
                loginDate: new Date().toLocaleDateString(),
                loginTime: new Date().toLocaleTimeString()
            };

            
            const response = await axios.post('http://localhost:8080/api/auth/login', loginRequest);
            
            
            
            const { token, role } = response.data; 

            if (token) {
                localStorage.setItem("token", token);
                localStorage.setItem("role", role); 
                
                console.log("Login Success!");
                
                
                navigate('/dashboard');
            }

        } catch (error) {
            console.error("Login Error:", error);
            
            const errorMsg = error.response?.data?.message || "Invalid email or password!";
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = { 
        backgroundColor: 'var(--bg-input)', 
        color: 'var(--text-main)', 
        border: '1px solid var(--border)' 
    };

    return (
        <div className="container d-flex align-items-center justify-content-center vh-100">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="card p-4 border-0 position-relative"
                style={{ 
                    width: '450px', 
                    borderRadius: '24px', 
                    background: 'var(--bg-glass)',
                    backdropFilter: 'blur(24px)', 
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid var(--border)', 
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                }}
            >
                {/* Close Button */}
                <button 
                    onClick={() => navigate('/collection')} 
                    className="btn position-absolute d-flex align-items-center justify-content-center p-0" 
                    style={{ 
                        top: '15px', right: '15px', width: '32px', height: '32px', 
                        borderRadius: '50%', background: 'var(--bg-pill)', color: 'var(--text-main)', 
                        border: '1px solid var(--border)', transition: 'all 0.2s ease', zIndex: 10 
                    }} 
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'} 
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    title="Go back"
                >
                    <X size={18} />
                </button>

                <div className="card-body text-center mt-2">
                    <h2 className="mb-2 fw-bold" style={{ color: 'var(--text-main)', whiteSpace: 'nowrap', fontSize: '1.8rem' }}>
                        SecureLaw AI Gateway
                    </h2>
                    <p className="mb-4 fw-medium" style={{ color: 'var(--text-muted)' }}>Welcome Back</p>
                    
                    <form onSubmit={handleLogin}>
                        <div className="mb-3">
                            <input 
                                type="email" 
                                className="form-control p-3 shadow-none" 
                                placeholder="Email" 
                                style={{ ...inputStyle, borderRadius: '12px' }} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="mb-4">
                            <input 
                                type="password" 
                                className="form-control p-3 shadow-none" 
                                placeholder="Password" 
                                style={{ ...inputStyle, borderRadius: '12px' }} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                        </div>

                        <motion.button 
                            whileTap={{ scale: 0.95 }} 
                            type="submit" 
                            disabled={loading}
                            className="btn w-100 p-3 fw-bold" 
                            style={{ 
                                borderRadius: '12px', backgroundColor: 'var(--accent)', 
                                color: '#fff', border: '1px solid var(--border)', fontSize: '1.1rem' 
                            }}
                        >
                            {loading ? "AUTHENTICATING..." : "LOGIN"}
                        </motion.button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;