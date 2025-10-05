import express from 'express';
import { 
    createQuiz, 
    deleteQuiz,
    getQuiz, 
    getQuizAnswerDistribution, 
    getCategoryWiseAnswerDistribution,
    getCategoryWiseAnswerDistributionForStudent,saveProgress,
    createQuizByFaculty,getQuizSubmissions,
    getQuizTitleById,
    blockStudent
} from '../controllers/quizController.js';
import { getCategoryDistribution } from '../controllers/quizSubmissionController.js';
import { submitQuiz } from '../controllers/quizSubmissionController.js';
import { createQuizWithImageQuestion } from '../controllers/quizController.js';
// import { protect } from '../middlewares/user_middleware.js';
import protect2  from '../middlewares/user_middleware.js';
import { isAuthenticated } from '../middlewares/authMiddleware2.js';
const router = express.Router();
import { getAllFaculties } from '../controllers/facultyController.js';
import upload from '../middlewares/upload.js';
router.post("/:quizId/addqs",upload.single("image"), addImageQuestion);
import { addImageQuestion } from '../controllers/quizController.js';
router.get("/:quizId/submissions", getQuizSubmissions);
// Save progress for a quiz
router.post("/:quizId/save-progress", isAuthenticated, saveProgress);
router.get('/quizzes/:quizId/student/:studentId/category-distribution', getCategoryDistribution);
// Route to create a quiz
router.post('/create', createQuiz);
router.get("/getall", getAllFaculties);
router.post("/imagebaseqs",  upload.single("image"),createQuizWithImageQuestion)
// Get a specific quiz by ID
router.get('/:quizId',isAuthenticated, getQuiz);
router.delete('/:quizId', deleteQuiz);
router.get('/title/:quizId',getQuizTitleById)

// Submit a quiz
router.post('/:quizId/submit', protect2, submitQuiz);

// Get answer distribution for a specific quiz and student
router.get('/:quizId/student/:studentId', getQuizAnswerDistribution);

// Get category-wise answer distribution for a specific quiz
router.get('/:quizId/category-distribution', getCategoryWiseAnswerDistribution);

// Get category-wise answer distribution for a specific quiz and student
router.get('/:quizId/student/:studentId/category-distribution', getCategoryWiseAnswerDistributionForStudent);
router.post("/upload",createQuizByFaculty)

router.post("/:quizId/block-student",isAuthenticated ,blockStudent);
export default router;
