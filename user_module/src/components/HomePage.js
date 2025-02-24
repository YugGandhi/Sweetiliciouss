// src/components/HomePage.js
import React from 'react';

import { Navigate, useNavigate } from 'react-router-dom';


const HomePage = () => {
    
    const navigate = useNavigate();

    const navigateToLogin = () => {
        navigate('/login');
    }
    return (
        <div>
            <h2>Welcome to the Home Page!</h2>
            <p>This is where users will land after registration.</p>
            <button onClick={navigateToLogin}>Go to Login Page</button>
        </div>
        
    );
};

export default HomePage; // Default export