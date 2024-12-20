import React, { useState, useEffect } from 'react';
import '../StudentTable/studenttable.css'; // Ensure this points to the correct CSS file
import axios from 'axios';
import moment from 'moment';
import * as XLSX from 'xlsx';
import swal from 'sweetalert2';
import { 
  Container, 
  Button, 
  Typography, 
  Modal, 
  TextField, 
  Checkbox, 
  InputAdornment,
  Snackbar
} from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { DataGrid, Column, Pager, Paging, GroupPanel } from 'devextreme-react/data-grid';
import 'devextreme/dist/css/dx.light.css';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search'; 
import { STUDENT_URL, LEAVE_REQUEST_COUNT_URL } from '../Urls/apiurls';
import EditOffIcon from '@mui/icons-material/EditOff';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { FilterAlt } from '@mui/icons-material';
import { FilterAltOff } from '@mui/icons-material';

const StudentTable = ({ userRole }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [leaveRequestCount, setLeaveRequestCount] = useState(0);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    dob: '',
    email: '',
    createdon: '',
    updatedon: '',
    IsActive: true
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [selectedRows, setSelectedRows] = useState([]); // State for selected rows

  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const toggleFilterRow = () => {
    setIsFilterVisible(!isFilterVisible);
  }
  
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(STUDENT_URL);
      const formattedUsers = response.data.map(user => ({
        ...user,
        createdon: moment(user.createdon).format('DD-MM-YYYY hh:mm A'),
        updatedon: moment(user.updatedon).format('DD-MM-YYYY hh:mm A'),
        IsActive: user.isActive === true 
      }));
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    const fetchLeaveRequestCount = async () => {
      try {
        const response = await axios.get(LEAVE_REQUEST_COUNT_URL);
        setLeaveRequestCount(response.data.count);
      } catch (error) {
        console.error('Error fetching leave request count:', error);
      }
    };

    fetchUsers();
    fetchLeaveRequestCount();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const resetForm = () => {
    setFormData({
      firstname: '',
      lastname: '',
      dob: '',
      email: '',
      createdon: '',
      updatedon: '',
      IsActive: true
    });
    setEditingIndex(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalOpen(false);
    const emailExists = users.some((user) => user.email === formData.email);
    if (emailExists) {
      swal.fire('Error', 'Email is already taken.', 'error');
      return;
    }
    const newUser = {
      ...formData,
      createdon: moment().format(),
      updatedon: moment().format(),
    };

    try {
      if (editingIndex !== null) {
        await axios.put(`${STUDENT_URL}/${users[editingIndex].id}`, newUser);
        const updatedUsers = users.map((user, index) =>
          index === editingIndex ? newUser : user
        );
        setUsers(updatedUsers);
      } else {
        await axios.post(STUDENT_URL, newUser);
        setSnackbarMessage('Student added successfully!');
        setSnackbarOpen(true);
        fetchUsers();
      }
      resetForm();
      setModalOpen(false);
    } catch (error) {
      console.error('Error saving user:', error.response ? error.response.data : error.message);
    }
  };

  const handleEditSelected = () => {
    if (selectedRows.length === 1) {
      const selectedUser = selectedRows[0]; 
      const selectedId = selectedUser.id; 
      const foundUser = users.find(user => user.id === selectedId);
      if (foundUser) {
        navigate(`/edit/${selectedId}`);
      } else {
        swal.fire('Error', 'Selected user not found.', 'error');
      }
    } else {
      swal.fire('Please select exactly one user to edit.');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedRows.length > 0) {
        const { isConfirmed } = await swal.fire({
            title: 'Are you sure you want to delete the selected users?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete them!',
        });

        if (isConfirmed) {
            try {
                await Promise.all(selectedRows.map(async (user) => {
                    if (!user || !user.id) {
                        console.error('Invalid user object:', user);
                        throw new Error('Invalid user object.');
                    }
                    const updatedUser = {
                        ...user,
                        IsActive: false,
                        updatedon: moment().format()
                    };
                    await axios.delete(`${STUDENT_URL}${user.id}`, updatedUser);
                }));

                setSnackbarMessage('Selected users deleted successfully!');
                setSnackbarOpen(true);
                fetchUsers();
                setSelectedRows([]); // Clear selected rows
            } catch (error) {
                console.error('Error deleting users:', error.response ? error.response.data : error.message);
                swal.fire('Error!', 'There was a problem processing your request.', 'error');
            }
        }
    } else {
        swal.fire('Please select at least one user to delete.');
    }
};

  const handleRowSelectionChange = (selectedRowKeys) => {
    setSelectedRows(selectedRowKeys);
  };
  
  const filteredUsers = users.filter((user) => 
    Object.values(user).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
   
  );

  const clearFilter = () =>{
    setSearchTerm('');
    
  };
  

  const exportToExcel = async () => {
    const { value: filename } = await swal.fire({
      title: "Enter name of file",
      input: "text",
      icon: "question",
      confirmButtonText: "Confirm",
      showCancelButton: true
    });

    if (filename) {
      const exportData = filteredUsers.map(user => ({
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        dob: user.dob,
        createdon: user.createdon,
        updatedon: user.updatedon,
        status: user.IsActive ? "Active" : "Inactive",
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Student');
      XLSX.writeFile(wb, `${filename}.xlsx`);
    }
  };

  const handleLeaveRequests = () => {
    navigate('/teacher-leave-requests');
  };

  return (
    <Container>
      <center>
        <h1>TEACHER PORTAL</h1>
      </center>
      
      <div className="button-container">
        <Tooltip title="View Leave Requests" arrow>
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={handleLeaveRequests}
          >
            Leave Requests {leaveRequestCount > 0 && `(${leaveRequestCount})`}
          </Button>
        </Tooltip>

        <Tooltip title="View Marks" arrow>
          <Button 
            variant="contained" 
            onClick={() => navigate('/view-marks')}
          >
            View Marks
          </Button>
        </Tooltip> 
      </div>

      <div className="search-export-container">
        <TextField
          label="Search Users"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
        
        <Typography variant="subtitle1" className="total-records">
          Total Records: {filteredUsers.length}
        </Typography>

        <div className="export-container">
          <Tooltip title="Export to Excel" arrow>
            <Button variant="contained" onClick={exportToExcel} className='export-button' startIcon={<SaveAltIcon/>}>
            </Button>
          </Tooltip>
          
          {userRole !== 'student' && (
            <Tooltip title="Add Student" arrow>
              <Button variant="contained" color="primary" onClick={() => setModalOpen(true)} startIcon={<PersonAddIcon />}>
              </Button>
            </Tooltip>
          )}
          <Tooltip title="Filter" arrow>
          <Button 
                variant="contained"
                onClick={toggleFilterRow}
                startIcon={<FilterAlt/>} 
                />
          </Tooltip>
          <Tooltip title="Clear filter" arrow>
          <Button 
                variant='contained'
                onClick={clearFilter}
                startIcon={<FilterAltOff />}
          />            
         </Tooltip>
        </div>
          <Tooltip title="Edit Selected" arrow>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleEditSelected}
            startIcon={<EditOffIcon />}
            disabled={selectedRows.length !== 1}
          >
          </Button>
        </Tooltip>
        <Tooltip title="Delete Selected" arrow>
          <Button 
            variant="contained" 
            color="secondary" 
            onClick={handleDeleteSelected}
            startIcon={<DeleteForeverIcon />}
            disabled={selectedRows.length === 0}
          >
          </Button>
        </Tooltip>
        </div>
        <div>
        
      </div>

      <DataGrid
      dataSource={filteredUsers}
      showBorders={true}
      allowColumnReordering={true}
      keyField="id"
      columnAutoWidth={true}
      allowColumnResizing
      filterRow={{ visible: isFilterVisible }}
      selection={{ mode: 'single' }} 
      onSelectionChanged={(e) => handleRowSelectionChange(e.selectedRowKeys)} 
      >
        <Column dataField="id" caption="ID" width={30} />
        <Column dataField="firstname" caption="First Name" />
        <Column dataField="lastname" caption="Last Name" />
        <Column dataField="email" caption="Email" />
        <Column dataField="dob" caption="DOB" />
        <Column dataField="createdon" caption="Created On" />
        <Column dataField="updatedon" caption="Updated On" />
        <Column 
          caption="Status" 
          cellRender={(cellData) => (
            <Checkbox 
              className='checkbox'
              checked={cellData.data.IsActive}
              disabled 
            />
          )}
        />
        <Paging defaultPageSize={10} />
        <Pager className='custom-pagination' showPageSizeSelector showInfo />
        <GroupPanel visible={true} />
      </DataGrid>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
      <div style={{ padding: '20px', maxWidth: '500px', margin: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}>
      <h2>{editingIndex !== null ? 'Edit User' : 'Add User'}</h2>
      <form onSubmit={handleSubmit} className="user-form">
      <TextField
        name="firstname"
        label="First Name"
        value={formData.firstname}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        name="lastname"
        label="Last Name"
        value={formData.lastname}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        name="dob"
        label="Date of Birth"
        type="date"
        value={formData.dob}
        onChange={handleChange}
        fullWidth
        margin="normal"
        InputLabelProps={{ shrink: true }}
        required
      />
      <TextField
        name="email"
        label="Email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
        <Button onClick={() => setModalOpen(false)} variant="outlined" color="secondary">
          Back
        </Button>
        <Button type="submit" variant="contained" color="primary">
          {editingIndex !== null ? 'Update User' : 'Add User'}
        </Button>
      </div>
      </form>
      </div>
      </Modal>


      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      />
    </Container>
  );
};

export default StudentTable;
