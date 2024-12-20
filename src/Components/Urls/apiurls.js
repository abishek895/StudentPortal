// src/constants/apiUrls.js
export const API_BASE_URL = 'http://localhost:5140/api';

export const STUDENT_URL = `${API_BASE_URL}/Students/`;
export const STUDENT_BY_ID_URL = (id) => `${STUDENT_URL}${id}`;
export const STUDENT_MARK_URL = `${API_BASE_URL}/StudentMark/`;
export const SEMESTER_URL = `${API_BASE_URL}/Semester/`;
export const SEND_MARKS_EMAIL_URL = `${API_BASE_URL}/Students/send-email`;
export const ROLE_URL = `${API_BASE_URL}/Role`
export const LOGIN_URL = `${API_BASE_URL}/Students/login`;
export const LEAVE_REQUEST_URL = `${API_BASE_URL}/LeaveRequest`; // Use LeaveRequest as defined in the controller
export const LEAVE_REQUEST_FOR_TEACHER_URL = 'http://localhost:5140/api/LeaveRequest/teacher';
export const LEAVE_REQUEST_COUNT_URL = `${LEAVE_REQUEST_URL}/teacher/count`; // For getting leave request count
export const LEAVE_REQUEST_EDIT_URL = (id) => `${LEAVE_REQUEST_URL}/${id}`;
export const STUDENT_DETAILS_URL = (id) => `${STUDENT_BY_ID_URL(id)}/details`;
export const NOTIFY_STUDENT_URL = `${API_BASE_URL}/Notifications/send`;

