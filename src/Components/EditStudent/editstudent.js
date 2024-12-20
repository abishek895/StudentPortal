import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, TextField, Typography, Container, Grid, Dialog,Select, DialogActions, DialogContent, DialogTitle,MenuItem } from '@mui/material';
import axios from 'axios';
import moment from 'moment';
import Swal from 'sweetalert2';
import { DataGrid, Column } from 'devextreme-react/data-grid';
import 'devextreme/dist/css/dx.light.css';
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import '../EditStudent/editstudent.css';
import { STUDENT_DETAILS_URL, STUDENT_MARK_URL, SEMESTER_URL, STUDENT_BY_ID_URL } from '../Urls/apiurls';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
 import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Snackbar from '@mui/material/Snackbar';
import { SelectBox } from 'devextreme-react';


const EditStudent = () => {
    const { id } = useParams();
    console.log('Student ID:', id);
    const navigate = useNavigate();
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        dob: '',
        email: '',
        isActive: false,
    });
    const [previousMarks, setPreviousMarks] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [newMark, setNewMark] = useState({ semester: '', maths: '', science: '', physics: '', chemistry: '', english: '' });
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editMark, setEditMark] = useState(null);
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            Id: id,
            ...formData,
        };

        try {
            await axios.put(STUDENT_DETAILS_URL(id), payload);
            toast.success('Student details updated successfully!');
        } catch (error) {
            toast.error('Error updating student details: ' + (error.response ? error.response.data : error.message));
        }
    };
    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const response = await axios.get(`${STUDENT_BY_ID_URL(id)}`);
                console.log('Student Data:', response.data); 
                setFormData({
                    firstname: response.data.firstname,
                    lastname: response.data.lastname,
                    dob: moment(response.data.dob).format('YYYY-MM-DD'),
                    email: response.data.email,
                    isActive: response.data.isActive,
                });
                setPreviousMarks(response.data.studentMarks || []);
            } catch (error) {
                toast.error('Error fetching student: ' + (error.response ? error.response.data : error.message));
            }
        };

        const fetchSemesters = async () => {
            try {
                const response = await axios.get(SEMESTER_URL);
                console.log('Semesters Data:', response.data);
                setSemesters(response.data);
            } catch (error) {
                toast.error('Error fetching semesters: ' + (error.response ? error.response.data : error.message));
            }
        };
        fetchStudent();
        fetchSemesters();
    }, [id]);

    const handleBack = () => {
        navigate(-1);
    };

    const handleAddMarkChange = (e) => {
        const { name, value } = e.target;
        if (value && (value < 1 || value > 100)) {
            setSnackbarMessage('Enter number between 1 to 100');
            setSnackbarOpen(true);
        }
        setNewMark({ ...newMark, [name]: value });
    };
    const handleAddMarkSubmit = async () => {

        if (!newMark.semester) {
            setSnackbarMessage('Please select a semester.');
            setSnackbarOpen(true);
            return; // Exit early if no semester is selected
        }

        const marks = [newMark.maths, newMark.science, newMark.physics, newMark.chemistry, newMark.english];
        const invalidMark = marks.some(mark => {
            const num = parseInt(mark, 10);
            return isNaN(num) || num < 1 || num > 100;
        });
        
        if (invalidMark) {
            setSnackbarMessage('Enter number between 1 to 100');
            setSnackbarOpen(true);
            return; // Exit early if validation fails
        }
    
        // Proceed with the API call if all fields are valid
        try {
            const response = await axios.post(STUDENT_MARK_URL, {
                studentid: id,
                maths: parseInt(newMark.maths, 10),
                science: parseInt(newMark.science, 10),
                physics: parseInt(newMark.physics, 10),
                chemistry: parseInt(newMark.chemistry, 10),
                english: parseInt(newMark.english, 10),
                semid: parseInt(newMark.semester),
            });          
            setPreviousMarks([...previousMarks, response.data]);
            setNewMark({ semester: '', maths: '', science: '', physics: '', chemistry: '', english: '' });
            setOpenAddDialog(false);
            toast.success('Mark added successfully!');
        } catch (error) {
            toast.error('Error adding mark: ' + (error.response ? error.response.data : error.message));
        }
    };

    const handleEditClick = (mark) => {
        setEditMark(mark);
        setOpenEditDialog(true);
    };

    const handleEditMarkChange = (e) => {
        const { name, value } = e.target;
        if (value && (value < 1 || value > 100)) {
            setSnackbarMessage('Enter number between 1 to 100');
            setSnackbarOpen(true);
        }
        setEditMark((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditMarkSubmit = async () => {
        if (editMark) {
            // Validate input values
            const marks = [editMark.maths, editMark.science, editMark.physics, editMark.chemistry, editMark.english];
            const invalidMark = marks.some(mark => {
                const num = parseInt(mark, 10);
                return isNaN(num) || num < 1 || num > 100;
            });
    
            if (invalidMark) {
                setSnackbarMessage('Enter number between 1 to 100');
                setSnackbarOpen(true);
                return; // Exit early if validation fails
            }
    
            try {
                await axios.put(`${STUDENT_MARK_URL}${editMark.id}`, {
                    studentid: editMark.studentid,
                    maths: parseInt(editMark.maths, 10),
                    science: parseInt(editMark.science, 10),
                    physics: parseInt(editMark.physics, 10),
                    chemistry: parseInt(editMark.chemistry, 10),
                    english: parseInt(editMark.english, 10),
                    semid: editMark.semid,
                });
                setPreviousMarks((prev) => prev.map((mark) => (mark.id === editMark.id ? editMark : mark)));
                setOpenEditDialog(false);
                toast.success('Mark updated successfully!');
            } catch (error) {
                toast.error('Error updating mark: ' + (error.response ? error.response.data : error.message));
            }
        }
    };

    const handleDeleteMark = async (markId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You will not be able to recover this mark!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
        });
    
        if (result.isConfirmed) {
            try {
                await axios.delete(`${STUDENT_MARK_URL}${markId}`);
                setPreviousMarks((prev) => prev.filter((mark) => mark.id !== markId));
                Swal.fire('Deleted!', 'The mark has been deleted.', 'success'); // Show success message
            } catch (error) {
                toast.error('Error deleting mark: ' + (error.response ? error.response.data : error.message));
            }
        }
    };

    const handleSelectBoxChange = (e) => {
        const value = e.value;  // Get the selected value from the event
        setNewMark({ ...newMark, semester: value });  // Update the state with the selected value
    };

    const filterSemesters = () => {
        const usedSemesterIds = previousMarks.map(mark => mark.semid);
        return semesters.filter(semester => !usedSemesterIds.includes(semester.semid));
    };

    const studentsWithMarks = previousMarks.map(mark => {
        const { maths, science, physics, chemistry, english } = mark;
        const total = (parseInt(maths, 10) || 0) + (parseInt(science, 10) || 0) +
                      (parseInt(physics, 10) || 0) + (parseInt(chemistry, 10) || 0) +
                      (parseInt(english, 10) || 0);
        const cgpa = (total / 50).toFixed(2); // Assuming 5 subjects

        return {
            ...mark,
            total,
            cgpa,
        };
    });

    return (
        <Container className="container">
            <Typography variant="h4" className="header">Edit Student {id}</Typography>
            <form onSubmit={handleSubmit} className="form-grid">
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="First Name"
                            name="firstname"
                            value={formData.firstname}
                            onChange={handleChange}
                            required
                            fullWidth
                            margin="normal"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Last Name"
                            name="lastname"
                            value={formData.lastname}
                            onChange={handleChange}
                            required
                            fullWidth
                            margin="normal"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Date of Birth"
                            name="dob"
                            type="date"
                            value={formData.dob}
                            onChange={handleChange}
                            required
                            fullWidth
                            margin="normal"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            fullWidth
                            margin="normal"
                        />
                    </Grid>
                </Grid>
                <div>
                <Button 
                 type="submit" 
                 variant="contained" 
                 color="primary"
                >
                Update
                </Button>
                </div>
                <div>
                <Typography variant="h5" className="marks-header">Marks</Typography>
                </div>
                <Button 
                    variant="outlined" 
                    color="secondary" 
                    onClick={() => setOpenAddDialog(true)} 
                    style={{ marginBottom: '16px' }}
                >
                    <AddIcon/> Add Mark
                </Button>

                <div className="mark-grid">
                    <DataGrid
                        dataSource={studentsWithMarks}
                        keyField="id"
                        columnAutoWidth={true}
                        showBorders={true}
                        allowColumnReordering={true}
                        allowColumnResizing={true}
                    >
                        <Column 
                            caption="Semester" 
                            cellRender={(e) => {
                                const semester = semesters.find(s => s.semid === e.data.semid);
                                return semester ? semester.semname : 'N/A';
                            }} 
                        />
                        <Column dataField="maths" caption="Maths" dataType="number" />
                        <Column dataField="science" caption="Science" dataType="number" />
                        <Column dataField="physics" caption="Physics" dataType="number" />
                        <Column dataField="chemistry" caption="Chemistry" dataType="number" />
                        <Column dataField="english" caption="English" dataType="number" />
                        <Column dataField="total" caption="Total" dataType="number" />
                        <Column dataField="cgpa" caption="CGPA" dataType="number" />
                        <Column
                            caption="Actions"
                            cellRender={(e) => (
                                <div>
                                    <Button variant="outlined" color="primary" onClick={() => handleEditClick(e.data)} size='small'>
                                        <EditIcon/>
                                    </Button>
                                
                                    <Button variant="outlined" color="secondary" onClick={() => handleDeleteMark(e.data.id)} size='small'>
                                        <DeleteIcon/>
                                    </Button>
                                </div>
                            )}
                        />
                    </DataGrid>
                </div>
                <div>
                <Button 
                 variant="contained"
                 color="primary" 
                 onClick={handleBack} 
                 size="small" 
                 >Back
                 <ArrowBackIcon />
                 </Button>
                 </div>
                </form>
            <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} aria-labelledby="add-mark-dialog">
                <DialogTitle id="add-mark-dialog">Add Marks</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>       
                                       
                            <SelectBox
                                name="semester"
                                dataSource={filterSemesters()}
                                value={newMark.semester}
                                valueExpr="semid"
                                displayExpr="semname"
                                placeholder="--Select Semester--"    
                                onValueChanged={handleSelectBoxChange} 
                                fullWidth
                                searchEnabled={true}
                                showClearButton={true}
                                required  
                            > ))
                            </SelectBox>
                                                      
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Maths"
                                name="maths"
                                type="number"
                                value={newMark.maths}
                                onChange={handleAddMarkChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Science"
                                name="science"
                                type="number"
                                value={newMark.science}
                                onChange={handleAddMarkChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Physics"
                                name="physics"
                                type="number"
                                value={newMark.physics}
                                onChange={handleAddMarkChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Chemistry"
                                name="chemistry"
                                type="number"
                                value={newMark.chemistry}
                                onChange={handleAddMarkChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="English"
                                name="english"
                                type="number"
                                value={newMark.english}
                                onChange={handleAddMarkChange}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAddDialog(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleAddMarkSubmit} color="primary">
                        Add
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} aria-labelledby="edit-mark-dialog">
                <DialogTitle id="edit-mark-dialog">Edit Marks</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Select
                                name="semester"
                                value={editMark?.semid || ''}
                                onChange={handleEditMarkChange}
                                fullWidth
                            >
                                <MenuItem value="">
                                    <em>Select Semester</em>
                                </MenuItem>
                                {semesters.map((semester) => (
                                    <MenuItem key={semester.semid} value={semester.semid}>
                                        {semester.semname}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Maths"
                                name="maths"
                                type="number"
                                value={editMark?.maths || ''}
                                onChange={handleEditMarkChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Science"
                                name="science"
                                type="number"
                                value={editMark?.science || ''}
                                onChange={handleEditMarkChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Physics"
                                name="physics"
                                type="number"
                                value={editMark?.physics || ''}
                                onChange={handleEditMarkChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Chemistry"
                                name="chemistry"
                                type="number"
                                value={editMark?.chemistry || ''}
                                onChange={handleEditMarkChange}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="English"
                                name="english"
                                type="number"
                                value={editMark?.english || ''}
                                onChange={handleEditMarkChange}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions> 
                    <Button onClick={handleEditMarkSubmit} color="primary">
                        Save
                    </Button>
                    <Button onClick={() => setOpenEditDialog(false)} color="primary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
             {/* Snackbar for error messages */}
        <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={snackbarOpen}
            autoHideDuration={1000}
            onClose={() => setSnackbarOpen(false)}
            message={snackbarMessage}
        />
        <ToastContainer />
        </Container>
    );
};
export default EditStudent;
