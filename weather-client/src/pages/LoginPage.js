// src/pages/LoginPage.js
import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';

// --- CSS STYLES (Đồng bộ giao diện với HomePage) ---
const styles = `
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', sans-serif; }
    
    .auth-container {
        min-height: 100vh;
        background: linear-gradient(135deg, #0f2027, #203a43, #2c5364); /* Nền giống HomePage */
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
    }

    .auth-card {
        background: rgba(255, 255, 255, 0.1); /* Kính mờ */
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
        margin-bottom: 30px;
        font-size: 28px;
        font-weight: 600;
    }

    .form-group {
        margin-bottom: 20px;
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

    .form-input::placeholder {
        color: rgba(255, 255, 255, 0.6);
    }

    .form-input:focus {
        background: rgba(0, 0, 0, 0.4);
        border-color: rgba(255, 255, 255, 0.5);
    }

    .submit-btn {
        width: 100%;
        padding: 12px;
        border-radius: 30px;
        border: none;
        background: linear-gradient(to right, #4facfe 0%, #00f2fe 100%); /* Gradient xanh sáng */
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

    .auth-footer {
        margin-top: 20px;
        font-size: 14px;
        opacity: 0.8;
    }

    .auth-link {
        color: #4facfe;
        text-decoration: none;
        font-weight: bold;
        margin-left: 5px;
    }

    .auth-link:hover {
        text-decoration: underline;
        color: #00f2fe;
    }
`;

const LoginPage = () => {
    let { loginUser } = useContext(AuthContext);

    return (
        <div className="auth-container">
            <style>{styles}</style> {/* Nhúng CSS vào đây */}
            
            <div className="auth-card">
                {/* Icon mây trời trang trí */}
                <img 
                    src="https://cdn-icons-png.flaticon.com/512/1163/1163661.png" 
                    alt="logo" 
                    width="60" 
                    style={{marginBottom: '10px'}}
                />
                <h2>Log in</h2>
                
                <form onSubmit={loginUser}>
                    <div className="form-group">
                        <input 
                            className="form-input" 
                            type="text" 
                            name="username" 
                            placeholder="Tên đăng nhập" 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <input 
                            className="form-input" 
                            type="password" 
                            name="password" 
                            placeholder="Mật khẩu" 
                            required 
                        />
                    </div>
                    <button type="submit" className="submit-btn">
                        Go to Dashboard ➔
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Don't have an account? <Link to="/register" className="auth-link">Sign in</Link></p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;