import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import StudentTable from './Components/StudentTable/studenttable';
import EditStudent from './Components/EditStudent/editstudent';
import ViewMarks from './Components/ViewMarks/viewmark';
import TeacherNavbar from './Components/Navbar/navbar'; 
import StudentNavbar from './Components/StudentNavbar/studentnavbar';
import Login from './Components/LoginPage/login';
import StudentDetail from './Components/StudentDetails/studentdetail';
import LeaveRequests from './Components/LeaveRequest/leaverequest';
import './App.css';

const PrivateRoute = ({ children, isLoggedIn }) => {
  return isLoggedIn ? children : <Navigate to="/" replace />;
};

const App = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('authToken'));
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || 'student');
  const location = useLocation();
  
  const handleLogin = (role) => {
    setIsLoggedIn(true);
    const normalizedRole = role.toLowerCase();
    setUserRole(normalizedRole);
    localStorage.setItem('authToken', 'token');
    localStorage.setItem('userRole', normalizedRole);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    navigate('/', { replace: true });
  };

  const isLoginPage = location.pathname === '/';

  return (
    <div className="App">
      {!isLoginPage && (
        userRole === 'teacher' ? <TeacherNavbar onLogout={handleLogout} /> : <StudentNavbar onLogout={handleLogout} />
      )}
      <div className={`main-content ${isLoginPage ? 'full-width' : ''}`}>
        <main>
          <Routes>
            <Route path="/" element={<Login onLogin={handleLogin} />} />
            <Route path="/users" element={<PrivateRoute isLoggedIn={isLoggedIn}><StudentTable /></PrivateRoute>} />
            <Route path="/edit/:id" element={<PrivateRoute isLoggedIn={isLoggedIn}><EditStudent /></PrivateRoute>} />
            <Route path="/view-marks" element={<PrivateRoute isLoggedIn={isLoggedIn}><ViewMarks /></PrivateRoute>} />
            <Route path="/teacher-leave-requests" element={<PrivateRoute isLoggedIn={isLoggedIn}><LeaveRequests /></PrivateRoute>} />
            <Route path="/students/:studentId" element={<PrivateRoute isLoggedIn={isLoggedIn}><StudentDetail /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
