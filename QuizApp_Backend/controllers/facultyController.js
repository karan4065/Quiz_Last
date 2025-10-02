import jwt from 'jsonwebtoken';
import Faculty from '../models/Faculty.js';
import Quiz from '../models/Quiz.js';
import Papa from "papaparse";
import bcrypt from "bcryptjs";
import connectDB from '../config/db.js';
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, 'divyansh', {
      expiresIn: '30d', // Token expiry (30 days)
  });
};

connectDB();

// GET /api/faculty/:facultyId/quizzes?subject=Computer%20Science
export const getFacultyQuizzes = async (req, res) => {
  try {
    const { facultyId } = req.params;

    if (!facultyId) {
      return res.status(400).json({ success: false, message: "Faculty ID required" });
    }

    const quizzes = await Quiz.find({ createdBy: facultyId }).sort({ createdAt: -1 });

    res.json({ success: true, data: quizzes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



export const registerFaculty = async (req, res) => {
  const { name, email, department, phone, isAdmin, subjects, address } = req.body;

  try {
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required to set as password",
      });
    }

    // Use phone as password and hash it
    const hashedPassword = await bcrypt.hash(phone, 10); // 10 salt rounds

    const user = await Faculty.create({
      name,
      email,
      department,
      phone,
      password: hashedPassword,
      isAdmin: isAdmin || false,
      subjects: Array.isArray(subjects) ? subjects : [],
      address: address || "",
    });

    res.json({
      success: true,
      message: "Faculty registered successfully",
      data: user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const loginFaculty = async (req, res) => {
    const { email, password } = req.body;
    try {
     
        const user = await Faculty.findOne({ email });
       

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
                data: null
            });
        }

        // Compare entered password with hashed password in DB
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
                data: null
            });
        }

        // Password is correct, generate token
        const token = generateToken(user._id);

        // Send cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        // Optionally remove password from response
        const userData = { ...user._doc };
        delete userData.password;

        res.json({
            success: true,
            message: 'User login successfully',
            data: userData
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            data: null
        });
    }
};

export const getAllFaculties = async (req, res) => {
  try {
    const faculties = await Faculty.find().sort({ createdAt: -1 }); // latest first
    res.status(200).json({ success: true, data: faculties });
  } catch (err) {
    console.error("Error fetching faculties:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
import fs from 'fs'
export const uploadFacultyCSV = async (req, res) => {
  try {
    console.log("🚀 Received request body:", req.body);

    const { faculties } = req.body;
    if (!faculties || faculties.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Faculty array is required" });
    }

    const facultiesToInsert = await Promise.all(
      faculties.map(async (fac, index) => {
        // Use phone as password if not provided
        const passwordToHash = fac.password ? fac.password : fac.phone;
        const hashedPassword = await bcrypt.hash(passwordToHash, 10);

        console.log(`🔹 Preparing faculty #${index + 1}:`, fac.name);

        return {
          name: fac.name.trim(),
          email: fac.email.trim().toLowerCase(),
          department: fac.department.trim(),
          phone: fac.phone.trim(),
          password: hashedPassword,
          isAdmin: fac.isAdmin === true ? true : false,
          subjects: fac.subjects ? fac.subjects : [],
        };
      })
    );

    const saved = await Faculty.insertMany(facultiesToInsert, { ordered: false });
    console.log("✅ Faculties inserted successfully:", saved.length);

    res.json({
      success: true,
      message: "Faculty uploaded successfully",
      data: saved,
    });
  } catch (err) {
    console.error("❌ Error uploading faculty:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate entry error",
        error: err.keyValue,
      });
    }

    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }};
export const updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, department, subjects, isAdmin } = req.body;

    const updatedFaculty = await Faculty.findByIdAndUpdate(
      id,
      { name, email, department, subjects, isAdmin },
      { new: true }
    );

    if (!updatedFaculty) {
      return res.status(404).json({ success: false, message: "Faculty not found" });
    }

    res.status(200).json({ success: true, data: updatedFaculty });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete faculty
export const deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Faculty.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Faculty not found" });
    }

    res.status(200).json({ success: true, message: "Faculty deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};