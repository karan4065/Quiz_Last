import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaSignOutAlt, FaClipboardList } from "react-icons/fa";
import axios from "axios";
import logo  from '../../assets/logo.png';
import toast,{Toaster} from 'react-hot-toast'
const HomePageStudent = () => {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load student from localStorage
  useEffect(() => {
    const storedStudent = JSON.parse(localStorage.getItem("studentDetails"));
    if (!storedStudent) {
      navigate("/seeresult");
      return;
    }
    setStudent(storedStudent);
  }, [navigate]);

  // Fetch quizzes attempted by student
  useEffect(() => {
    if (!student) return;

    const fetchQuizzes = async () => {
      setLoading(true);
      try {
   const response = await axios.get(
  `https://quiz-last.onrender.com/api/student/${student._id}/quizzes`
);

        if (response.data.success) {
          setQuizzes(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching quizzes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [student]);

  if (!student) {
    return <div className="text-center text-red-600 mt-10">Loading student info...</div>;
  }

  if (loading) {
    return <div className="text-center mt-10 text-lg text-gray-600">Fetching quizzes...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50">
      {/* Navbar */}
      <nav className="w-full z-30 bg-gradient-to-r from-indigo-700 to-purple-700 text-white px-6 py-4 shadow-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="h-10 w-10 rounded bg-white shadow-md" />
          <span className="text-lg font-semibold">
            Student Dashboard
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            localStorage.removeItem("studentDetails");
            navigate("/seeresult");
          }}
          className="flex items-center bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg shadow text-white"
        >
          <FaSignOutAlt className="mr-2" /> Logout
        </motion.button>
      </nav>

      {/* Container */}
      <div className="max-w-6xl mx-auto p-8 space-y-10">
        {/* Student Info */}
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-lg rounded-xl p-8 border border-gray-100 hover:shadow-2xl transition-all"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">👩‍🎓 Student Information</h2>
          <div className="grid md:grid-cols-2 gap-4 text-gray-700">
            <p><strong>Name:</strong> {student.name}</p>
            <p><strong>ID:</strong> {student.studentId}</p>
            <p><strong>Email:</strong> {student.email}</p>
            <p><strong>Department:</strong> {student.department}</p>
            <p><strong>Year:</strong> {student.year}</p>
          </div>
        </motion.section>

        {/* Quizzes List */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
            <FaClipboardList className="mr-2 text-indigo-600" /> Quizzes Attempted
          </h2>

          {quizzes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-500 bg-white shadow rounded-lg p-6"
            >
              No quizzes attempted yet.
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz, index) => (
                <motion.div
                  key={quiz._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white rounded-xl shadow-lg p-6 cursor-pointer border border-gray-100 hover:ring-4 hover:ring-indigo-300 transition-all"
                >
                  <h3 className="text-lg font-bold text-indigo-700 mb-2">
                    {quiz.quizId?.title || "Untitled Quiz"}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Submitted on: {new Date(quiz.submittedAt).toLocaleString()}
                  </p>
                 <button
  onClick={() =>
    navigate("/student-quiz-result", {
      state: {
        student,
        submissionId: quiz._id,   // ✅ changed to submissionId
        quizTitle: quiz.quizId?.title, // pass quiz title too
      },
    })
  }
  className="w-full py-2 px-4 bg-gradient-to-r from-teal-500 to-indigo-500 text-white rounded-lg font-medium hover:from-teal-600 hover:to-indigo-600 transition"
>
  View Result
</button>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePageStudent;
