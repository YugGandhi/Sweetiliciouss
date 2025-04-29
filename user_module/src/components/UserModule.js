// src/components/UserModule.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import './UserModule.css'; // Importing CSS for styling
import RegistrationForm from './RegistrationForm'; // Import the RegistrationForm component

const UserModule = ({ onLogout, isLoggedIn }) => {
  
  const [activeSection, setActiveSection] = useState('orderPlaced');
  const navigate = useNavigate(); // Initialize useNavigate

  const renderContent = () => {
    if (!isLoggedIn) {
      return <RegistrationForm onLogin={onLogout} />; // Show registration form if not logged in
    }

    switch (activeSection) {
      case 'orderPlaced':
        return <div>Order Placed Content</div>;
      case 'sweetDetails':
        return <div>Sweet Details Content</div>;
      case 'successfulOrders':
        return <div>Successful Orders Content</div>;
      case 'profit':
        return <div>Profit Content</div>;
      case 'reviews':
        return <div>Reviews Content</div>;
      default:
        return <div>Select a section</div>;
    }
  };

  return (
    <div className="user-module">
      <div className="sidebar">
        {isLoggedIn && (
          <>
            <button onClick={() => setActiveSection('orderPlaced')}>Order Placed</button>
            <button onClick={() => setActiveSection('sweetDetails')}>Sweet Details</button>
            <button onClick={() => setActiveSection('profit')}>Profit</button>
            <button onClick={() => setActiveSection('successfulOrders')}>Successful Orders</button>
            <button onClick={() => setActiveSection('reviews')}>Reviews</button>
            <button onClick={onLogout}>Logout</button> {/* Logout button */}
          </>
        )}
        {/* <button onClick={() => navigate('/register')}>Register</button> Button to navigate to registration */}
      </div>
      <div className="content">
        {renderContent()}
      </div>
    </div>
  );
};
export default UserModule; 