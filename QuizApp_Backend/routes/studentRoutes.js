import express from 'express';
import {
  registerStudent,
  loginStudent,
  getStudentByStudentID,
  getYearDeptStudents,
  uploadStudentsCSV,
  updateStudent,
  deleteStudent,
  getStudentMe,
  getStudentQuizzes,
  getQuizResult,
  getStudentSubmissions,
  getStudentByName
} from '../controllers/studentController.js';

import { protect } from '../middlewares/authMiddleware.js'; // protect routes if needed
import { getCategoryWiseAnswerDistributionForStudent } from '../controllers/quizController.js';

const router = express.Router();

// Student registration and login
router.post('/register', registerStudent);
router.post('/login', loginStudent);

// Student profile & info routes
router.get('/me', protect, getStudentMe);
router.get('/studentId/:studentId', getStudentByStudentID);
router.get('/id/:id', getStudentByStudentID);
router.get('/info', getStudentByName);

// Student list filtered by year and department
router.get('/', getYearDeptStudents);

// Upload student CSV data
router.post('/upload-csv', uploadStudentsCSV);

// Update and delete student records
router.put('/:studentId', updateStudent);
router.delete('/:id', deleteStudent);
router.delete('/delete/:studentId', deleteStudent);

// Get quizzes and submissions for a student
router.get('/:studentId/quizzes', getStudentQuizzes);
router.get('/submissions/:id', getStudentSubmissions);

// Route for fetching category-wise answer distribution for a student's quiz submission
router.post('/result/:submissionId', getCategoryWiseAnswerDistributionForStudent);

export default router;
