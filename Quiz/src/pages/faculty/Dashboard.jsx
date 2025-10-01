import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Plot from "react-plotly.js";
import { motion } from "framer-motion";
import {
  CircularProgressbarWithChildren,
  buildStyles
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

// Animated number component for smooth counting
const AnimatedNumber = ({ value }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 1200;
    const stepTime = 16;
    const increment = Math.ceil(end / (duration / stepTime));

    const counter = setInterval(() => {
      start += increment;
      if (start >= end) {
        start = end;
        clearInterval(counter);
      }
      setCount(start);
    }, stepTime);

    return () => clearInterval(counter);
  }, [value]);

  return <span>{count}</span>;
};

// Smooth animated progress circle with gradient
const AnimatedProgressCircle = ({ value, colors, displayValue }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const stepTime = 16;
    const increment = (value * stepTime) / duration;

    const interval = setInterval(() => {
      start += increment;
      if (start >= value) {
        start = value;
        clearInterval(interval);
      }
      setProgress(start);
    }, stepTime);

    return () => clearInterval(interval);
  }, [value]);

  return (
    <CircularProgressbarWithChildren
      value={progress}
      styles={buildStyles({
        pathColor: `url(#gradient)`,
        trailColor: "#f0fdf4",
        textColor: "#111827",
        textSize: "18px",
      })}
    >
      <svg style={{ height: 0 }}>
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            {colors.map((c, i) => (
              <stop
                key={i}
                offset={`${(i / (colors.length - 1)) * 100}%`}
                stopColor={c}
              />
            ))}
          </linearGradient>
        </defs>
      </svg>
      {/* Show exact value, not percentage */}
      <div className="text-xl font-semibold">{displayValue}</div>
    </CircularProgressbarWithChildren>
  );
};

