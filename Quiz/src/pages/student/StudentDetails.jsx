import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const StudentDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Retrieve student data from location state
    const student = location.state?.student; // Use optional chaining to avoid errors

    const handleStartQuiz = () => {
        navigate('/quiz', { state: { student } }); // Pass the student data to the quiz page
    };
    

    // If no student data is available, display a message
    if (!student) {
        return <div className="text-center text-red-600">No student data available.</div>;
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold text-center mb-6 text-[#313970]">Student Details</h2>
                <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700">Name: {student.name}</p>
                    <p className="text-sm font-medium text-gray-700">ID: {student.studentId}</p> {/* Changed to studentId */}
                    <p className="text-sm font-medium text-gray-700">Email: {student.email}</p>
                    <p className="text-sm font-medium text-gray-700">Department: {student.department}</p> {/* Changed to department */}
                    <p className="text-sm font-medium text-gray-700">Year: {student.year}</p> {/* Added Year */}
                </div>
                <button
                    onClick={handleStartQuiz}
                    className="w-full bg-[#cd354d] text-white font-semibold py-2 rounded hover:bg-[#f29109] transition duration-200"
                >
                    Start Quiz
                </button>
            </div>
        </div>
    );
};

export default StudentDetails;
