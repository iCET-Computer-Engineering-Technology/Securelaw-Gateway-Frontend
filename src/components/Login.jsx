import React, { useState } from 'react';
import axios from 'axios';


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
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

            console.log("Login Success & Log Created:", response.data);

            
            alert("Success! Login data saved to database.");

        } catch (error) {
            console.error("Login Error:", error);
            alert("Invalid email or password! Please try again.");
        }
    };

    return (
        <div className="container d-flex align-items-center justify-content-center vh-100" style={{ backgroundColor: '#f0f2f5' }}>
            <div className="card p-4 shadow-lg text-center border-0" style={{ width: '450px', borderRadius: '30px' }}>
                <div className="card-body">
                    <h2 className="mb-2 fw-bold" style={{ color: '#000000', whiteSpace: 'nowrap', fontSize: '1.8rem' }}>
                        SecureLaw AI Gateway
                    </h2>
                    <p className="mb-4 fw-medium" style={{ color: '#000000' }}>Welcome Back</p>
                    
                    <form onSubmit={handleLogin}>
                        <div className="mb-3">
                            <input 
                                type="email" 
                                className="form-control p-3 shadow-sm" 
                                placeholder="Email"
                                style={{ borderRadius: '15px', border: '1px solid #cfe2ff' }}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <input 
                                type="password" 
                                className="form-control p-3 shadow-sm" 
                                placeholder="Password"
                                style={{ borderRadius: '15px', border: '1px solid #cfe2ff' }}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="btn btn-primary w-100 p-3 fw-bold shadow-sm"
                            style={{ borderRadius: '15px', backgroundColor: '#007bff', fontSize: '1.1rem' }}
                        >
                            LOGIN
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;