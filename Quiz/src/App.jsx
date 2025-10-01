import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Quiz from "./pages/student/Quiz";
import ThankYou from "./pages/student/ThankYou";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import StudentResult from "./pages/faculty/StudentResult";
import StudentDetails from "./pages/student/StudentDetails";
import StudentLogin from "./pages/StudentLogin";
import Home from "./pages/Home";
import QuizResults from "./pages/faculty/QuizResults";
import StStudentQuizResult from "./pages/student/StStudentQuizResult";
import Dashboard from "./pages/faculty/Dashboard";
import AdminDashboard from "./pages/faculty/AdminDashboard";
import AddStudent from "./pages/faculty/Addstudent";
import CreateQuiz from "./pages/faculty/CreateQuiz";
import CreateMyQuizzes from "./components/CreateMyQuizzes ";
// import AddStudent from "./pages/faculty/Addstudent";
// import CreateQuiz from "./pages/faculty/CreateQuiz";
// import CreateMyQuizzes from "./components/CreateMyQuizzes";
import Sidebar from "./components/Sidebar";

// DashboardLayout updated to accept facultyDetails, role, and onRoleChange and pass to Sidebar
const DashboardLayout = ({
  children,
  onLogout,
  isLoggedIn,
  facultyDetails,
  role,
  onRoleChange,
}) => {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar
        isLoggedIn={isLoggedIn}
        onLogout={onLogout}
        facultyDetails={facultyDetails}
        role={role}
        onRoleChange={onRoleChange}
      />
      <main style={{ flexGrow: 1, padding: "20px" }}>{children}</main>
    </div>
  );
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Load faculty details from localStorage (or set null)
  const [facultyDetails, setFacultyDetails] = useState(() => {
    const stored = localStorage.getItem("facultyDetails");
    return stored ? JSON.parse(stored) : null;
  });

  // Role state, default to admin or faculty based on facultyDetails if available
  const [role, setRole] = useState(
    facultyDetails?.role || (facultyDetails?.isAdmin ? "admin" : "faculty")
  );

  // When role changes, update role state (and optionally save to localStorage if needed)
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    // Optionally update facultyDetails with new role and save to localStorage
    const updatedFaculty = { ...facultyDetails, role: newRole };
    setFacultyDetails(updatedFaculty);
    localStorage.setItem("facultyDetails", JSON.stringify(updatedFaculty));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setFacultyDetails(null);
    setRole(null);
    localStorage.removeItem("facultyDetails");
  };

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/faculty-login" element={<Login />} />
        <Route path="/student-details" element={<StudentDetails />} />
        <Route path="/quiz/:quizId" element={<Quiz />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/student-result" element={<StudentResult />} />
        <Route path="/result" element={<StStudentQuizResult />} />
        <Route path="/quiz-results/:quizId" element={<QuizResults />} />

        {/* Routes wrapped with Sidebar layout */}
        <Route
          path="/dashboard"
          element={
            <DashboardLayout
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
              facultyDetails={facultyDetails}
              role={role}
              onRoleChange={handleRoleChange}
            >
              <Dashboard />
            </DashboardLayout>
          }
        />
        <Route
          path="/createquiz"
          element={
            <DashboardLayout
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
              facultyDetails={facultyDetails}
              role={role}
              onRoleChange={handleRoleChange}
            >
              <CreateQuiz />
            </DashboardLayout>
          }
        />
        <Route
          path="/myquiz"
          element={
            <DashboardLayout
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
              facultyDetails={facultyDetails}
              role={role}
              onRoleChange={handleRoleChange}
            >
              <CreateMyQuizzes />
            </DashboardLayout>
          }
        />
        <Route
          path="/faculty-dashboard"
          element={
            <DashboardLayout
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
              facultyDetails={facultyDetails}
              role={role}
              onRoleChange={handleRoleChange}
            >
              <FacultyDashboard />
            </DashboardLayout>
          }
        />
        <Route
          path="/studentdetails"
          element={
            <DashboardLayout
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
              facultyDetails={facultyDetails}
              role={role}
              onRoleChange={handleRoleChange}
            >
              <AddStudent />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <DashboardLayout
              isLoggedIn={isLoggedIn}
              onLogout={handleLogout}
              facultyDetails={facultyDetails}
              role={role}
              onRoleChange={handleRoleChange}
            >
              <AdminDashboard />
            </DashboardLayout>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
