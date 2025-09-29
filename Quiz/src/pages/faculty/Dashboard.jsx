import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Plot from "react-plotly.js";
import axios from "axios";
import Navbar from "../../components/Navbar";

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

  const sidebarRef = useRef();

  useEffect(() => {
    if (!facultyDetails?._id) return;
    const fetchQuizzesByFaculty = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `http://localhost:5000/api/faculty/${facultyDetails._id}`
        );
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

  useEffect(() => {
    if (selectedQuizId && Array.isArray(quizzes)) {
      const quiz = quizzes.find((q) => q._id === selectedQuizId);
      setSelectedQuiz(quiz || null);
    }
  }, [selectedQuizId, quizzes]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };
    if (sidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen]);

  if (!facultyDetails) {
    return (
      <div style={{ padding: 20, fontFamily: "'Poppins', sans-serif" }}>
        <h2>No faculty details found. Please login or navigate properly.</h2>
      </div>
    );
  }
  if (loading) {
    return (
      <div style={{ padding: 20, fontFamily: "'Poppins', sans-serif" }}>
        Loading quizzes...
      </div>
    );
  }
  if (error) {
    return (
      <div style={{ padding: 20, color: "red", fontFamily: "'Poppins', sans-serif" }}>
        <h3>Error: {error}</h3>
      </div>
    );
  }
  if (!selectedQuiz) {
    return (
      <div style={{ padding: 20, fontFamily: "'Poppins', sans-serif" }}>
        <h3>No quizzes found for faculty: {facultyDetails.name || ""}</h3>
      </div>
    );
  }

  const totalQuizzes = Array.isArray(quizzes) ? quizzes.length : 0;
  const completedStudentsSelectedQuiz = selectedQuiz.completed?.length || 0;
  const remainingStudentsSelectedQuiz =
    DEFAULT_TOTAL_STUDENTS_PER_QUIZ - completedStudentsSelectedQuiz;

  return (
    <div
      style={{
        fontFamily: "'Poppins', sans-serif",
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
        display: "flex",
      }}
    >
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        style={{
          position: "fixed",
          left: sidebarOpen ? 0 : "-280px",
          top: 0,
          bottom: 0,
          width: 280,
          backgroundColor: "#243278",
          color: "white",
          padding: "20px",
          boxShadow: "2px 0 8px rgba(0,0,0,0.2)",
          transition: "left 0.3s ease-in-out",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 22,
              fontWeight: "700",
              marginBottom: 16,
              borderBottom: "2px solid rgba(255,255,255,0.3)",
              paddingBottom: 6,
            }}
          >
            Faculty Profile
          </h2>
          <div style={{ fontSize: 14, lineHeight: 1.5 }}>
            <p>
              <strong>Name:</strong> {facultyDetails.name}
            </p>
            <p>
              <strong>Email:</strong> {facultyDetails.email}
            </p>
            <p>
              <strong>UID:</strong> {facultyDetails.uid}
            </p>
            <p>
              <strong>Department:</strong> {facultyDetails.department}
            </p>
            <p>
              <strong>Joined On:</strong>{" "}
              {new Date(facultyDetails.createdAt).toLocaleDateString()}
            </p>
            <p>
              <strong>Last Update:</strong>{" "}
              {new Date(facultyDetails.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/")}
          style={{
            backgroundColor: "#cd354d",
            border: "none",
            padding: "12px",
            borderRadius: 6,
            cursor: "pointer",
            color: "white",
            fontWeight: "600",
            fontSize: 16,
            marginTop: 20,
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#b22f46")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#cd354d")}
        >
          Logout
        </button>
      </aside>

      {/* Main content wrapper */}
      <div
        style={{
          marginLeft: sidebarOpen ? 280 : 0,
          flexGrow: 1,
          transition: "margin-left 0.3s ease-in-out",
          padding: 30,
          maxWidth: 900,
          margin: "auto",
          width: "100%",
        }}
      >
        {/* Navbar on Top */}
        <Navbar />
        
        {/* Dashboard Header */}
        <h2 style={{ color: "#243278", marginBottom: 30, marginTop: 20 }}>
          Quiz Dashboard
        </h2>

        {/* Summary Card: Total Quizzes */}
        <div
          style={{
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              flex: "1 1 220px",
              backgroundColor: "#243278",
              color: "white",
              borderRadius: 10,
              padding: 20,
              boxShadow: "0 6px 12px rgb(0 0 0 / 0.1)",
              textAlign: "center",
            }}
          >
            <h3 style={{ marginBottom: 10, fontWeight: "600" }}>Total Quizzes</h3>
            <p style={{ fontSize: 32, fontWeight: "700", margin: 0 }}>
              {totalQuizzes}
            </p>
          </div>

          <div
            onClick={() => navigate("/faculty-dashboard", { state: { facultyDetails } })}
            style={{
              flex: "1 1 220px",
              backgroundColor: "#4e73df",
              borderRadius: 10,
              padding: 20,
              boxShadow: "0 6px 12px rgb(0 0 0 / 0.1)",
              color: "white",
              fontWeight: "700",
              fontSize: 20,
              textAlign: "center",
              cursor: "pointer",
              userSelect: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2e4acb")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#4e73df")}
            title="Create a new quiz"
          >
            + Create Quiz
          </div>
        </div>

        {/* Quiz Selector */}
        <div style={{ marginBottom: 30, textAlign: "center" }}>
          <label style={{ fontWeight: "600", fontSize: 16 }}>
            Select Quiz:{" "}
            <select
              value={selectedQuizId}
              onChange={(e) => setSelectedQuizId(e.target.value)}
              style={{
                fontSize: 16,
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid #ccc",
                minWidth: 200,
                cursor: "pointer",
              }}
            >
              {quizzes.map((quiz) => (
                <option key={quiz._id} value={quiz._id}>
                  {quiz.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Selected Quiz Stats */}
        <div
          style={{
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              flex: "1 1 200px",
              backgroundColor: "#1cc88a",
              color: "white",
              borderRadius: 10,
              padding: 20,
              boxShadow: "0 6px 12px rgb(0 0 0 / 0.1)",
              textAlign: "center",
            }}
          >
            <h3 style={{ marginBottom: 10, fontWeight: "600" }}>
              Completed Students
            </h3>
            <p style={{ fontSize: 28, fontWeight: "700", margin: 0 }}>
              {completedStudentsSelectedQuiz} / {DEFAULT_TOTAL_STUDENTS_PER_QUIZ}
            </p>
          </div>
          <div
            style={{
              flex: "1 1 200px",
              backgroundColor: "#e74a3b",
              color: "white",
              borderRadius: 10,
              padding: 20,
              boxShadow: "0 6px 12px rgb(0 0 0 / 0.1)",
              textAlign: "center",
            }}
          >
            <h3 style={{ marginBottom: 10, fontWeight: "600" }}>
              Remaining Students
            </h3>
            <p style={{ fontSize: 28, fontWeight: "700", margin: 0 }}>
              {remainingStudentsSelectedQuiz} / {DEFAULT_TOTAL_STUDENTS_PER_QUIZ}
            </p>
          </div>
        </div>

        {/* Plotly Pie Chart */}
        <div style={{ maxWidth: 500, margin: "0 auto" }}>
          <Plot
            data={[
              {
                values: [completedStudentsSelectedQuiz, remainingStudentsSelectedQuiz],
                labels: ["Completed", "Remaining"],
                type: "pie",
                marker: {
                  colors: ["#1cc88a", "#e74a3b"],
                },
                textinfo: "label+percent",
                insidetextorientation: "radial",
              },
            ]}
            layout={{
              height: 350,
              width: 350,
              margin: { t: 0, b: 0, l: 0, r: 0 },
              font: { family: "'Poppins', sans-serif" },
            }}
            config={{ displayModeBar: false }}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
