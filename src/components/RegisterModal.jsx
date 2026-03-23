import React, { useState, useEffect } from 'react';
import { Button, Form, Row, Col, Card, Container, InputGroup } from 'react-bootstrap';
import { Eye, EyeSlash } from 'react-bootstrap-icons';
import axios from 'axios';
import Swal from 'sweetalert2';
import "../App.css";

const RegisterForm = () => {
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
                confirmButtonColor: '#007bff'
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

    return (
        <Container className="d-flex justify-content-center align-items-center min-vh-100 py-5">
            <Card className="border-0 p-4 glow-card-blue" style={{ maxWidth: '650px', width: '100%' }}>
                <Card.Body>
                    <div className="text-center mb-4">
                        <h2 className="fw-bold" style={{ color: '#2c3e50', letterSpacing: '-0.5px' }}>Create Account</h2>
                        <p className="text-muted small">SecureLaw Management System</p>
                    </div>

                    <Form onSubmit={handleSubmit}>
                     
                        <Form.Group className="mb-4">
                            <Form.Label className="small fw-bold text-secondary text-uppercase ms-1">Full Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="fullName"
                                className="modern-input"
                                value={formData.fullName}
                                placeholder="Enter your full name"
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </Form.Group>

              
                        <Form.Group className="mb-4">
                            <Form.Label className="small fw-bold text-secondary text-uppercase ms-1">Work Email Address</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                className="modern-input"
                                value={formData.email}
                                placeholder="name@gmail.com"
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </Form.Group>

                        <Row className="mb-4">
                       
                            <Col md={6} className="mb-4 mb-md-0">
                                <Form.Label className="small fw-bold text-secondary text-uppercase ms-1">Password</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        className="modern-input border-end-0"
                                        value={formData.password}
                                        placeholder="••••••••"
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                    <InputGroup.Text 
                                        className="bg-light border-start-0" 
                                        style={{ cursor: 'pointer', borderRadius: '0 12px 12px 0', border: '1.5px solid #e9ecef' }}
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                                    </InputGroup.Text>
                                </InputGroup>
                            </Col>

                           
                            <Col md={6}>
                                <Form.Label className="small fw-bold text-secondary text-uppercase ms-1">Confirm Password</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        className={`modern-input border-end-0 ${passwordError ? 'border-danger' : ''}`}
                                        value={formData.confirmPassword}
                                        placeholder="••••••••"
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                    <InputGroup.Text 
                                        className={`bg-light border-start-0 ${passwordError ? 'border-danger' : ''}`} 
                                        style={{ cursor: 'pointer', borderRadius: '0 12px 12px 0', border: '1.5px solid #e9ecef' }}
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
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
                            <Form.Label className="small fw-bold text-secondary text-uppercase ms-1">Professional Role</Form.Label>
                            <Form.Select
                                name="role"
                                className="modern-input"
                                value={formData.role}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            >
                                <option value="JUNIOR_LAWYER">Junior Lawyer</option>
                                <option value="SENIOR_LAWYER">Senior Lawyer</option>
                            </Form.Select>
                        </Form.Group>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-100 btn-register"
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Processing...
                                </>
                            ) : 'Register Now'}
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default RegisterForm;