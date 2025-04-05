import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/LoginPage.css";
import { auth } from '../services/api';

const LoginPage = ({ isOpen, onClose, onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await auth.login({ email, password });
      console.log("Login response:", response);
      
      const { data } = response;
      
      if (data && data.token) {
        localStorage.setItem("token", data.token);
        
        // The API returns user data in data.user, not at the root level
        const userData = {
          email: data.user?.email,
          fullName: data.user?.fullName,
          isAdmin: data.user?.isAdmin,
          id: data.user?.id || data.user?._id
        };
        
        console.log("User data for login:", userData);
        
        // Call the onLogin callback
        onLogin(userData);
        
        // Show success notification
        toast.success("Login Successful!");

        // Close the modal
        onClose();
        
        // Navigate after 1 second if admin
        if (userData.isAdmin) {
          setTimeout(() => {
            navigate("/admin");
          }, 1000);
        }
      } else {
        setError("Invalid response from server");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.response?.data?.message || "Login failed. Please check your credentials.");
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="modal-overlay show" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2 className="modal-title">Login</h2>
        <p className="modal-subtitle">Access your account & manage orders.</p>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              type="email"
              id="login-email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              type="password"
              id="login-password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;