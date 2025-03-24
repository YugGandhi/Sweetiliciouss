import React, { useState, useEffect } from "react";
import "../styles/Navbar.css"; 
import mainLogo from "../assets/Sweetliciouss_logo.png"; 
import headerLogo from "../assets/Sweetlicious_logo_2.png";
import { FaShoppingCart, FaUserCircle } from "react-icons/fa"; 
import RegistrationForm from "../pages/RegistrationForm";
import LoginPage from "../pages/LoginPage";

const Navbar = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // ✅ State for dropdown

  // ✅ Update user whenever login happens
  useEffect(() => {
    const updateUser = () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      setUser(storedUser);
    };

    updateUser(); // Run when component mounts
    window.addEventListener("userUpdated", updateUser); // Listen for login events

    return () => window.removeEventListener("userUpdated", updateUser); // Cleanup event listener
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    window.dispatchEvent(new Event("userUpdated")); // ✅ Notify other components
    setIsLoginOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setIsDropdownOpen(false); // Close dropdown on logout
  };

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".profile-dropdown") && !event.target.closest(".profile-icon")) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          {/* Logo Section */}
          <div className="logo-section">
            <img src={mainLogo} alt="Sweetiliciouss Logo" className="main-logo" />
            <img src={headerLogo} alt="Sweetiliciouss Header" className="header-logo" />
          </div>

          {/* Navigation Links */}
          <ul className="nav-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#products">Products</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>

          {/* Right Section */}
          <div className="right-section">
            <div className="cart-icon">
              <FaShoppingCart size={24} />
            </div>

            {user ? (
              <div className="profile-container">
                {/* ✅ Profile Icon */}
                <FaUserCircle 
                  className="profile-icon" 
                  size={32} 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                />

                {/* ✅ Dropdown (Only Visible When isDropdownOpen is True) */}
                {isDropdownOpen && (
                  <div className="profile-dropdown">
                    <p className="user-name">{user.fullName}</p>
                    <p className="user-email">{user.email}</p>
                    <button className="logout-btn" onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button className="auth-btn" onClick={() => setIsLoginOpen(true)}>Sign In</button>
                <button className="auth-btn register" onClick={() => setIsRegisterOpen(true)}>Register</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Modals */}
      <LoginPage isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onLogin={handleLogin} />
      <RegistrationForm isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
    </>
  );
};

export default Navbar;
