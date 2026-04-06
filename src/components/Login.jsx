import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { X, ShieldCheck, BrainCircuit, FileText } from 'lucide-react'; 
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
            // Fetch IP Address for Audit Logs
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

            // Post to Backend API
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

    return (
        <div className="d-flex w-100 vh-100" style={{ backgroundColor: 'var(--bg-main)', overflow: 'hidden' }}>
            
            {/* Forces placeholders to be perfectly visible */}
            <style>
                {`
                .login-input {
                    background-color: transparent !important;
                    border: 2px solid var(--border) !important;
                    color: var(--text-main) !important;
                    transition: all 0.2s ease !important;
                }
                .login-input:focus {
                    border-color: var(--accent) !important;
                    box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.1) !important;
                    background-color: var(--bg-glass) !important;
                }
                .login-input::placeholder {
                    color: var(--text-muted) !important;
                    opacity: 0.9 !important;
                }
                `}
            </style>

            {/* LEFT SIDE: Enterprise Branding (from dev branch) */}
            <div className="d-none d-lg-flex flex-column justify-content-center p-5 position-relative" style={{ width: '55%', borderRight: '1px solid var(--border)' }}>
                <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(13, 110, 253, 0.08) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>

                <div style={{ zIndex: 1, maxWidth: '600px', margin: '0 auto' }}>
                    <div className="d-flex align-items-center gap-3 mb-5">
                        <div className="p-3 rounded-4 shadow-sm d-flex align-items-center justify-content-center" style={{ backgroundColor: 'var(--bg-pill)', border: '1px solid var(--border)' }}>
                           <img src="/securelawicon.svg" alt="SecureLaw Logo" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
                        </div>
                        <h1 className="fw-bold mb-0" style={{ color: 'var(--text-main)', fontSize: '2.5rem', letterSpacing: '-1px' }}>
                            SecureLaw <span style={{ color: 'var(--accent)' }}>AI</span>
                        </h1>
                    </div>

                    <h2 className="fw-bold mb-4" style={{ color: 'var(--text-main)', fontSize: '3rem', lineHeight: '1.2', letterSpacing: '-0.5px' }}>
                        The Gateway to <br/>Legal Intelligence.
                    </h2>
                    <p className="mb-5" style={{ color: 'var(--text-muted)', fontSize: '1.15rem', lineHeight: '1.6' }}>
                        Access your immutable audit logs, manage secure templates, and utilize advanced AI prompting in one unified, enterprise-grade environment.
                    </p>

                    <div className="d-flex flex-column gap-4 mt-2">
                        <div className="d-flex align-items-center gap-4">
                            <div className="p-2 rounded-circle shadow-sm" style={{ backgroundColor: 'rgba(25, 135, 84, 0.1)', color: '#198754', border: '1px solid rgba(25, 135, 84, 0.2)' }}><ShieldCheck size={22} /></div>
                            <span style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: '500' }}>Enterprise-Grade Compliance</span>
                        </div>
                        <div className="d-flex align-items-center gap-4">
                            <div className="p-2 rounded-circle shadow-sm" style={{ backgroundColor: 'rgba(13, 110, 253, 0.1)', color: '#0d6efd', border: '1px solid rgba(13, 110, 253, 0.2)' }}><BrainCircuit size={22} /></div>
                            <span style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: '500' }}>AI-Powered Analytics</span>
                        </div>
                        <div className="d-flex align-items-center gap-4">
                            <div className="p-2 rounded-circle shadow-sm" style={{ backgroundColor: 'rgba(13, 202, 240, 0.1)', color: '#0dcaf0', border: '1px solid rgba(13, 202, 240, 0.2)' }}><FileText size={22} /></div>
                            <span style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: '500' }}>Secure Template Management</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: Form Seamlessly Floating on Background */}
            <div className="d-flex flex-column justify-content-center align-items-center p-4 position-relative" style={{ width: '100%', maxWidth: '100%', flex: '1 1 auto', zIndex: 2 }}>
                
                <button 
                    onClick={() => navigate('/collection')} 
                    className="btn position-absolute d-flex align-items-center justify-content-center p-0" 
                    style={{ 
                        top: '30px', right: '30px', width: '40px', height: '40px', 
                        borderRadius: '50%', background: 'var(--bg-pill)', color: 'var(--text-main)', 
                        border: '1px solid var(--border)', transition: 'all 0.2s ease', zIndex: 10 
                    }} 
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'} 
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    title="Go back"
                >
                    <X size={20} />
                </button>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    style={{ width: '100%', maxWidth: '400px' }}
                >
                    <div className="text-center mb-5">
                        <h2 className="mb-2 fw-bold" style={{ color: 'var(--text-main)', fontSize: '2.2rem' }}>
                            Welcome Back
                        </h2>
                        <p className="fw-medium" style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                            Sign in to your SecureLaw account
                        </p>
                    </div>
                    
                    <form onSubmit={handleLogin}>
                        <div className="mb-4 text-start">
                            <label className="form-label fw-bold small mb-2" style={{ color: 'var(--text-main)' }}>Email Address</label>
                            <input 
                                type="email" 
                                className="form-control p-3 shadow-none login-input" 
                                placeholder="name@company.com" 
                                style={{ borderRadius: '12px' }} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>
                        <div className="mb-5 text-start">
                            <label className="form-label fw-bold small mb-2" style={{ color: 'var(--text-main)' }}>Password</label>
                            <input 
                                type="password" 
                                className="form-control p-3 shadow-none login-input" 
                                placeholder="Enter your password" 
                                style={{ borderRadius: '12px' }} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                        </div>

                        <motion.button 
                            whileTap={{ scale: 0.96 }} 
                            type="submit" 
                            disabled={loading}
                            className="btn w-100 p-3 fw-bold shadow-sm" 
                            style={{ 
                                borderRadius: '12px', backgroundColor: 'var(--accent)', 
                                color: '#fff', border: 'none', fontSize: '1.1rem' 
                            }}
                        >
                            {loading ? "AUTHENTICATING..." : "LOGIN"}
                        </motion.button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;