const Dashboard = ({ role: propRole }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [facultyDetails, setFacultyDetails] = useState(
    location.state?.facultyDetails ||
      (() => {
        const stored = localStorage.getItem("facultyDetails");
        return stored ? JSON.parse(stored) : null;
      })()
  );

  useEffect(() => {
    if (!facultyDetails) {
      navigate("/");
    }
  }, [facultyDetails, navigate]);

  const [role, setRole] = useState(
    propRole || (facultyDetails?.isAdmin ? "admin" : "faculty")
  );
  const [quizzes, setQuizzes] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(
    facultyDetails?.subjects?.[0] || ""
  );
  const [subjectQuizzes, setSubjectQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ---------------- API CALLS ----------------
  const fetchQuizzes = async (facultyId = null) => {
    if (!facultyDetails?._id && role === "faculty") return;
    setLoading(true);
    setError(null);
    try {
      let url = "";
      if (role === "faculty") {
        url = `http://localhost:5000/api/faculty/${facultyDetails._id}/quizzes`;
      } else if (role === "admin" && facultyId) {
        url = `http://localhost:5000/api/faculty/${facultyId}/quizzes`;
      } else {
        setQuizzes([]);
        setSelectedQuizId("");
        setLoading(false);
        return;
      }

      const response = await axios.get(url);
      const data = response.data.data || [];
      setQuizzes(data);

      if (data.length > 0) {
        setSelectedQuizId(data[0]._id);
      } else {
        setSelectedQuizId("");
      }
    } catch (err) {
      console.error("fetchQuizzes error:", err);
      setError("Failed to fetch quizzes");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllFaculties = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5000/api/faculty/getall"
      );
      setFaculties(response.data.data || []);
    } catch (err) {
      console.error("fetchAllFaculties error:", err);
      setError("Failed to fetch faculties");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFaculty = async (id) => {
    if (!window.confirm("Delete this faculty?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/faculty/delete/${id}`);
      alert("Faculty deleted successfully");
      fetchAllFaculties();
      if (selectedFacultyId === id) {
        setSelectedFacultyId(null);
        setQuizzes([]);
      }
    } catch (err) {
      console.error("handleDeleteFaculty error:", err);
      alert("Failed to delete faculty");
    }
  };

  const handleUpdateFaculty = (faculty) => {
    const name = prompt("Update name:", faculty.name) ?? faculty.name;
    const email = prompt("Update email:", faculty.email) ?? faculty.email;
    axios
      .put(`http://localhost:5000/api/faculty/update/${faculty._id}`, {
        name,
        email
      })
      .then(() => {
        alert("Faculty updated!");
        fetchAllFaculties();
      })
      .catch((err) => {
        console.error("handleUpdateFaculty error:", err);
        alert("Failed to update faculty");
      });
  };

  const handleUploadCSV = async () => {
    if (!csvFile) return alert("Select CSV file");
    const formData = new FormData();
    formData.append("file", csvFile);
    try {
      await axios.post("http://localhost:5000/api/faculty/upload-csv", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("CSV uploaded!");
      fetchAllFaculties();
    } catch (err) {
      console.error(err);
      alert("CSV upload failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("facultyDetails");
    navigate("/");
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/quiz/${quizId}`);
      alert("Quiz deleted successfully!");
      fetchQuizzes(selectedFacultyId || undefined);
    } catch (err) {
      console.error("handleDeleteQuiz error:", err);
      alert("Failed to delete quiz");
    }
  };

  const handleUpdateQuiz = (quizId) => {
    navigate("/update-quiz", {
      state: { quizId, facultyDetails, role, selectedFacultyId }
    });
  };

  // ---------------- EFFECTS ----------------
  useEffect(() => {
    if (role === "faculty") {
      fetchQuizzes();
    } else if (role === "admin") {
      fetchAllFaculties();
    }
  }, [facultyDetails, role]);

  useEffect(() => {
    if (!selectedSubject) {
      setSubjectQuizzes([]);
      setSelectedQuizId("");
      return;
    }
    const filtered = quizzes.filter((q) => q.subject === selectedSubject);
    setSubjectQuizzes(filtered);

    if (filtered.length > 0) {
      const exists = filtered.find((q) => q._id === selectedQuizId);
      if (!exists) {
        setSelectedQuizId(filtered[0]._id);
      }
    } else {
      setSelectedQuizId("");
    }
  }, [selectedSubject, quizzes]);

  useEffect(() => {
    if (!selectedQuizId) {
      setSelectedQuiz(null);
      return;
    }
    const q = quizzes.find((q) => q._id === selectedQuizId);
    setSelectedQuiz(q || null);
  }, [selectedQuizId, quizzes]);

  // ---------------- QUIZ COUNTS ----------------
  const completedQuizCount = quizzes.filter((q) => {
    const comp = q.completed?.length || 0;
    const lim = q.limit || 0;
    return lim > 0 && comp >= lim;
  }).length;

  const inProgressQuizCount = quizzes.filter((q) => {
    const comp = q.completed?.length || 0;
    const lim = q.limit || 0;
    return lim > 0 && comp < lim;
  }).length;

  const pendingQuizCount = quizzes.length - completedQuizCount;

  const completedStudents = selectedQuiz?.completed?.length || 0;
  const remainingStudents = (selectedQuiz?.limit || 70) - completedStudents;

  // ---------------- UI ----------------
  if (!facultyDetails) {
    return (
      <div className="p-6 font-sans text-gray-800">
        No faculty details found.
      </div>
    );
  }
  if (loading) {
    return <div className="p-6 font-sans text-gray-800">Loading...</div>;
  }
  if (error) {
    return <div className="p-6 font-sans text-red-600">Error: {error}</div>;
  }

  return (
    <div className="flex min-h-screen font-sans bg-gray-50 text-gray-800">
      <div className="flex-grow">
        <Navbar userName={`Hey, ${facultyDetails.name}`} />

        <main className="p-8">
          {/* FACULTY SECTION */}
          {role === "faculty" && (
            <div className="space-y-8">
              {/* Top Circular Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Completed */}
                <motion.div
                  className="bg-white rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div style={{ width: 100, height: 100 }}>
                    <AnimatedProgressCircle
                      value={completedQuizCount}
                      displayValue={completedQuizCount}
                      colors={["#16a34a", "#4ade80"]}
                    />
                  </div>
                  <h3 className="font-semibold mt-4 text-green-600">
                    Completed Quizzes
                  </h3>
                </motion.div>

                {/* Pending */}
                <motion.div
                  className="bg-white rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <div style={{ width: 100, height: 100 }}>
                    <AnimatedProgressCircle
                      value={pendingQuizCount}
                      displayValue={pendingQuizCount}
                      colors={["#f97316", "#fb923c"]}
                    />
                  </div>
                  <h3 className="font-semibold mt-4 text-orange-600">
                    Pending Quizzes
                  </h3>
                </motion.div>

                {/* Total */}
                <motion.div
                  className="bg-white rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div style={{ width: 100, height: 100 }}>
                    <AnimatedProgressCircle
                      value={quizzes.length}
                      displayValue={quizzes.length}
                      colors={["#3b82f6", "#60a5fa"]}
                    />
                  </div>
                  <h3 className="font-semibold mt-4 text-blue-600">
                    Total Quizzes
                  </h3>
                </motion.div>
              </div>

              {/* Subject & Quiz Selection */}
              <div className="mt-6 flex flex-col sm:flex-row gap-6">
                <label className="font-medium">
                  Select Subject:{" "}
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="ml-2 border border-blue-500 rounded-md px-3 py-2 bg-white text-blue-500 shadow-sm focus:ring focus:ring-blue-500"
                  >
                    {facultyDetails.subjects.map((subj, idx) => (
                      <option key={idx} value={subj}>
                        {subj}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="font-medium">
                  Select Quiz:{" "}
                  <select
                    value={selectedQuizId}
                    onChange={(e) => setSelectedQuizId(e.target.value)}
                    className="ml-2 border border-blue-500 rounded-md px-3 py-2 bg-white text-blue-500 shadow-sm focus:ring focus:ring-blue-500"
                  >
                    {subjectQuizzes.map((quiz) => (
                      <option key={quiz._id} value={quiz._id}>
                        {quiz.title}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Pie Chart for Selected Quiz */}
              {selectedQuiz && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <motion.div
                    className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h3 className="font-semibold mb-4 text-lg text-blue-600">
                      {selectedQuiz.title} - Completion Status
                    </h3>
                    <Plot
                      data={[
                        {
                          values: [completedStudents, remainingStudents],
                          labels: ["Completed", "Remaining"],
                          type: "pie",
                          marker: {
                            colors: ["#16a34a", "#f97316"],
                            line: { color: "#fff", width: 2 }
                          },
                          textinfo: "label+value", // show label and actual value
                          hole: 0.4
                        }
                      ]}
                      layout={{
                        paper_bgcolor: "white",
                        plot_bgcolor: "white",
                        font: { color: "#1e3a8a", size: 14 },
                        height: 320,
                        width: 320
                      }}
                      config={{ displayModeBar: false }}
                    />
                  </motion.div>

                  {/* Completed vs Remaining Stats */}
                  <div className="flex flex-col gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                      <h3 className="font-semibold mb-2 text-green-600">
                        Completed
                      </h3>
                      <p className="text-3xl font-bold">
                        <AnimatedNumber value={completedStudents} />
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                      <h3 className="font-semibold mb-2 text-orange-600">
                        Remaining
                      </h3>
                      <p className="text-3xl font-bold">
                        <AnimatedNumber value={remainingStudents} />
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bar Graph for All Quizzes */}
              {quizzes.length > 0 && (
                <div className="mt-10 bg-white p-6 rounded-xl shadow-lg">
                  <h3 className="font-semibold mb-6 text-lg text-blue-600">
                    All Quizzes Completion Status
                  </h3>
                  <Plot
                    data={[
                      {
                        x: quizzes.map((q) => `${q.subject} - ${q.title}`),
                        y: quizzes.map((q) => q.completed?.length || 0),
                        name: "Completed",
                        type: "bar",
                        marker: {
                          color: quizzes.map(
                            (_, idx) => `rgba(${22 + idx * 5},163,74,0.8)`
                          )
                        }
                      },
                      {
                        x: quizzes.map((q) => `${q.subject} - ${q.title}`),
                        y: quizzes.map(
                          (q) => (q.limit || 70) - (q.completed?.length || 0)
                        ),
                        name: "Remaining",
                        type: "bar",
                        marker: {
                          color: quizzes.map(
                            (_, idx) => `rgba(${249 + idx * 2},115,22,0.8)`
                          )
                        }
                      }
                    ]}
                    layout={{
                      barmode: "group",
                      height: 450,
                      paper_bgcolor: "white",
                      plot_bgcolor: "white",
                      font: { color: "#1e3a8a", size: 14 },
                      margin: { t: 30, b: 120 },
                      yaxis: {
                        title: "Students",
                        range: [0, Math.max(...quizzes.map((q) => q.limit || 70))],
                        gridcolor: "#e5e7eb"
                      },
                      xaxis: {
                        tickangle: -30,
                        automargin: true
                      },
                      legend: { orientation: "h", y: -0.3 }
                    }}
                    config={{ displayModeBar: false }}
                  />
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
