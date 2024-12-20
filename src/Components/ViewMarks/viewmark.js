import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Grid
} from '@mui/material';
import DataGrid, { Column, Pager, Paging } from 'devextreme-react/data-grid';
import axios from 'axios';
import '../ViewMarks/viewmark.css';
import { STUDENT_URL, SEND_MARKS_EMAIL_URL, SEMESTER_URL } from '../Urls/apiurls';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ViewMarks = ({ userRole }) => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterSemester, setFilterSemester] = useState('');
    const [selectedSemestersForEmail, setSelectedSemestersForEmail] = useState([]);  // Updated state to handle multiple semesters
    const [openFilterDialog, setOpenFilterDialog] = useState(false);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await axios.get(STUDENT_URL);
                setStudents(response.data || []);
            } catch (error) {
                console.error('Error fetching students:', error);
            }
        };

        const fetchSemesters = async () => {
            try {
                const response = await axios.get(SEMESTER_URL);
                setSemesters(response.data || []);
            } catch (error) {
                console.error('Error fetching semesters:', error);
            }
        };

        fetchStudents();
        fetchSemesters();
    }, []);

    const handleBack = () => {
        navigate('/users');
    };

    const handleSendEmails = async () => {
        if (!selectedStudent) {
            toast.error("Please select a student to send the email.");
            return;
        }

        const student = students.find(s => s.id === selectedStudent);
        if (!student) {
            toast.error("Selected student not found.");
            return;
        }

        setLoading(true);

        try {
            let studentMarksPayload;

            if (selectedSemestersForEmail.length === 0 || selectedSemestersForEmail.includes('all')) {
                // If "all" semesters or no semesters are selected, send all the marks for the student
                studentMarksPayload = student.studentMarks.map(mark => ({
                    Maths: mark.maths,
                    Science: mark.science,
                    Physics: mark.physics,
                    Chemistry: mark.chemistry,
                    English: mark.english,
                    semid: mark.semid
                }));
            } else {
                // If specific semesters are selected, filter the marks for the selected semesters
                studentMarksPayload = student.studentMarks
                    .filter(mark => selectedSemestersForEmail.includes(mark.semid))
                    .map(mark => ({
                        Maths: mark.maths,
                        Science: mark.science,
                        Physics: mark.physics,
                        Chemistry: mark.chemistry,
                        English: mark.english,
                        semid: mark.semid
                    }));
            }

            const simplifiedPayload = {
                Id: student.id,
                Firstname: student.firstname,
                Lastname: student.lastname,
                Dob: student.dob,
                Createdon: new Date().toISOString(),
                Updatedon: new Date().toISOString(),
                Email: student.email,
                IsActive: student.isActive,
                Password: student.password,
                RoleId: student.roleId,
                StudentMarks: studentMarksPayload
            };

            await axios.post(SEND_MARKS_EMAIL_URL, simplifiedPayload);
            toast.success(`Email sent successfully to ${student.firstname} ${student.lastname}!`);
        } catch (error) {
            console.error('Error sending email:', error);
            toast.error(`Error sending email: ${error.response?.data || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleStudentSelect = (studentId) => {
        setSelectedStudent(studentId);
        setSelectedSemestersForEmail([]); // Reset semester selection when a new student is selected
    };

    const handleClearSelection = () => {
        setSelectedStudent('');
        setSelectedSemestersForEmail([]); // Reset multiple semester selection
    };

    const handleSemesterForEmailSelect = (event) => {
        setSelectedSemestersForEmail(event.target.value);
    };

    const filteredStudentsWithMarks = students.flatMap(student => {
        return student.studentMarks
            .filter(mark => !filterSemester || mark.semid === filterSemester)
            .map(mark => {
                const semester = semesters.find(sem => sem.semid === mark.semid);
                const semesterName = semester ? semester.semname : 'N/A';

                const { maths, science, physics, chemistry, english } = mark;
                const total = (parseInt(maths, 10) || 0) + (parseInt(science, 10) || 0) +
                              (parseInt(physics, 10) || 0) + (parseInt(chemistry, 10) || 0) +
                              (parseInt(english, 10) || 0);
                const cgpa = (total / 50).toFixed(2);
                let grade;

                if (cgpa >= 9) grade = 'A+';
                else if (cgpa >= 8) grade = 'A';
                else if (cgpa >= 7) grade = 'B';
                else if (cgpa >= 6) grade = 'C';
                else grade = 'RA';

                return {
                    id: `${student.id}`,
                    name: `${student.firstname} ${student.lastname}`,
                    semester: semesterName,
                    maths,
                    science,
                    physics,
                    chemistry,
                    english,
                    total,
                    cgpa,
                    grade
                };
            });
    });

    // Filter semesters available for the selected student
    const availableSemestersForSelectedStudent = selectedStudent ? 
        students.find(student => student.id === selectedStudent)?.studentMarks.map(mark => mark.semid) : [];

    // Filter semesters from all semesters based on the selected student marks
    const filteredSemesters = semesters.filter(sem => availableSemestersForSelectedStudent.includes(sem.semid));

    return (
        <Container className="container">
            <ToastContainer />
            <Typography variant="h4" className="title">ALL STUDENT MARKS</Typography>
            {userRole !== 'student' && (
                <>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6} md={4}>
                            <FormControl variant="outlined" fullWidth>
                                <InputLabel id="select-student-label">Select Student To Send Mail</InputLabel>
                                <Select
                                    labelId="select-student-label"
                                    value={selectedStudent}
                                    onChange={(e) => handleStudentSelect(e.target.value)}
                                    label="Select Student"
                                >
                                    {students.map((student) => (
                                        <MenuItem key={student.id} value={student.id}>
                                            {student.firstname} {student.lastname}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        {selectedStudent && (
                            <Grid item xs={12} sm={6} md={4}>
                                <FormControl variant="outlined" fullWidth>
                                    <InputLabel id="select-semester-label">Select Semester(s)</InputLabel>
                                    <Select
                                        labelId="select-semester-label"
                                        multiple
                                        value={selectedSemestersForEmail}
                                        onChange={handleSemesterForEmailSelect}
                                        label="Select Semester(s)"
                                    >
                                        <MenuItem value="all">All Semesters</MenuItem>
                                        {filteredSemesters.map((semester) => (
                                            <MenuItem key={semester.semid} value={semester.semid}>
                                                {semester.semname}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}
                    </Grid>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSendEmails}
                        disabled={!selectedStudent || selectedSemestersForEmail.length === 0 || loading}
                        style={{ marginTop: '10px' }}
                    >
                        {loading ? <CircularProgress size={24} /> : "Send Email"}
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleClearSelection}
                        style={{ marginLeft: '10px', marginTop: '10px' }}
                    >
                        Clear Selection
                    </Button>
                </>
            )}
            <DataGrid
                dataSource={filteredStudentsWithMarks}
                keyField="id"
                showBorders={true}
                allowColumnReordering={true}
                filterRow={{ visible: true }}
                allowColumnResizing
            >
                <Column dataField="id" caption="ID" width={100} />
                <Column dataField="name" caption="Name" />
                <Column dataField="semester" caption="Semester" />
                <Column dataField="maths" caption="Maths" />
                <Column dataField="science" caption="Science" />
                <Column dataField="physics" caption="Physics" />
                <Column dataField="chemistry" caption="Chemistry" />
                <Column dataField="english" caption="English" />
                <Column dataField="total" caption="Total" />
                <Column dataField="cgpa" caption="CGPA" />
                <Column dataField="grade" caption="Grade" />
                <Paging defaultPageSize={10} />
                <Pager showPageSizeSelector showInfo />
            </DataGrid>
            <Button variant="outlined" onClick={handleBack} className="button">
                Back
            </Button>
        </Container>
    );
};

export default ViewMarks;
