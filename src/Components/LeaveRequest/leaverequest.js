import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Button, Typography } from '@mui/material';
import swal from 'sweetalert2';
import { LEAVE_REQUEST_URL, NOTIFY_STUDENT_URL } from '../Urls/apiurls'; 
import DataGrid, { Column, Pager, Paging } from 'devextreme-react/data-grid';
import 'devextreme/dist/css/dx.light.css';
import '../LeaveRequest/leaverequest.css';

const LeaveRequests = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const response = await axios.get(`${LEAVE_REQUEST_URL}/teacher`);
        console.log("Fetched leave requests:", response.data);

        // Sort requests to show pending requests at the top
        const sortedRequests = response.data.sort((a, b) => {
          if (a.status === 'Pending' && b.status !== 'Pending') return -1;
          if (a.status !== 'Pending' && b.status === 'Pending') return 1;
          return 0;
        });

        setLeaveRequests(sortedRequests);
      } catch (error) {
        console.error('Error fetching leave requests:', error);
      }
    };

    fetchLeaveRequests();
  }, []);

  const handleResponse = async (id, action) => {
    const confirmationMessage = `Are you sure you want to ${action} this leave request?`;
    
    const result = await swal.fire({
      title: 'Confirm Action',
      text: confirmationMessage,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    });
  
    if (result.isConfirmed) {
      try {
        const url = action === 'Approved' 
            ? `${LEAVE_REQUEST_URL}/${id}/approve` 
            : `${LEAVE_REQUEST_URL}/${id}/reject`;

        const response = await axios.post(url);

        if (response.status === 204) {
          setLeaveRequests((prev) => 
            prev.map((request) => 
              request.id === id ? { ...request, status: action } : request
            ).sort((a, b) => {
              if (a.status === 'Pending' && b.status !== 'Pending') return -1;
              if (a.status !== 'Pending' && b.status === 'Pending') return 1;
              return 0;
            })
          );

          await notifyStudent(id, action);
          swal.fire('Success!', `Leave request has been ${action}ed.`, 'success');
        }
      } catch (error) {
        console.error('Error updating leave request:', error);
        swal.fire('Error!', 'There was a problem processing your request.', 'error');
      }
    }
  };

  const notifyStudent = async (requestId, action) => {
    try {
      const notificationMessage = `Your leave request has been ${action === 'Approved' ? 'accepted' : 'rejected'}.`;
      const studentId = leaveRequests.find(request => request.id === requestId).studentid;

      await axios.post(NOTIFY_STUDENT_URL, {
        studentId,
        message: notificationMessage,
      });
    } catch (error) {
      console.error('Error sending notification to student:', error);
    }
  };

  const pendingCount = leaveRequests.filter(request => request.status === 'Pending').length;

  return (
    <Container>
      <Typography className='title' variant="h4" gutterBottom>
        LEAVE REQUESTS
      </Typography>
      <Typography variant="subtitle1" style={{ marginBottom: '16px' }}>
        Pending Requests: {pendingCount}
      </Typography>

      <DataGrid
        dataSource={leaveRequests}
        showBorders={true}
        rowAlternationEnabled={true}
        columnAutoWidth={true}
        filterRow={{ visible: true }}
        allowColumnReordering={true}
        allowColumnResizing={true}
      >
        <Column dataField="firstname" caption="Name" />
        <Column dataField="from" caption="From" />
        <Column dataField="till" caption="Till" />
        <Column dataField="reason" caption="Reason" />
        <Column 
          caption="Actions"
          cellRender={({ data }) => (
            <>
              {data.status === 'Approved' || data.status === 'Rejected' ? (
                <Typography variant="body2" color="textSecondary">
                  {data.status}
                </Typography>
              ) : (
                <>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleResponse(data.id, 'Approved')}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleResponse(data.id, 'Rejected')}
                  >
                    Reject
                  </Button>
                </>
              )}
            </>
          )}
        />
        <Paging defaultPageSize={10} />
        <Pager showPageSizeSelector showInfo />
      </DataGrid>

      <div>
        {leaveRequests.filter(request => request.status === 'Pending').map(request => (
          <div key={request.id}>
            {/* Additional content for pending requests can go here */}
          </div>
        ))}
      </div>
    </Container>
  );
};

export default LeaveRequests;
