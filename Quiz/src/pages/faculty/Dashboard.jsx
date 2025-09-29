import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Plot from "react-plotly.js";

const DEFAULT_TOTAL_STUDENTS_PER_QUIZ = 70;

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const facultyDetails = location.state?.facultyDetails;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showGraph, setShowGraph] = useState(false);

  const sidebarRef = useRef();

  // Fetch quizzes
  useEffect(() => {
    if (!facultyDetails?._id) return;
    const fetchQuizzesByFaculty = async () => {
      setLoading(true);
      setError(null);
      try {
       const response = await axios.get(
  `http://localhost:5000/api/faculty/${facultyDetails._id}/quizzes`
);

        console.log(response.data.data)
        const data = response.data.data;
        if (Array.isArray(data)) {
          setQuizzes(data);
          if (data.length > 0) {
            setSelectedQuizId(data[0]._id);
            setSelectedQuiz(data[0]);
          } else {
            setSelectedQuiz(null);
          }
        } else {
          setError("Unexpected response data");
          setQuizzes([]);
          setSelectedQuiz(null);
        }
      } catch (err) {
        setError("Failed to fetch quizzes");
        setQuizzes([]);
        setSelectedQuiz(null);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzesByFaculty();
  }, [facultyDetails]);

  // Update selected quiz
  useEffect(() => {
    if (selectedQuizId && Array.isArray(quizzes)) {
      const quiz = quizzes.find((q) => q._id === selectedQuizId);
      setSelectedQuiz(quiz || null);
    }
  }, [selectedQuizId, quizzes]);

  if (!facultyDetails) {
    return (
      <div className="p-6 font-sans">
        <h2>No faculty details found. Please login or navigate properly.</h2>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="p-6 font-sans">
        <h2>Loading quizzes...</h2>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6 font-sans text-red-600">
        <h2>Error: {error}</h2>
      </div>
    );
  }
  if (!selectedQuiz) {
    return (
      <div className="p-6 font-sans">
        <h2>No quizzes found for faculty: {facultyDetails.name || ""}</h2>
      </div>
    );
  }

  const totalQuizzes = quizzes.length;
  const completedStudents = selectedQuiz.completed?.length || 0;
  const remainingStudents = DEFAULT_TOTAL_STUDENTS_PER_QUIZ - completedStudents;

  return (
    <div className="flex bg-[#f5f6fa] min-h-screen font-sans text-gray-800">
      {/* Sidebar */}
      {sidebarOpen && (
        <aside
          ref={sidebarRef}
          className="h-screen w-1/5 bg-[#243278] text-white p-6 shadow-xl fixed z-20 flex flex-col justify-between"
        >
          <div>
            <h2 className="text-xl font-bold mb-6 border-b pb-2 border-gray-500">
              Faculty Profile
            </h2>
            <div className="space-y-3 text-sm bg-[#243278] p-4 rounded-md shadow-inner">
              <div>
                <span className="font-semibold">Name:</span> {facultyDetails.name}
              </div>
              <div>
                <span className="font-semibold">Email:</span> {facultyDetails.email}
              </div>
              <div>
                <span className="font-semibold">Department:</span>{" "}
                {facultyDetails.department}
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("/")}
            className="bg-[#cd354d] w-full py-2 rounded-md hover:bg-red-600 transition text-sm font-medium shadow-md"
          >
            Logout
          </button>
        </aside>
      )}

      {/* Main Content */}
      <div
        className={`flex-grow transition-all duration-300 ${
          sidebarOpen ? "ml-[20%]" : ""
        }`}
      >
        <Navbar
          userName={`Hey, ${facultyDetails.name}`}
          onProfileClick={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="p-8">
          {/* Header with Select Quiz */}
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <h2 className="text-2xl font-semibold mt-4 text-[#243278]">
              Quiz Dashboard
            </h2>
            <div className="mt-4 sm:mt-0">
              <label className="font-medium text-[#243278]">
                Select Quiz:{" "}
                <select
                  value={selectedQuizId}
                  onChange={(e) => setSelectedQuizId(e.target.value)}
                  className="ml-2 border rounded-md px-3 py-2 shadow-sm focus:ring focus:border-[#243278]"
                >
                  {quizzes.map((quiz) => (
                    <option key={quiz._id} value={quiz._id}>
                      {quiz.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
            <div className="bg-[#243278] text-white rounded-lg p-6 shadow-md text-center">
              <h3 className="font-semibold mb-2">Total Quizzes</h3>
              <p className="text-3xl font-bold">{totalQuizzes}</p>
            </div>
            <div
              onClick={() =>
                navigate("/faculty-dashboard", { state: { facultyDetails } })
              }
              className="bg-[#243278] text-xl font-semibold text-white rounded-lg p-6 shadow-md text-center cursor-pointer hover:bg-[#1e285d] transition"
            >
              + Create Quiz
            </div>
          </div>

          {/* Stats */}
            <div className="grid grid-cols-1 gap-6 mt-8">
      {/* Single Box */}
      <div className="bg-[#243278] text-white rounded-lg p-6 shadow-md text-center">
        <h3 className="font-semibold mb-2">Enrolled Students</h3>
        <p className="text-2xl font-bold">
          {DEFAULT_TOTAL_STUDENTS_PER_QUIZ}
        </p>
        <button
          onClick={() => setShowGraph(!showGraph)}
          className="mt-4 px-4 py-2 bg-white text-[#243278] font-semibold rounded-lg shadow hover:bg-gray-100 transition"
        >
          {showGraph ? "Hide Progress" : "Show Progress"}
        </button>
      </div>

      {/* Bar Graph (only visible when button clicked) */}
      {showGraph && (
        <div className="mt-10 flex justify-center">
          <Plot
            data={[
              {
                x: ["Completed", "Remaining"],
                y: [completedStudents, remainingStudents],
                type: "bar",
                marker: { color: ["#243278", "#f44336"] },
                width: 0.4,
              },
            ]}
            layout={{
              title: "Quiz Completion Status",
              height: 400,
              width: 400,
              margin: { t: 40, b: 40, l: 40, r: 20 },
              font: { family: "'Poppins', sans-serif" },
            }}
            config={{ displayModeBar: false }}
          />
        </div>
      )}
    </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
