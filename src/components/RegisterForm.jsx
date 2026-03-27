import React, { useState, useEffect } from 'react';
import { Button, Form, Row, Col, Card, Container, InputGroup } from 'react-bootstrap';
import { Eye, EyeSlash } from 'react-bootstrap-icons';
import { X } from 'lucide-react'; 
import axios from 'axios';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion'; // <-- Framer Motion imported here


const RegisterForm = ({ onClose }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'JUNIOR_LAWYER'
    });

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); 
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        if (formData.confirmPassword !== '' && formData.password !== formData.confirmPassword) {
            setPasswordError('Invalid Password: Passwords do not match!');
        } else {
            setPasswordError('');
        }
    }, [formData.password, formData.confirmPassword]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            Swal.fire({
                icon: 'warning',
                title: 'Password Mismatch',
                text: 'The passwords you entered do not match!',
                confirmButtonColor: 'var(--accent)'
            });
            return;
        }

        const submitData = {
            name: formData.fullName.trim(),
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            role: formData.role
        };

        setLoading(true);

        try {
            const response = await axios.post('http://localhost:8080/api/v1/auth/register', submitData);
            setLoading(false);

            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: response.data.message || 'Account created successfully!',
                timer: 2500,
                showConfirmButton: false
            });

            setFormData({ fullName: '', email: '', password: '', confirmPassword: '', role: 'JUNIOR_LAWYER' });
            
            // Optionally close the modal automatically on success:
            // if (onClose) onClose();

        } catch (error) {
            setLoading(false);
            let errorContent = 'Registration failed. Please check the details.';

            if (error.response && error.response.data) {
                const data = error.response.data;
                if (typeof data === 'object' && !data.message) {
                    errorContent = Object.values(data).map(msg => `• ${msg}`).join('<br/>');
                } else {
                    errorContent = data.message || data.error || errorContent;
                }
            }

            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                html: `<div style="text-align: left; font-size: 14px; line-height: 1.6;">${errorContent}</div>`,
                confirmButtonColor: '#dc3545'
            });
        }
    };

    const inputStyle = { 
        backgroundColor: 'var(--bg-input)', 
        color: 'var(--text-main)', 
        border: '1px solid var(--border)' 
    };
    
    const optionStyle = {
        backgroundColor: 'var(--bg-card)', 
        color: 'var(--text-main)'
    };

    return (
        <Container className="d-flex justify-content-center align-items-center py-5">
            {/* NEW: Framer Motion wrapper for the bouncy iOS entrance */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                style={{ width: '100%', maxWidth: '650px' }}
            >
                <Card 
                    className="border-0 p-4 position-relative"
                    style={{ 
                        width: '100%',
                        background: 'var(--bg-glass)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        border: '1px solid var(--border)',
                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                    }}
                >
                    {/* The Close Button inside the card */}
                    {onClose && (
                        <button 
                            type="button"
                            onClick={onClose}
                            className="btn position-absolute d-flex align-items-center justify-content-center p-0"
                            style={{
                                top: '15px',
                                right: '15px',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'var(--bg-pill)',
                                color: 'var(--text-main)',
                                border: '1px solid var(--border)',
                                transition: 'all 0.2s ease',
                                zIndex: 10
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            title="Close"
                        >
                            <X size={18} />
                        </button>
                    )}

                    <Card.Body>
                        <div className="text-center mb-4">
                            <h2 className="fw-bold" style={{ color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Create Account</h2>
                            <p className="text-muted small">SecureLaw Management System</p>
                        </div>

                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-4">
                                <Form.Label className="small fw-bold text-uppercase ms-1" style={{ color: 'var(--text-muted)' }}>Full Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="fullName"
                                    className="shadow-none"
                                    style={inputStyle}
                                    value={formData.fullName}
                                    placeholder="Enter your full name"
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label className="small fw-bold text-uppercase ms-1" style={{ color: 'var(--text-muted)' }}>Work Email Address</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    className="shadow-none"
                                    style={inputStyle}
                                    value={formData.email}
                                    placeholder="name@gmail.com"
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                />
                            </Form.Group>

                            <Row className="mb-4">
                                <Col md={6} className="mb-4 mb-md-0">
                                    <Form.Label className="small fw-bold text-uppercase ms-1" style={{ color: 'var(--text-muted)' }}>Password</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            className="shadow-none"
                                            style={{...inputStyle, borderRight: 'none', borderRadius: '12px 0 0 12px'}}
                                            value={formData.password}
                                            placeholder="••••••••"
                                            onChange={handleChange}
                                            required
                                            disabled={loading}
                                        />
                                        <InputGroup.Text 
                                            className="shadow-none" 
                                            style={{ 
                                                cursor: 'pointer', 
                                                borderRadius: '0 12px 12px 0', 
                                                background: 'var(--bg-input)',
                                                color: 'var(--text-main)',
                                                border: '1px solid var(--border)',
                                                borderLeft: 'none'
                                            }}
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeSlash size={18} style={{ color: 'var(--text-main)' }} /> : <Eye size={18} style={{ color: 'var(--text-main)' }} />}
                                        </InputGroup.Text>
                                    </InputGroup>
                                </Col>

                                <Col md={6}>
                                    <Form.Label className="small fw-bold text-uppercase ms-1" style={{ color: 'var(--text-muted)' }}>Confirm Password</Form.Label>
                                    <InputGroup>
                                        <Form.Control
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            className={`shadow-none ${passwordError ? 'border-danger' : ''}`}
                                            style={{...inputStyle, borderRight: 'none', borderRadius: '12px 0 0 12px'}}
                                            value={formData.confirmPassword}
                                            placeholder="••••••••"
                                            onChange={handleChange}
                                            required
                                            disabled={loading}
                                        />
                                        <InputGroup.Text 
                                            className={`shadow-none ${passwordError ? 'border-danger' : ''}`} 
                                            style={{ 
                                                cursor: 'pointer', 
                                                borderRadius: '0 12px 12px 0', 
                                                background: 'var(--bg-input)',
                                                color: 'var(--text-main)',
                                                border: '1px solid var(--border)',
                                                borderLeft: 'none'
                                            }}
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <EyeSlash size={18} style={{ color: 'var(--text-main)' }} /> : <Eye size={18} style={{ color: 'var(--text-main)' }} />}
                                        </InputGroup.Text>
                                    </InputGroup>
                                    {passwordError && (
                                        <div className="text-danger small mt-1 fw-bold ms-1" style={{ fontSize: '11px' }}>
                                            {passwordError}
                                        </div>
                                    )}
                                </Col>
                            </Row>

                            <Form.Group className="mb-5">
                                <Form.Label className="small fw-bold text-uppercase ms-1" style={{ color: 'var(--text-muted)' }}>Professional Role</Form.Label>
                                <Form.Select
                                    name="role"
                                    className="shadow-none"
                                    style={inputStyle}
                                    value={formData.role}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                >
                                    <option value="JUNIOR_LAWYER" style={optionStyle}>Junior Lawyer</option>
                                    <option value="SENIOR_LAWYER" style={optionStyle}>Senior Lawyer</option>
                                </Form.Select>
                            </Form.Group>

                            {/* iOS Squish Animation on the Register Button */}
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                type="submit"
                                disabled={loading}
                                className="w-100 btn px-4"
                                style={{ 
                                    backgroundColor: 'var(--accent)', 
                                    color: '#fff', 
                                    border: '1px solid var(--border)',
                                    borderRadius: '12px',
                                    fontWeight: '600',
                                    padding: '12px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Processing...
                                    </>
                                ) : 'Register Now'}
                            </motion.button>
                        </Form>
                    </Card.Body>
                </Card>
            </motion.div>

            <style>{`
                .shadow-none:focus {
                    background-color: var(--bg-pill) !important;
                    color: var(--text-main) !important;
                    border-color: var(--accent) !important;
                    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.25) !important;
                }
                
                .btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                    filter: brightness(1.1);
                }
            `}</style>
        </Container>
    );
};

export default RegisterForm;