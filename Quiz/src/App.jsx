import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import Sidebar from "./components/Sidebar";
import StudentLogin from "./pages/StudentLogin";
// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/faculty/Dashboard";
import AdminDashboard from "./pages/faculty/AdminDashboard";
import CreateQuiz from "./pages/faculty/CreateQuiz";
import CreateMyQuizzes from './components/CreateMyQuizzes ' 
import AddStudent from "./pages/faculty/Addstudent";
import Quiz from './pages/student/Quiz'
// Layout
const DashboardLayout = ({ children }) => (
  <div style={{ display: "flex", minHeight: "100vh" }}>
    <Sidebar />
    <main style={{ flexGrow: 1, padding: "20px" }}>{children}</main>
  </div>
);

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quiz/:quizId" element={<Quiz />} />
          
          <Route path="/student-login" element={<StudentLogin />} />
          <Route path="/faculty-login" element={<Login />} />
          <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
          <Route path="/createquiz" element={<DashboardLayout><CreateQuiz /></DashboardLayout>} />
          <Route path="/myquiz" element={<DashboardLayout><CreateMyQuizzes /></DashboardLayout>} />
          <Route path="/studentdetails" element={<DashboardLayout><AddStudent /></DashboardLayout>} />
          <Route path="/admin-dashboard" element={<DashboardLayout><AdminDashboard /></DashboardLayout>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
