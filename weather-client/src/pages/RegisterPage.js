// src/pages/RegisterPage.js
import React, { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';

// ---
const styles = `
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; }
    
    .auth-container {
        min-height: 100vh;
        background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
    }

    .auth-card {
        background: rgba(255, 255, 255, 0.1);
        padding: 40px;
        border-radius: 20px;
        backdrop-filter: blur(10px);
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        border: 1px solid rgba(255, 255, 255, 0.1);
        width: 100%;
        max-width: 400px;
        text-align: center;
        color: #fff;
    }

    .auth-card h2 {
        margin-bottom: 20px;
        font-size: 28px;
        font-weight: 600;
    }

    .form-group {
        margin-bottom: 15px;
        text-align: left;
    }

    .form-input {
        width: 100%;
        padding: 12px 15px;
        border-radius: 30px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(0, 0, 0, 0.2);
        color: #fff;
        font-size: 16px;
        outline: none;
        transition: all 0.3s;
    }

    .form-input::placeholder { color: rgba(255, 255, 255, 0.6); }
    .form-input:focus { background: rgba(0, 0, 0, 0.4); border-color: rgba(255, 255, 255, 0.5); }

    .submit-btn {
        width: 100%;
        padding: 12px;
        border-radius: 30px;
        border: none;
        background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%); 
        color: #fff;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
        margin-top: 10px;
    }

    .submit-btn:hover { 
        transform: translateY(-2px); 
        box-shadow: 0 5px 15px rgba(79, 172, 254, 0.4); 
    }

    .auth-footer { margin-top: 20px; font-size: 14px; opacity: 0.8; }
    .auth-link { color: #00f2fe; text-decoration: none; font-weight: bold; margin-left: 5px; }
    .auth-link:hover { text-decoration: underline; color: #4facfe; }
`;

const RegisterPage = () => {
    let { registerUser } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        username: '', email: '', password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        registerUser(formData.username, formData.password, formData.email);
    };

    return (
        <div className="auth-container">
            <style>{styles}</style>

            <div className="auth-card">
                <img 
                    src="https://cdn-icons-png.flaticon.com/512/869/869869.png" 
                    alt="register-logo" 
                    width="60" 
                    style={{marginBottom: '10px'}}
                />
                <h2>Register</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input 
                            className="form-input"
                            type="text" 
                            name="username" 
                            placeholder="Username" 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <input 
                            className="form-input"
                            type="email" 
                            name="email" 
                            placeholder="Email (for password recovery)" 
                            onChange={handleChange} 
                        />
                    </div>
                    <div className="form-group">
                        <input 
                            className="form-input"
                            type="password" 
                            name="password" 
                            placeholder="Password" 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    <button type="submit" className="submit-btn">
                        ✨ Create 
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login" className="auth-link">Login now</Link></p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;