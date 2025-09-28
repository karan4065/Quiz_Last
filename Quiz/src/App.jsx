import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Quiz from "./pages/student/Quiz";
import ThankYou from "./pages/student/ThankYou";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import StudentResult from "./pages/faculty/StudentResult";
import StudentDetails from "./pages/student/StudentDetails";
import StudentLogin from "./pages/StudentLogin";
import Home from "./pages/Home";
import QuizResults from "./pages/faculty/QuizResults"; // ✅ Import QuizResults
import StStudentQuizResult from "./pages/student/StStudentQuizResult";
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/faculty-login" element={<Login />} />
        <Route path="/student-details" element={<StudentDetails />} />
        <Route path="/quiz/:quizId" element={<Quiz />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/faculty-dashboard" element={<FacultyDashboard />} />
        <Route path="/student-result" element={<StudentResult />} />
<Route path="/result" element={<StStudentQuizResult/>}/>
        {/* ✅ Route for viewing quiz results by faculty */}
        <Route path="/quiz-results/:quizId" element={<QuizResults />} />

      </Routes>
    </Router>
  );
};

export default App;
