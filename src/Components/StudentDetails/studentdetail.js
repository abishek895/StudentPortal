// src/Components/StudentDetails.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Badge,
} from '@mui/material';
import { DataGrid } from 'devextreme-react/data-grid';
import { Container } from '@mui/material';
import { API_BASE_URL, LEAVE_REQUEST_URL } from '../Urls/apiurls'; 
import axios from 'axios'; 
import 'devextreme/dist/css/dx.light.css';
import '../StudentDetails/studentdetail.css';
import StudentNavbar from '../StudentNavbar/studentnavbar'; 

const StudentDetails = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [leaveFromDate, setLeaveFromDate] = useState('');
  const [leaveTillDate, setLeaveTillDate] = useState('');
  const [reason, setReason] = useState('');
  const [leaveStatus, setLeaveStatus] = useState([]);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [errorStatus, setErrorStatus] = useState('');
  const [openStatusDialog, setOpenStatusDialog] = useState(false);

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Leave request status
  const [leaveRequestStatus, setLeaveRequestStatus] = useState(null);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/Students/${studentId}`);
        setStudent(response.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [studentId]);

  const handleRequestLeave = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setLeaveFromDate('');
    setLeaveTillDate('');
    setReason('');
  };

  const handleSubmitLeaveRequest = async () => {
    // Check if all fields are filled
    if (!leaveFromDate || !leaveTillDate || !reason) {
      setSnackbarMessage('Please fill out all fields.');
      setSnackbarOpen(true);
      return; // Exit early if validation fails
    }
  
    // Prepare leave request object
    const leaveRequest = {
      studentid: studentId,
      from: leaveFromDate,
      till: leaveTillDate,
      reason: reason,
    };
    
    try {
      const response = await axios.post(LEAVE_REQUEST_URL, leaveRequest);
      setLeaveRequestStatus(null); // Reset status on new request
      setSnackbarMessage('Leave request submitted successfully!');
      setSnackbarOpen(true);
      handleCloseDialog();
      await notifyTeacher(leaveRequest);
    } catch (error) {
      setSnackbarMessage('Error submitting leave request: ' + (error.response ? error.response.data : error.message));
      setSnackbarOpen(true);
    }
  };
  


  const notifyTeacher = async (leaveRequest) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/notifyTeacher`, leaveRequest);
    } catch (error) {
      console.error('Error notifying teacher:', error);
    }
  };

  const handleOpenStatusDialog = async () => {
    setLoadingStatus(true);
    setErrorStatus('');
    setOpenStatusDialog(true);
    
    try {
      const response = await axios.get(`${API_BASE_URL}/leaveRequest/${studentId}`);
      setLeaveStatus(response.data);
      setLeaveRequestStatus(response.data.status);
    } catch (error) {
      setErrorStatus(error.message);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
  };

  // Placeholder functions for calculations
  const calculateTotal = (marks) => {
    // Replace with actual logic
    return marks.maths + marks.science + marks.physics + marks.chemistry + marks.english;
  };

  const calculateCGPA = (total) => {
    // Replace with actual logic
    return total / 50; // Example calculation
  };

  const calculateGrade = (cgpa) => {
    // Replace with actual logic
    if (cgpa >= 9.5) return 'O';
    if (cgpa >= 9) return 'A+';
    if (cgpa >= 8.5) return 'A';
    if (cgpa >= 8) return 'B+';
    if (cgpa >= 7.5) return 'B';
    if (cgpa >=7) return 'c+';
    if (cgpa >= 6.5) return 'C';
    return 'RA';
  };

  // Placeholder for handleLogout
  const handleLogout = () => {
    // Implement logout functionality
    localStorage.removeItem('authToken');
    window.location.reload(); 
  };
  

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  const columns = [
    { dataField: 'semesterName', caption: 'Semester', width: 150 },
    { dataField: 'maths', caption: 'Maths', width: 90 },
    { dataField: 'science', caption: 'Science', width: 90 },
    { dataField: 'physics', caption: 'Physics', width: 90 },
    { dataField: 'chemistry', caption: 'Chemistry', width: 90 },
    { dataField: 'english', caption: 'English', width: 90 },
    { dataField: 'total', caption: 'Total', width: 90 },
    { dataField: 'cgpa', caption: 'CGPA', width: 90 },
    { dataField: 'grade', caption: 'Grade', width: 90 },
  ];

  const studentData = student.studentMarks?.map((marks) => {
    const total = calculateTotal(marks);
    const cgpa = calculateCGPA(total);
    const grade = calculateGrade(cgpa);
  
    return {
      semesterName: marks.semesterName || 'N/A',
      maths: marks.maths || 0,
      science: marks.science || 0,
      physics: marks.physics || 0,
      chemistry: marks.chemistry || 0,
      english: marks.english || 0,
      total: total,
      cgpa: cgpa,
      grade: grade,
    };
  }) || [];

  const leaveColumns = [
    { dataField: 'from', caption: 'Leave From', dataType: 'date', width: 100 },
    { dataField: 'till', caption: 'Leave Till', dataType: 'date', width: 100 },
    { dataField: 'status', caption: 'Status', width: 100 },
  ];

  const hasLeaveApplied = leaveStatus && leaveStatus.length > 0;

  return (
    <Container>
      <StudentNavbar 
        onLogout={handleLogout} 
        onOpenLeaveRequest={handleRequestLeave} 
        onOpenLeaveStatus={handleOpenStatusDialog}
      />
      <Box style={{ width: '100%', padding: '20px', display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Typography variant="h4" className="header">
          Student Details
        </Typography>

        <Card variant="outlined" style={{ marginBottom: '20px' }}>
          <CardContent>
            <Typography variant="h5">{student.firstname} {student.lastname}</Typography>
            <Typography>Email: {student.email}</Typography>
            <Typography>ID: {student.id}</Typography>
          </CardContent>
        </Card>

        <Box style={{ flex: 1 }}>
          <DataGrid
            dataSource={studentData}
            columns={columns}
            showBorders={true}
            className="data-grid"
            allowColumnReordering={true}
            allowColumnResizing={true}
            filterRow={{visible:true}}
          />
        </Box>

        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Request Leave</DialogTitle>
          <DialogContent>
            <TextField
              label="Leave From Date" 
              required
              type="date"
              fullWidth
              value={leaveFromDate}
              onChange={(e) => setLeaveFromDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              margin="normal"
            />
            <TextField
              label="Leave Till Date"
              required
              type="date"
              fullWidth
              value={leaveTillDate}
              onChange={(e) => setLeaveTillDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              margin="normal"
            />
            <TextField
              label="Reason for Leave"
              required
              fullWidth
              multiline
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">Cancel</Button>
            <Button onClick={handleSubmitLeaveRequest} color="primary">Submit</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={openStatusDialog} onClose={handleCloseStatusDialog}>
          <DialogTitle>Leave Status</DialogTitle>
          <DialogContent>
            {hasLeaveApplied ? (
              <DataGrid
                dataSource={leaveStatus}
                columns={leaveColumns}
                showBorders={true}
                allowColumnReordering={true}
                allowColumnResizing={true}
              />
            ) : (
              <Typography>No leave applied</Typography>
            )}
            {loadingStatus && <Typography>Loading...</Typography>}
            {/* {errorStatus && <Typography color="error">{errorStatus}</Typography>} */}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseStatusDialog} color="primary">Close</Button>
          </DialogActions>
        </Dialog>

        <Box className="button-container">
          {/* <Button 
            variant="outlined" 
            color="secondary" 
            className="back-button" 
            onClick={handleBack}
          >
            Back
          </Button> */}
          <Button 
            variant="contained" 
            color="primary" 
            className="request-leave-button" 
            onClick={handleRequestLeave}
          >
            Request Leave
          </Button>
          <Badge 
            color={leaveRequestStatus === 'accepted' ? 'success' : leaveRequestStatus === 'rejected' ? 'error' : 'default'}
            badgeContent={leaveRequestStatus ? leaveRequestStatus.charAt(0).toUpperCase() + leaveRequestStatus.slice(1) : null}
          >
            <Button 
              variant="contained" 
              color="secondary" 
              className="leave-status-button" 
              onClick={handleOpenStatusDialog}
            >
              Leave Status
            </Button>
          </Badge>
        </Box>

        {/* Snackbar for notifications */}
        <Snackbar
  open={snackbarOpen}
  autoHideDuration={1000}
  onClose={() => setSnackbarOpen(false)}
  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
>
  <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarMessage.includes('Please fill out') ? 'error' : 'success'}>
    {snackbarMessage}
  </Alert>
</Snackbar>

      </Box>
    </Container>
  );
};

export default StudentDetails;
