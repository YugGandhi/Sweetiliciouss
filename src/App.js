import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage"; // ✅ Single dynamic product page
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegistrationForm";
import AdminDashboard from "./pages/AdminDashboard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Function to fetch user from localStorage
    const fetchUser = () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      console.log("🔍 Stored User in App.js:", storedUser);
      setUser(storedUser);
    };

    // Call it once on mount
    fetchUser();

    // ✅ Listen for changes to localStorage (for login/logout updates)
    window.addEventListener("userUpdated", fetchUser);

    return () => {
      window.removeEventListener("userUpdated", fetchUser);
    };
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    window.dispatchEvent(new Event("userUpdated")); // ✅ Ensure App.js updates after login
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("userUpdated")); // ✅ Ensure App.js updates after logout
  };

  const isAdmin = user?.isAdmin;

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />

      <Routes>
        <Route path="/" element={<Home onLogout={handleLogout} />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ✅ Dynamic Product Page */}
        <Route path="/product/:id" element={<ProductPage />} />

        {/* ✅ Admin Route with Correct Redirection */}
        <Route
          path="/admin"
          element={isAdmin ? <AdminDashboard onLogout={handleLogout} /> : <Navigate to="/" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
