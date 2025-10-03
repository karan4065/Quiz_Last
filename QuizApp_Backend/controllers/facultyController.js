import jwt from 'jsonwebtoken';
import Faculty from '../models/Faculty.js';
import Quiz from '../models/Quiz.js';
import bcrypt from 'bcryptjs';
import connectDB from '../config/db.js';

connectDB();

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, 'divyansh', {
    expiresIn: '30d',
  });
};

// GET /api/faculty/:facultyId/quizzes
export const getFacultyQuizzes = async (req, res) => {
  try {
    const { facultyId } = req.params;
    if (!facultyId) {
      return res.status(400).json({ success: false, message: 'Faculty ID required' });
    }

    const quizzes = await Quiz.find({ createdBy: facultyId }).sort({ createdAt: -1 });
    res.json({ success: true, data: quizzes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Register Faculty
export const registerFaculty = async (req, res) => {
  try {
    const {
      name,
      email,
      department,
      phone,
      isAdmin,
      subjects,
      session,
      semester,
    } = req.body;

    // Validation
    if (!name || !email || !department || !phone || !session || !semester) {
      return res.status(400).json({
        success: false,
        message: "Name, email, department, phone, session, and semester are required",
      });
    }

    const sem = semester.trim().toLowerCase();
    if (!["even", "odd"].includes(sem)) {
      return res
        .status(400)
        .json({ success: false, message: "Semester must be 'even' or 'odd'" });
    }

    // Hash phone as password
    const hashedPassword = await bcrypt.hash(phone, 10);

    // Try to create faculty
    const faculty = await Faculty.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      department: department.trim(),
      phone: phone.trim(),
      password: hashedPassword,
      isAdmin: isAdmin || false,
      subjects: Array.isArray(subjects) ? subjects : [],
      session: session.trim(),
      semester: sem,
    });

    return res.json({
      success: true,
      message: "Faculty registered successfully",
      data: faculty,
    });
  } catch (err) {
    console.error(err);

    // Duplicate key error (email + session + semester)
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: `Faculty with email '${err.keyValue.email}' already exists for session '${err.keyValue.session}' and semester '${err.keyValue.semester}'`,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// Login Faculty (with session & semester)
export const loginFaculty = async (req, res) => {
  try {
    const { email, password, session, semester } = req.body;
console.log(req.body)
    if (!session || !semester) {
      return res.status(400).json({ success: false, message: 'Session and semester are required' });
    }

    const sem = semester.trim().toLowerCase();
    if (!['even', 'odd'].includes(sem)) {
      return res.status(400).json({ success: false, message: 'Semester must be even or odd' });
    }

    // Find faculty by email + session + semester
    const user = await Faculty.findOne({ email: email.trim().toLowerCase(), session: session.trim(), semester: sem });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials for this session/semester', data: null });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(isPasswordValid)
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials', data: null });
    }

    const token = generateToken(user._id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
    });

    const userData = { ...user._doc };
    delete userData.password;

    res.json({ success: true, message: 'Login successful', data: userData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

// Get all faculties
export const getAllFaculties = async (req, res) => {
  try {
    const faculties = await Faculty.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: faculties });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Upload Faculty CSV
export const uploadFacultyCSV = async (req, res) => {
  try {
    const { faculties } = req.body;
    if (!faculties || faculties.length === 0) {
      return res.status(400).json({ success: false, message: 'Faculty array is required' });
    }

    const facultiesToInsert = [];

    for (let index = 0; index < faculties.length; index++) {
      const fac = faculties[index];

      // Validate session & semester
      if (!fac.session || !fac.session.trim()) {
        return res.status(400).json({ success: false, message: `Session required for faculty #${index + 1}` });
      }
      const sem = fac.semester ? fac.semester.trim().toLowerCase() : '';
      if (!['even', 'odd'].includes(sem)) {
        return res.status(400).json({ success: false, message: `Semester must be even or odd for faculty #${index + 1}` });
      }

      const hashedPassword = await bcrypt.hash(fac.password ? fac.password : fac.phone, 10);

      facultiesToInsert.push({
        name: fac.name.trim(),
        email: fac.email.trim().toLowerCase(),
        department: fac.department.trim(),
        phone: fac.phone.trim(),
        password: hashedPassword,
        isAdmin: fac.isAdmin === true ? true : false,
        subjects: fac.subjects ? fac.subjects : [],
        session: fac.session.trim(),
        semester: sem,
      });
    }

    const saved = await Faculty.insertMany(facultiesToInsert, { ordered: false });

    res.json({ success: true, message: 'Faculty uploaded successfully', data: saved });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate entry for email/session/semester',
        error: err.keyValue,
      });
    }
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// Update Faculty
export const updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, department, subjects, isAdmin, session, semester } = req.body;
console.log(req.body)
    const updatedFaculty = await Faculty.findByIdAndUpdate(
      id,
      { name, email, department, subjects, isAdmin, session, semester },
      { new: true }
    );

    if (!updatedFaculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found' });
    }

    res.status(200).json({ success: true, data: updatedFaculty });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Delete Faculty
export const deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Faculty.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Faculty not found' });
    }

    res.status(200).json({ success: true, message: 'Faculty deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
