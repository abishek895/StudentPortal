import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Navbar/navbar.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Swal from 'sweetalert2';

const Navbar = ({ onLogout, pendingRequestsCount }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState(null); // Store user data
  const navigate = useNavigate();

  // Get the user data from localStorage when the component mounts
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData); // Parse the data from localStorage
      setUser(parsedUser); // Set user state
    }
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure you want to log out?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, log out!',
    }).then((result) => {
      if (result.isConfirmed) {
        // Remove user data and token from localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        onLogout(); // Notify the parent that the user has logged out
        navigate('/'); // Redirect to the login page
      }
    });
  };

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev); // Toggle collapse state
  };

  useEffect(() => {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      if (isCollapsed) {
        mainContent.classList.add('shift-left');
        mainContent.classList.remove('full-width');
      } else {
        mainContent.classList.remove('shift-left');
        mainContent.classList.add('full-width');
      }
    }
  }, [isCollapsed]);

  return (
    <div className="App">
      <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Toggle Button */}
        <button 
          className="sidebar-toggle-btn" 
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <i className="fas fa-bars"></i>
        </button>

        {/* Profile Section */}
        {user ? (
          <div className="profile-info">
            <i className="fas fa-user profile-icon"></i> {/* Default user icon */}
            <span className="user-name">{user.firstName}</span> {/* Display first name */}
            <span className="user-role">{user.roleName}</span> {/* Display role */}
          </div>
        ) : (
          <div className="profile-info">
            <i className="fas fa-user profile-icon"></i>
            <span className="user-name">Loading...</span>
            <span className="user-role">Loading...</span>
          </div>
        )}

        {/* Sidebar Links */}
        <ul className="sidebar-links">
          <li>
            <button onClick={() => navigate('/users')} className="nav-item">
              <i className="fas fa-users"></i>
              <span className="nav-text">Students</span>
            </button>
          </li>
          <li>
            <button onClick={() => navigate('/view-marks')} className="nav-item">
              <i className="fas fa-chart-bar"></i>
              <span className="nav-text">View Marks</span>
            </button>
          </li>
          <li>
            <button onClick={() => navigate('/teacher-leave-requests')} className="nav-item">
              <i className="fas fa-clipboard-list"></i>
              <span className="nav-text">
                Leave Requests
                {pendingRequestsCount > 0 && (
                  <span className="pending-count">({pendingRequestsCount})</span>
                )}
              </span>
            </button>
          </li>
        </ul>

        {/* Logout Button */}
        <div className="logout-button">
          <button onClick={handleLogout} className="logout-btn">
            <i className="fas fa-sign-out-alt"></i>
            <span className="nav-text">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
