import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import { toast } from "react-toastify"; // ✅ Import Toastify
import "../styles/LoginPage.css"; 

const LoginPage = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Initialize navigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("✅ Frontend Login Response:", data); // Debugging

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify({ email: data.email, fullName: data.fullName, isAdmin: data.isAdmin }));

        window.dispatchEvent(new Event("userUpdated")); // Ensure Navbar updates

        // ✅ Show success toast notification
        toast.success("Login Successful! 🎉");

        // ✅ Close the login popup after 1 second
        setTimeout(() => {
          onClose();
        }, 1000);

        // ✅ Ensure correct redirection
        setTimeout(() => {
          if (data.isAdmin) {
            navigate("/admin");
          } else {
            navigate("/");
          }
        }, 1000);
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (error) {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className={`modal-overlay ${isOpen ? "show" : "hide"}`} onClick={onClose}>
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
            />
          </div>

          <button type="submit" className="submit-button">Login</button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;