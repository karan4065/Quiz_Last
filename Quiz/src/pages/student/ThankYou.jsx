// src/student/ThankYou.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const ThankYou = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-3xl font-bold mb-4">Thank You for Completing the Quiz!</h1>
            <p className="text-lg mb-8">Your responses have been recorded.</p>
            <Link to="/" className="bg-[#313970] text-white py-2 px-4 rounded-lg hover:bg-[#f29109] transition duration-200">
                Go to Home
            </Link>
        </div>
    );
};

export default ThankYou;
