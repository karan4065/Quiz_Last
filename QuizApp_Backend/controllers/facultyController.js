import jwt from 'jsonwebtoken';
import Faculty from '../models/Faculty.js';
import Quiz from '../models/Quiz.js';
import Papa from "papaparse";
import bcrypt from "bcryptjs";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, 'divyansh', {
      expiresIn: '30d', // Token expiry (30 days)
  });
};

export const getQuizzesByFaculty = async (req, res) => {
  try {
    const facultyId = req.params.facultyId;

    const quizzes = await Quiz.find({ createdBy: facultyId }).populate("createdBy", "name");

    if (!quizzes.length) {
      return res.status(404).json({ success: false, message: "No quizzes found" });
    }

    res.status(200).json({ success: true, data: quizzes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const registerFaculty = async (req, res) => {
  const { name, email, department, phone, password, isAdmin, subjects, address } = req.body;

  try {
    const facultyPassword = password || email; 

    const user = await Faculty.create({
      name,
      email,
      department,
      phone,
      password: facultyPassword,
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
  
        // Check for user
       const user = await Faculty.findOne({ email });

        if (user && await user.password==password) {
               console.log(req.body)
          // user.password = undefined;
            const token = generateToken(user._id);

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000, // 1 days
            });
            res.json({
                success: true,
                message: 'User login successfully',
                data: user
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid email or password',
                data: null
            });
        }
    } catch (error) {
      console.log(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            data: null
        });
    }
};

export const uploadFacultyCSV = async (req, res) => {
  try {
    const { csvData } = req.body;

    if (!csvData) {
      return res.status(400).json({ success: false, message: "CSV data is required" });
    }

    // Parse the CSV data
    const parsed = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,  
    });

    if (parsed.errors.length > 0) {
      return res.status(400).json({ success: false, message: "CSV parsing error", errors: parsed.errors });
    }

 
    const validFaculties = parsed.data.filter(
      (fac) => fac.name && fac.email && fac.department && fac.phone
    );

    if (validFaculties.length === 0) {
      return res.status(400).json({ success: false, message: "No valid faculty data found" });
    }
 
    const facultiesToInsert = await Promise.all(
      validFaculties.map(async (fac) => {
     
        const hashedPassword = await bcrypt.hash(fac.password ? fac.password : fac.email, 10);

        return {
          name: fac.name.trim(),
          email: fac.email.trim(),
          department: fac.department.trim(),
          phone: fac.phone.trim(),
          password: hashedPassword,
          isAdmin: fac.isAdmin === "true" || fac.isAdmin === true,  
          subjects: fac.subjects ? fac.subjects.split(";").map((s) => s.trim()) : [],  
        };
      })
    );
 
    const saved = await Faculty.insertMany(facultiesToInsert, { ordered: false });

    res.json({ success: true, message: "Faculty uploaded successfully", data: saved });

  } catch (err) {
    console.error("Error uploading faculty CSV:", err);

 
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "Duplicate entry error", error: err.keyValue });
    }

    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
