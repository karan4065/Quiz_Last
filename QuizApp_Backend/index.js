import express from 'express';
import connectDB from './config/db.js';
import quizRoutes from './routes/quiz.js';
import studentRoutes from './routes/studentRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import Faculty from './models/Faculty.js';
import { deleteInactiveProgress } from './controllers/quizController.js';
dotenv.config();
console.log("JWT_SECRET from env:", process.env.JWT_SECRET);
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
setInterval(() => {
  deleteInactiveProgress();
}, 5 * 60 * 1000);
// CORS configuration
const corsOptions = {
 origin: "https://svpcetquizsystem.vercel.app",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Connect to MongoDB
connectDB();

// Health Check Route
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Hello',
    });
});

// Routes
app.use('/api/faculty', facultyRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/quizzes', quizRoutes);

const facultyData = {
  name: "Divyansh",
  email: "divyansh6669@college.com",
  department: "CIVIL",
  phone: "9876514816",
  password: "9876514816",
  isAdmin: false,
  subjects: "Math;Physics"
};


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
