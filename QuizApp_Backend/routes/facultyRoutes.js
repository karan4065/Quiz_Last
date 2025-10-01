// routes/facultyRoutes.js
import express from 'express';
import upload from '../middlewares/upload.js';
import multer from 'multer';
import { loginFaculty, registerFaculty, uploadFacultyCSV, getFacultyQuizzes} from '../controllers/facultyController.js';
const router = express.Router();
import { deleteFaculty,updateFaculty } from '../controllers/facultyController.js';
import { getAllFaculties } from '../controllers/facultyController.js';
router.post('/register', registerFaculty);
router.post('/login', loginFaculty);
router.post('/upload-csv', uploadFacultyCSV);
router.get("/getall", getAllFaculties);
// Only keep the proper route for quizzes
router.get("/:facultyId/quizzes", getFacultyQuizzes);
router.put("/update/:id", updateFaculty);
router.delete("/delete/:id", deleteFaculty);
export default router;
