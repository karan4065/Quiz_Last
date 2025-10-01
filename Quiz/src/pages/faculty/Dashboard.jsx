import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Plot from "react-plotly.js";
import { motion } from "framer-motion";

// Animated number component
const AnimatedNumber = ({ value }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 800;
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

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [facultyDetails, setFacultyDetails] = useState(
    location.state?.facultyDetails || (() => {
      const stored = localStorage.getItem("facultyDetails");
      return stored ? JSON.parse(stored) : null;
    })()
  );

  useEffect(() => {
    if (!facultyDetails) {
      navigate("/");
    }
  }, [facultyDetails, navigate]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState(facultyDetails?.isAdmin ? "admin" : "faculty");

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

  const sidebarRef = useRef();

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
      const response = await axios.get("http://localhost:5000/api/faculty/getall");
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
      .put(`http://localhost:5000/api/faculty/update/${faculty._id}`, { name, email })
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
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("CSV uploaded!");
      fetchAllFaculties();
    } catch (err) {
      console.error(err);
      alert("CSV upload failed");
    }
  };



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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("facultyDetails");
    navigate("/");
  };

  const handleCreateQuiz = () => {
    navigate("/faculty-dashboard", { state: { facultyDetails } });
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
      state: { quizId, facultyDetails, role, selectedFacultyId },
    });
  };

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

  // Compute counts for completed-quiz / in-progress
  const completedQuizCount = quizzes.filter((q) => {
    const comp = q.completed?.length || 0;
    const lim = q.limit || 0;
    return lim > 0 && comp >= lim;
  }).length;
  const inProgressQuizCount = quizzes.filter((q) => {
    const comp = q.completed?.length || 0;
    const lim = q.limit || 0;
    // either some completed but not full, or zero but limit > 0
    return lim > 0 && comp < lim;
  }).length;

  const completedStudents = selectedQuiz?.completed?.length || 0;
  const remainingStudents = (selectedQuiz?.limit || 70) - completedStudents;

  return (
    <div className="flex min-h-screen font-sans bg-gray-50 text-gray-800">
      {/* Sidebar */}
      {sidebarOpen && (
        <aside
          ref={sidebarRef}
          className="h-screen w-64 bg-white p-6 fixed z-20 flex flex-col justify-between shadow-xl rounded-tr-xl rounded-br-xl border-l-2 border-blue-500"
        >
          <div>
            <h2 className="text-xl font-bold mb-6 border-b border-blue-500 pb-2">
              Faculty Profile
            </h2>
            <div className="space-y-3 text-sm bg-gray-100 p-4 rounded-md shadow-inner">
              <div>
                <span className="font-semibold">Name:</span> {facultyDetails.name}
              </div>
              <div>
                <span className="font-semibold">Email:</span> {facultyDetails.email}
              </div>
              <div>
                <span className="font-semibold">Department:</span> {facultyDetails.department}
              </div>
              {facultyDetails.isAdmin && (
                <div>
                  <span className="font-semibold">Role:</span>{" "}
                  <select
                    value={role}
                    onChange={(e) => {
                      setRole(e.target.value);
                      setSelectedFacultyId(null);
                      setQuizzes([]);
                      setSelectedQuizId("");
                    }}
                    className="ml-2 border border-blue-500 rounded-md px-2 py-1 bg-white text-blue-500"
                  >
                    <option value="admin">Admin</option>
                    <option value="faculty">Faculty</option>
                  </select>
                </div>
              )}
              {!facultyDetails.isAdmin && (
                <div>
                  <span className="font-semibold">Role:</span> Faculty
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-blue-500 hover:brightness-110 w-full py-2 rounded-md transition font-medium shadow-md mt-6 text-white"
          >
            Logout
          </button>
        </aside>
      )}

      <div className="flex-grow">
        <Navbar
          userName={`Hey, ${facultyDetails.name}`}
          onProfileClick={() => setSidebarOpen((prev) => !prev)}
        />

        <main className="p-8">
          {/* Admin Section */}
          {role === "admin" && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">All Faculties</h2>

              {/* CSV Upload */}
              <div className="mb-4">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
                  className="mr-2"
                />
                <button
                  onClick={handleUploadCSV}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                >
                  Upload CSV
                </button>
              </div>

              {/* Faculty Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {faculties.map((fac) => (
                  <div
                    key={fac._id}
                    className="bg-white p-4 rounded-lg shadow-md border hover:bg-blue-50"
                  >
                    <h3 className="font-semibold">{fac.name}</h3>
                    <p>Email: {fac.email}</p>
                    <p>Department: {fac.department}</p>
                    <p>Subjects: {fac.subjects.join(", ")}</p>
                    <div className="mt-2 space-x-2">
                      <button
                        onClick={() => handleUpdateFaculty(fac)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded"
                      >
                        Update
                      </button>
                      <button
                        onClick={() => handleDeleteFaculty(fac._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => {
                          setSelectedFacultyId(fac._id);
                          fetchQuizzes(fac._id);
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                      >
                        View Quizzes
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {selectedFacultyId && quizzes.length === 0 && (
                <div className="mt-6 text-gray-600">
                  No quizzes created by this faculty yet.
                </div>
              )}

              {selectedFacultyId && quizzes.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h3 className="font-semibold text-lg mb-2">
                    Quizzes for{" "}
                    {faculties.find((f) => f._id === selectedFacultyId)?.name}
                  </h3>
                  {quizzes.map((q) => (
                    <div
                      key={q._id}
                      className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm"
                    >
                      <span>
                        {q.title} ({q.subject})
                      </span>
                      <div className="space-x-2">
                        <button
                          onClick={() => handleUpdateQuiz(q._id)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleDeleteQuiz(q._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Faculty Section */}
          {role === "faculty" && quizzes.length === 0 ? (
            <div className="text-center mt-20">
              <h2 className="text-2xl font-semibold">No quizzes created yet!</h2>
              <button
                onClick={handleCreateQuiz}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium"
              >
                Create Quiz
              </button>
            </div>
          ) : role === "faculty" && (
            <div className="space-y-6">
              {/* First Row: Completed / In‑Progress Quizzes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <motion.div
                  className="bg-white text-green-600 rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="font-semibold mb-2 text-lg">Completed Quizzes</h3>
                  <p className="text-4xl font-bold">
                    <AnimatedNumber value={completedQuizCount} />
                  </p>
                </motion.div>

                <motion.div
                  className="bg-white text-yellow-600 rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <h3 className="font-semibold mb-2 text-lg">In Progress Quizzes</h3>
                  <p className="text-4xl font-bold">
                    <AnimatedNumber value={inProgressQuizCount} />
                  </p>
                </motion.div>
              </div>

              {/* Second Row: Total Quizzes & Create Quiz */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <motion.div
                  className="bg-white text-blue-500 rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h3 className="font-semibold mb-2 text-lg">Total Quizzes</h3>
                  <p className="text-4xl font-bold">{quizzes.length}</p>
                </motion.div>

                <motion.div
                  className="bg-white text-blue-500 rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center cursor-pointer hover:scale-105"
                  whileHover={{ scale: 1.05 }}
                  onClick={handleCreateQuiz}
                >
                  <h3 className="font-semibold mb-2 text-lg">Create Quiz</h3>
                  <p className="text-3xl font-bold">+</p>
                </motion.div>
              </div>

              {/* Subject & Quiz selection */}
              <div className="mt-4 flex flex-col sm:flex-row gap-4">
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

              {/* Stats Cards */}
              {selectedQuiz && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                  <motion.div
                    className="bg-white text-blue-500 rounded-2xl p-6 shadow-lg text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h3 className="font-semibold mb-2 text-lg">Completed</h3>
                    <p className="text-4xl font-bold">
                      <AnimatedNumber value={completedStudents} />
                    </p>
                  </motion.div>

                  <motion.div
                    className="bg-white text-blue-500 rounded-2xl p-6 shadow-lg text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <h3 className="font-semibold mb-2 text-lg">Remaining</h3>
                    <p className="text-4xl font-bold">
                      <AnimatedNumber value={remainingStudents} />
                    </p>
                  </motion.div>
                </div>
              )}

              {/* Charts */}
              {selectedQuiz && (
                <div className="mt-6 flex flex-col items-center space-y-6">
                  <Plot
                    data={[
                      {
                        values: [completedStudents, remainingStudents],
                        labels: ["Completed", "Remaining"],
                        type: "pie",
                        marker: { colors: ["#00bfff", "#87cefa"] },
                        textinfo: "label+percent",
                        textposition: "inside",
                        hole: 0.4,
                      },
                    ]}
                    layout={{
                      title: selectedQuiz?.title + " - Completion Status",
                      paper_bgcolor: "white",
                      plot_bgcolor: "white",
                      font: { color: "#1e3a8a" },
                      height: 400,
                      width: 400,
                    }}
                    config={{ displayModeBar: false }}
                  />

                  <Plot
                    data={[
                      {
                        x: quizzes.map((q) => `${q.subject} - ${q.title}`),
                        y: quizzes.map((q) => q.completed?.length || 0),
                        name: "Completed",
                        type: "bar",
                        marker: { color: "#00bfff" },
                      },
                      {
                        x: quizzes.map((q) => `${q.subject} - ${q.title}`),
                        y: quizzes.map((q) => (q.limit || 70) - (q.completed?.length || 0)),
                        name: "Remaining",
                        type: "bar",
                        marker: { color: "#87cefa" },
                      },
                    ]}
                    layout={{
                      title: "All Quizzes Completion Status",
                      barmode: "stack",
                      height: 450,
                      width: 900,
                      paper_bgcolor: "white",
                      plot_bgcolor: "white",
                      font: { color: "#1e3a8a" },
                      yaxis: {
                        title: "Students",
                        range: [0, Math.max(...quizzes.map((q) => q.limit || 70))],
                      },
                      xaxis: { tickangle: -45, automargin: true },
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
