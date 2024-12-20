import React, { useEffect, useState } from 'react';
import { LEAVE_REQUEST_FOR_TEACHER_URL } from '../constants/apiUrls';

const TeacherLeaveRequests = () => {
    const [leaveRequests, setLeaveRequests] = useState([]);

    useEffect(() => {
        const fetchLeaveRequests = async () => {
            try {
                const response = await fetch(LEAVE_REQUEST_FOR_TEACHER_URL);
                if (!response.ok) {
                    throw new Error('Failed to fetch leave requests');
                }
                const data = await response.json();
                setLeaveRequests(data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchLeaveRequests();
    }, []);

    return (
        <div>
            <h1>Leave Requests</h1>
            <ul>
                {leaveRequests.map(request => (
                    <li key={request.id}>
                        From: {request.from} - Till: {request.till} - Reason: {request.reason} - Status: {request.status}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TeacherLeaveRequests;
