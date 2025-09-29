// routes/userRoutes.js
import express from 'express';
import { loginFaculty, registerFaculty } from '../controllers/facultyController.js';
import { getQuizzesByFaculty } from '../controllers/facultyController.js';
const router = express.Router();

router.post('/register', registerFaculty);
router.get("/:facultyId", getQuizzesByFaculty);
// Login a user
router.post('/login', loginFaculty);
router.get("/:facultyId/quizzes", getQuizzesByFaculty);
export default router;
