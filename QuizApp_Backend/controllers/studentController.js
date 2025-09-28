import Student from '../models/Student.js';
import jwt from 'jsonwebtoken';
import Papa from 'papaparse';
import QuizSubmission from '../models/QuizSubmission.js';
// Generate a JWT token
const generateToken = (student) => {
 
  return jwt.sign(
    {
      id: student._id,
      name: student.name,
      studentId: student.studentId,
      department: student.department,
    },
   'divyansh',
    { expiresIn: "30d" }
  );
};
import bcrypt from 'bcryptjs';

export const registerStudent = async (req, res) => {
    const { name, studentId, department, year, email, phone } = req.body;

    try {
        const studentExists = await Student.findOne({ $or: [{ email }, { studentId }] });

        if (studentExists) {
            return res.status(400).json({
                success: false,
                message: 'Student already registered with this email or studentId'
            });
        }

        // Create a new student
        const student = new Student({
            name,
            studentId,
            department,
            year,
            email,
            phone,
            password:studentId
        });

        // Save the student to the database
        const savedStudent = await student.save();

        // Optional: Remove the password from the response
        savedStudent.password = undefined;

        res.status(201).json({
            success: true,
            message: 'Student registered successfully',
            data: savedStudent
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
export const loginStudent = async (req, res) => {
  const { uid, password, quizId } = req.body;

  if (!uid || !password || !quizId) {
    console.log("Missing fields:", { uid, password, quizId });
    return res.status(400).json({
      success: false,
      message: "UID, password, and quizId are required",
    });
  }

  try {
    const student = await Student.findOne({ studentId: uid });
    
    if (!student) {
     
      return res.status(401).json({ success: false, message: "Invalid UID or password" });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    console.log("Password match result:", isMatch);

    if (!isMatch) {
      console.log("Password does not match for UID:", uid);
      return res.status(401).json({ success: false, message: "Invalid UID or password" });
    }

    // Check if student already submitted this quiz
    const submission = await QuizSubmission.findOne({
      quizId,
      studentId: student._id,
      status: true,
    });

    if (submission) {
 
      return res.status(403).json({
        success: false,
        message: "You have already submitted this quiz",
        data: { quizId, completed: true },
      });
    }

    // Generate token
    const token = generateToken(student);


    // Send cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
    });

    res.status(200).json({
      success: true,
      message: "Student logged in successfully",
      data: { student, quizId, completed: false },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const student = await Student.findOne({ email });
    if (!student) return res.status(400).json({ message: "Email not registered" });

    const token = crypto.randomBytes(20).toString("hex");
    student.resetPasswordToken = token;
    student.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins
    await student.save();

    // Setup email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "bharbatdivyansh1@gmail.com",
        pass: "uejuxvsnsyvotsgg",
      },
    });

    await transporter.sendMail({
      from: "bharbatdivyansh1@gmail.com",
      to: email,
      subject: "Password Reset",
      text:`Your reset token is: ${token} (valid for 15 mins)`,
    });

    res.json({ message: "Reset token sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const student = await Student.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // token not expired
    });

    if (!student) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const salt = await bcrypt.genSalt(10);
    student.password = await bcrypt.hash(password, salt);

    // remove token after successful reset
    student.resetPasswordToken = undefined;
    student.resetPasswordExpires = undefined;

    await student.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
 }
};



export const getYearDeptStudents = async (req, res) => {
    try {
        const { year, department } = req.query;

        let query = {};
        
        if (year) {
            query.year = year;
        }
        
        if (department) {
            query.department = department;
        }

        const students = await Student.find(query);

        if (students.length > 0) {
            res.json({
                success: true,
                message: 'Students retrieved successfully',
                data: students
            });
        } else {
            res.json({
                success: false,
                message: 'No students found for the specified criteria'
            });
        }
    } catch (error) {wwwww
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// export const getStudentByStudentID = async (req, res) => {
//     const { studentId } = req.params;

//     try {
//         const student = await Student.findOne({ studentId }).select('-password');
//         if (!student) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Student not found'
//             });
//         }
//         res.json({
//             success: true,
//             message: 'Student retrieved successfully',
//             data: student
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Server error',
//             error: error.message
//         });
//     }
// };
export const uploadStudentsCSV = async (req, res) => {
  try {
    const { csvData } = req.body;

    if (!csvData) {
      return res.status(400).json({ success: false, message: "CSV data is required" });
    }

    // Parse the CSV data
    const parsed = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true, // skip empty lines automatically
    });

    if (parsed.errors.length > 0) {
      return res.status(400).json({ success: false, message: "CSV parsing error", errors: parsed.errors });
    }

    // Filter out rows missing essential fields
    const validStudents = parsed.data.filter(stu => stu.name && stu.studentId && stu.email && stu.password && stu.department && stu.year);

    if (validStudents.length === 0) {
      return res.status(400).json({ success: false, message: "No valid student data found" });
    }

    // Prepare student documents for insertion
    const studentsToInsert = await Promise.all(
      validStudents.map(async (stu) => {
        const hashedPassword = await bcrypt.hash(stu.password, 10);
        return {
          name: stu.name.trim(),
          studentId: stu.studentId.trim(),
          department: stu.department.trim(),
          year: Number(stu.year),
          email: stu.email.trim(),
          password: hashedPassword,
          phone: stu.phone ? stu.phone.trim() : "0000000000", // default if missing
        };
      })
    );

    // Insert into database
    const saved = await Student.insertMany(studentsToInsert, { ordered: false });

    res.json({ success: true, message: "Students uploaded successfully", data: saved });

  } catch (err) {
    console.error("Error uploading students CSV:", err);

    // Handle duplicate key errors specifically
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: "Duplicate entry error", error: err.keyValue });
    }

    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
// Delete student
// --- Update student by ID ---
export const updateStudent = async (req, res) => {
  try {
    const { name, studentId, department, year, email, phone } = req.body;

    // Find student by MongoDB _id
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Update only provided fields
    student.name = name || student.name;
    student.studentId = studentId || student.studentId;
    student.department = department || student.department;
    student.year = year || student.year;
    student.email = email || student.email;
    student.phone = phone || student.phone;

    // Update password if provided
    // if (password) {
    //   const salt = await bcrypt.genSalt(10);
    //   student.password = await bcrypt.hash(password, salt);
    // }

    const updatedStudent = await student.save();
    updatedStudent.password = undefined; // Hide password in response
    res.json({ success: true, message: "Student updated successfully", data: updatedStudent });

  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// --- Delete student by ID ---
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.json({ success: true, message: "Student deleted successfully" });

  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
export const getStudentByStudentID = async (req, res) => {
  try {
 
    const student = await Student.findOne({ studentId: req.params.id }).select("-password");
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    res.json({ success: true, message: "Student fetched successfully", data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// import jwt from "jsonwebtoken";
// import Student from "../models/Student.js";

// @desc    Get logged-in student details
// @route   GET /api/student/me
// @access  Private
export const getStudentMe = async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    // Decode token
    const decoded = jwt.verify(token, "divyansh");

    // Fetch from DB to ensure student still exists
    const student = await Student.findById(decoded.id).select("-password");
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Return both DB info + token payload
    res.json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        studentId: student.studentId,
        department: student.department,
        year: student.year,
        email: student.email,
        phone: student.phone,
      },
      tokenData: decoded, // directly what was signed in token
    });
  } catch (err) {
    console.error("Error in getStudentMe:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
import Quiz from '../models/Quiz.js';
export const getStudentByName = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ success: false, message: "Name is required" });

    const student = await Student.findOne({ name });
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    res.status(200).json({
      success: true,
      data: {
        department: student.department,
        year: student.year,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const getStudentQuizzes = async (req, res) => {
  const { studentId } = req.params;

  try {
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const submissions = await QuizSubmission.find({ studentId })
      .populate('quizId', 'title description questions') // select quiz fields you want
      .sort({ submittedAt: -1 })
      .exec();
   
    return res.json({ success: true, data: submissions });
  } catch (err) {
    console.error('Error fetching student quizzes:', err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getQuizResult = async (req, res) => {
  try {
    const { submissionId } = req.params;

    // Find submission
    const submission = await QuizSubmission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    // Find quiz
    const quiz = await Quiz.findById(submission.quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    // Flatten questions across categories
    const allQuestions = quiz.categories.flatMap((cat) => cat.questions);

    let score = 0;
    const totalQuestions = allQuestions.length;

    // Section-wise breakdown
    const sections = quiz.categories.map((cat) => {
      let secScore = 0;
      cat.questions.forEach((q) => {
        const ans = submission.answers.find(
          (a) => a.questionId.toString() === q._id.toString()
        );
        if (ans) {
          if (ans.selectedOption === "Maybe") secScore += 0.5;
          else if (ans.selectedOption === q.correctAnswer) secScore += 1;
        }
      });
      score += secScore;
      return { name: cat.name, score: secScore, total: cat.questions.length };
    });

    return res.json({
      success: true,
      data: {
        quiz: { title: quiz.title },
        score,
        totalQuestions,
        sections,
        submittedAt: submission.createdAt,
      },
    });
  } catch (err) {
    console.error("Error in getQuizResult:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
export const getStudentSubmissions = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if student exists
    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Fetch submissions by studentId
    const submissions = await QuizSubmission.find({ studentId: id })
      .populate("quizId", "title totalMarks createdAt") // populate quiz details
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error("Error fetching student submissions:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

