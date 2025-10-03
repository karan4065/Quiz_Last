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
import QuizResults from "./pages/faculty/QuizResults";
import ThankYou from "./pages/student/ThankYou";
import Seeresult from "./pages/student/Seeresult";
import HomePageStudent from "./pages/student/HomePageStudent";
import ForgotPassword from "./pages/student/ForgotPassword";
import ResetPassword from "./pages/student/ResetPassword";
import StStudentQuizResult from "./pages/student/StStudentQuizResult";
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
          <Route path="/student-quiz-result" element={<StStudentQuizResult />} />
          <Route path="/faculty-login" element={<Login />} />
          <Route path="/seeresult" element={<Seeresult />} />
          <Route path="/result/:id" element={<HomePageStudent />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
          <Route path="/createquiz" element={<DashboardLayout><CreateQuiz /></DashboardLayout>} />
          <Route path="/myquiz" element={<DashboardLayout><CreateMyQuizzes /></DashboardLayout>} />
          <Route path="/studentdetails" element={<AddStudent/>}/>
             <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/admin-dashboard" element={<DashboardLayout><AdminDashboard /></DashboardLayout>} />
          <Route path="/quiz-results/:quizId" element={<QuizResults />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
