import React, { useState, useEffect } from "react";
import "../styles/Navbar.css"; 
import mainLogo from "../assets/Sweetliciouss_logo.png"; 
import headerLogo from "../assets/Sweetlicious_logo_2.png";
import { FaShoppingCart, FaUserCircle } from "react-icons/fa"; 
import RegistrationForm from "../pages/RegistrationForm";
import LoginPage from "../pages/LoginPage";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

const Navbar = ({ onLogout }) => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { cartItems } = useCart();

  // Calculate total items in cart
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Update user whenever login happens
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
    window.dispatchEvent(new Event("userUpdated")); // Notify other components
    setIsLoginOpen(false);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      window.dispatchEvent(new Event("userUpdated"));
    }
    setIsDropdownOpen(false); // Close dropdown on logout
  };

  // Close dropdown when clicking outside
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
            <Link to="/">
              <img src={mainLogo} alt="Sweetiliciouss Logo" className="main-logo" />
              <img src={headerLogo} alt="Sweetiliciouss Header" className="header-logo" />
            </Link>
          </div>

          {/* Navigation Links */}
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><a href="#products">Products</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>

          {/* Right Section */}
          <div className="right-section">
            <Link to="/cart" className="cart-icon-container">
              <FaShoppingCart size={24} />
              {cartItemCount > 0 && (
                <span className="cart-count">{cartItemCount}</span>
              )}
            </Link>

            {user ? (
              <div className="profile-container">
                {/* Profile Icon */}
                <FaUserCircle 
                  className="profile-icon" 
                  size={32} 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                />

                {/* Dropdown (Only Visible When isDropdownOpen is True) */}
                {isDropdownOpen && (
                  <div className="profile-dropdown">
                    <p className="user-name">{user.fullName}</p>
                    <p className="user-email">{user.email}</p>
                    <Link to="/orders" className="dropdown-link">View Orders</Link>
                    {user.isAdmin && (
                      <Link to="/admin" className="admin-link">Admin Dashboard</Link>
                    )}
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
