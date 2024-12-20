// src/Home.js
import React from 'react';
import { Container, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import '../HomePage/home.css';

const Home = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Navigate to the login page
    navigate('/login');
  };

  return (
    <Container className="home-container">
      {/* Hero Section */}
      <div className="hero-section">
        <Typography variant="h3" className="hero-title">
          Welcome to Our Educational Portal
        </Typography>
        <Typography variant="h6" className="hero-subtitle">
          Your gateway to learning and teaching.
        </Typography>
      </div>

      {/* Login Button */}
      <div className="login-button">
        <Button variant="contained" color="primary" onClick={handleLogin}>
          Log In
        </Button>
      </div>
    </Container>
  );
};

export default Home;
