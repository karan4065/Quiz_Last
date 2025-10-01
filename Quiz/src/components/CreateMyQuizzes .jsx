import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";

const CreateMyQuizzes = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Get facultyDetails from location OR localStorage
  const facultyDetails =
    location.state?.facultyDetails ||
    JSON.parse(localStorage.getItem("facultyDetails"));

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Redirect to login if no faculty details found
  useEffect(() => {
    if (!facultyDetails) {
      navigate("/");
    }
  }, [facultyDetails, navigate]);

  // ✅ Fetch quizzes only if facultyId is available
  useEffect(() => {
    if (facultyDetails?._id) {
      fetchQuizzes(facultyDetails._id);
    }
  }, [facultyDetails]);

  const fetchQuizzes = async (facultyId) => {
    setLoading(true);
    try {
        ///:facultyId/quizzes
      const res = await axios.get(
        `http://localhost:5000/api/faculty/${facultyId}/quizzes`
      );
      if (res.data.success) {
        setQuizzes(res.data.data);
      } else {
        setQuizzes([]);
      }
    } catch (err) {
      console.error("Error fetching quizzes:", err);
      setError("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;

    try {
      const res = await axios.delete(
        `http://localhost:5000/api/quiz/delete/${quizId}`
      );
      if (res.data.success) {
        setQuizzes((prev) => prev.filter((quiz) => quiz._id !== quizId));
        alert("Quiz deleted successfully!");
      } else {
        alert("Failed to delete quiz.");
      }
    } catch (err) {
      console.error("Error deleting quiz:", err);
      alert("Error deleting quiz.");
    }
  };

  return (
    <div className="flex bg-[#f5f6fa] min-h-screen font-sans text-gray-800">
      {/* Main Content */}
      <div className="flex-grow">
        <Navbar
          userName={`Hey, ${facultyDetails?.name || "Faculty"}`}
          onProfileClick={() => navigate(-1)}
        />

        <main className="p-8">
          <h2 className="text-2xl font-semibold mt-4 text-[#1e254a]">
            My Created Quizzes
          </h2>

          {loading && (
            <p className="mt-6 text-blue-600 font-medium">Loading quizzes...</p>
          )}
          {error && (
            <p className="mt-6 text-red-600 font-medium">{error}</p>
          )}

          {quizzes.length > 0 ? (
            <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  className="p-6 bg-white shadow-lg rounded-md border hover:shadow-xl transition"
                >
                  <h3 className="text-lg font-bold text-[#243278]">
                    {quiz.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Created: {new Date(quiz.createdAt).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Questions: {quiz.questions?.length || 0}
                  </p>

                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() =>
                        navigate("/quiz-details", { state: { quiz } })
                      }
                      className="flex-1 bg-[#243278] text-white py-2 rounded-md hover:bg-[#1b265f] transition"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteQuiz(quiz._id)}
                      className="flex-1 bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !loading && (
              <p className="mt-6 text-gray-600">
                You haven’t created any quizzes yet.
              </p>
            )
          )}
        </main>
      </div>
    </div>
  );
};

export default CreateMyQuizzes;
