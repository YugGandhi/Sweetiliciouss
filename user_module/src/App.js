  // src/App.js

  import React, { useState } from 'react';

  import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Use Routes instead of Switch
  import UserModule from './components/UserModule';
  import RegistrationForm from './components/RegistrationForm';
  import "./style.css";
    import HomePage from './components/HomePage';
    import LoginPage from './components/LoginPage';

  const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleLogout = () => {
      setIsLoggedIn(false); // Change to setIsLoggedIn(false) for logout
    };

    const handleLogin = () => {
      setIsLoggedIn(true); // Function to handle login
    };

    return (
      
      <Router>
        <div>
          {/* <h1>Welcome to Sweetilicious</h1> */}
          <Routes>
            <Route path="/" element={<RegistrationForm onLogin={handleLogin} />} />
            <Route path="/home" element={<HomePage />} /> {/* Add the Home Page route */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/user" element={<UserModule isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
          </Routes>
        </div>
      </Router>
    );
  };

  export default App;