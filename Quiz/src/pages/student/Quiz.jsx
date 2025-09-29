import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar";

const Quiz = () => {
  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [student, setStudent] = useState(null);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // New state for starting countdown and submitting loader
  const [startingCountdown, setStartingCountdown] = useState(3);
  const [showStartingLoader, setShowStartingLoader] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { quizId } = useParams();
  const navigate = useNavigate();

  // ---------------- Load Student ----------------
  const loadStudent = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/student/me", {
        withCredentials: true,
      });
      if (data.success) setStudent(data.student);
    } catch (err) {
      console.error(err);
      handleLogout();
    }
  };

  // ---------------- Load Quiz & Progress ----------------
  const loadQuizAndProgress = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/quizzes/${quizId}`, {
        withCredentials: true,
      });

      if (!data.success) {
        navigate("/already-attempted");
        return;
      }

      const { quiz, progress } = data.data;
      setCategories(quiz.categories || []);

      if (progress) {
        setCurrentQuestionIndex(progress.currentQuestionIndex || 0);
        setAnswers(progress.answers || []);
        setTimeLeft(progress.timeLeft || 15 * 60);
      }

      setProgressLoaded(true);
      enterFullscreen();
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- Fullscreen ----------------
  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen();
    else if (elem.mozRequestFullScreen) elem.mozRequestFullScreen();
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.msExitFullscreen) document.msExitFullscreen();
  };

  // ---------------- Flatten Questions ----------------
  useEffect(() => {
    if (categories.length > 0 && progressLoaded) {
      const allQuestions = categories.flatMap((cat) => cat.questions);
      setQuestions(allQuestions);
    }
  }, [categories, progressLoaded]);

  useEffect(() => {
    loadStudent();
    loadQuizAndProgress();
  }, [quizId]);

  // ---------------- Starting Countdown ----------------
  useEffect(() => {
    if (!progressLoaded) return;

    if (startingCountdown > 0) {
      const timer = setTimeout(() => {
        setStartingCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Countdown finished, hide loader
      setShowStartingLoader(false);
    }
  }, [startingCountdown, progressLoaded]);

  // ---------------- Save Progress ----------------
  const saveProgress = async () => {
    if (quizCompleted || !progressLoaded) return;
    try {
      await axios.post(
        `http://localhost:5000/api/quizzes/${quizId}/save-progress`,
        { currentQuestionIndex, answers, timeLeft },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Save progress error:", err);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!quizCompleted && timeLeft > 0) setTimeLeft((prev) => prev - 1);
      else if (timeLeft === 0 && !quizCompleted) handleSubmit();
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, quizCompleted]);

  useEffect(() => {
    saveProgress();
  }, [answers, currentQuestionIndex, timeLeft]);

  // ---------------- Option Click ----------------
  const handleOptionClick = (option) => {
    const updated = [...answers];
    const qId = questions[currentQuestionIndex]?._id;
    const index = updated.findIndex((ans) => ans.questionId === qId);

    if (index !== -1) updated[index].selectedOption = option;
    else updated.push({ questionId: qId, selectedOption: option });

    setAnswers(updated);
    setSelectedOption(option);
  };

  useEffect(() => {
    const currQ = questions[currentQuestionIndex];
    const ans = answers.find((a) => a.questionId === currQ?._id);
    setSelectedOption(ans?.selectedOption || null);
  }, [currentQuestionIndex, questions, answers]);

  // ---------------- Submit ----------------
  const handleSubmit = async () => {
    if (quizCompleted) return;
    try {
      setSubmitting(true);
      await axios.post(
        `http://localhost:5000/api/quizzes/${quizId}/submit`,
        { answers },
        { withCredentials: true }
      );
      setQuizCompleted(true);
      exitFullscreen();
      navigate("/thank-you");
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    navigate("/");
  };

  const isAnswered = (i) =>
    answers.some((a) => a.questionId === questions[i]?._id);

  // ---------------- Render ----------------
  if (!progressLoaded) return <p className="text-center mt-20">Loading quiz...</p>;

  const currentQ = questions[currentQuestionIndex];

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Navbar userName={student?.name || "Student"} onProfileClick={toggleSidebar} />

      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="h-screen w-1/5 bg-[#1e254a] text-white p-6 shadow-xl flex flex-col justify-between fixed top-0 left-0 z-50">
          <div>
            <h2 className="text-xl font-bold mb-6 border-b pb-2 border-gray-400">Student Profile</h2>
            <div className="space-y-3 text-sm bg-[#2e3561] p-4 rounded-xl shadow-inner">
              <div><span className="font-semibold">Name:</span> {student?.name}</div>
              <div><span className="font-semibold">ID:</span> {student?.studentId}</div>
              <div><span className="font-semibold">Email:</span> {student?.email}</div>
              <div><span className="font-semibold">Department:</span> {student?.department}</div>
              <div><span className="font-semibold">Year:</span> {student?.year}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 w-full py-2 rounded-md hover:bg-red-600 transition transform hover:scale-105 text-sm font-medium"
          >
            Logout
          </button>
        </aside>
      )}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Starting Countdown Loader */}
      {showStartingLoader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm text-white text-9xl font-bold select-none">
          {startingCountdown > 0 ? startingCountdown : "Go!"}
        </div>
      )}

      {/* Submitting Loader */}
      {submitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm text-white text-3xl font-semibold select-none">
          Submitting...
        </div>
      )}

      {/* Main Quiz */}
      {!showStartingLoader && (
        <div className="flex flex-grow">
          <div className="flex-grow p-6">
            <div className="flex justify-end mb-4 text-lg font-semibold text-red-600">
              Time Left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
            </div>

            {questions.length > 0 ? (
              <>
                <h2 className="text-2xl font-semibold mb-4">
                  Q{currentQuestionIndex + 1}. {currentQ?.question || " "} <span>{currentQ?.description}</span>
                </h2>

                {/* ✅ Show Image if exists */}
                {currentQ?.image && (
                  <div className="mb-4 flex justify-center">
                    <img
                      src={currentQ.image}
                      alt="Question"
                      className="max-w-xs md:max-w-md border rounded-lg shadow-md "
                    />
                  </div>
                )}

                {/* Options */}
                <div className="space-y-3">
                  {currentQ.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(opt)}
                      className={`block w-full p-3 rounded-lg border transition duration-200 ${
                        selectedOption === opt
                          ? "bg-green-100 border-green-600"
                          : "bg-white border-gray-300 hover:border-green-500"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {/* Navigation */}
                <div className="mt-6 flex justify-between">
                  <button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                    className="bg-[#cd354d] text-white py-2 px-4 rounded hover:bg-[#f29109] disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    disabled={currentQuestionIndex === questions.length - 1}
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="bg-[#cd354d] text-white py-2 px-4 rounded hover:bg-[#f29109] disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                  {currentQuestionIndex === questions.length - 1 && (
                    <button
                      onClick={handleSubmit}
                      disabled={answers.length !== questions.length || submitting}
                      className={`py-2 px-4 rounded text-white ${
                        answers.length === questions.length && !submitting
                          ? "bg-[#cd354d] hover:bg-[#f29109]"
                          : "bg-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Submit
                    </button>
                  )}
                </div>
              </>
            ) : (
              <p className="text-center text-gray-600">Loading quiz...</p>
            )}
          </div>

          {/* Question Navigation */}
          {questions.length > 0 && (
            <div className="w-full md:w-1/4 bg-white p-4 shadow-md rounded-lg mt-6 md:mt-0 md:ml-4">
              <h2 className="font-bold text-lg mb-4 border-b pb-2 text-center">Question Navigation</h2>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(2.5rem,1fr))] gap-3">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentQuestionIndex(i)}
                    className={`w-10 h-10 rounded-full font-semibold text-sm flex items-center justify-center transition duration-300 ease-in-out ${
                      i === currentQuestionIndex
                        ? "ring-2 ring-blue-500 bg-blue-100"
                        : isAnswered(i)
                        ? "bg-green-300 hover:bg-green-400"
                        : "bg-yellow-100 hover:bg-yellow-200"
                    }`}
                    title={`Question ${i + 1}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Quiz;
