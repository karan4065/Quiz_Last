// routes/facultyRoutes.js
import express from 'express';
import { loginFaculty, registerFaculty, uploadFacultyCSV, getQuizzesByFaculty } from '../controllers/facultyController.js';
const router = express.Router();

router.post('/register', registerFaculty);
router.post('/login', loginFaculty);
router.post('/upload-csv', uploadFacultyCSV);

// Only keep the proper route for quizzes
router.get("/:facultyId/quizzes", getQuizzesByFaculty);

export default router;
