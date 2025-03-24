import React from "react";
import "../styles/Footer.css";
import footerBg from "../assets/Footer_bg1.png";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaFacebook, FaInstagram } from "react-icons/fa";
import logo from "../assets/Sweetliciouss_logo.png";
import logoSecond from "../assets/Sweetlicious_logo_2.png";

const Footer = () => {
  return (
    <footer id="contact" className="footer" style={{ backgroundImage: `url(${footerBg})` }}>
      <div className="footer-content">
        {/* Website Logo */}
        <div className="footer-logo">
          <img src={logo} alt="Sweetiliciouss Logo" />
          <img src={logoSecond} alt="Sweetiliciouss Secondary Logo" className="second-logo" />
        </div>

        {/* Quick Links */}
        <div className="footer-section links">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#products">Products</a></li>
            <li><a href="#about">About Us</a></li>
          </ul>
        </div>

        {/* Services */}
        <div className="footer-section services">
          <h3>Our Services</h3>
          <ul>
            <li>Custom Orders</li>
            <li>Bulk Orders</li>
            <li>Event Catering</li>
          </ul>
        </div>

        {/* Contact Us */}
        <div className="footer-section contact">
          <h3>Contact Us</h3>
          <p><FaMapMarkerAlt /> 29, Vaishali Row house,Surat</p>
          <p><FaPhoneAlt /> +91 96017 43567</p>
          <p><FaEnvelope /> nitinrgandhi@gmail.com</p>

          {/* Social Media Icons */}
          <div className="social-icons">
            <a href="https://www.facebook.com/share/15tzdAfm7R/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">
              <FaFacebook className="social-icon" />
            </a>
            <a href="https://www.instagram.com/sweetiliciouss_official?igsh=NjBiN3R6Z3U5dGxz" target="_blank" rel="noopener noreferrer">
              <FaInstagram className="social-icon" />
            </a>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="footer-bottom">
        <p>© 2025 Sweetiliciouss. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
