import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../../components/Navbar";

/* =========================
   Seeded shuffle utilities
   (unchanged functionality)
   ========================= */
const hashCode = (str) => {
  if (!str) str = "";
  str = String(str);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
};

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const seededShuffle = (array, seed) => {
  let arr = [...array];
  const random = mulberry32(hashCode(seed));
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

/* =========================
   Small presentational pieces
   (kept separate for clarity)
   ========================= */

/**
 * OptionButton
 * - keeps same behavior: clicking reports the option via onClick
 * - improved visuals: responsive sizing, text wrap, accessible focus styles
 */
const OptionButton = ({ option, isSelected, onClick, disabled }) => (
  <button
    onClick={() => !disabled && onClick(option)}
    className={`flex items-center justify-center text-center gap-2 p-3 md:p-4 rounded-lg border transition-transform duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 select-none break-words
      ${isSelected
        ? "bg-green-600 text-white border-green-700 shadow-lg"
        : "bg-white border-gray-300 hover:border-green-500 hover:shadow-sm"}
    `}
    style={{ userSelect: "none", minHeight: 56 }}
    disabled={disabled}
    aria-pressed={isSelected}
  >
    <span className="text-sm md:text-base leading-tight">{option}</span>
  </button>
);

/**
 * QuestionComponent
 * - preserves all original logic/props
 * - improved responsive layout:
 *    - image area and options area split nicely on wide screens
 *    - on narrow screens image sits above options
 *    - options use responsive grid (auto-fit) to ensure they fit without scrolling
 * - image is protected from dragging & right-click (maintained)
 */
const QuestionComponent = ({ question, selectedOption, onOptionSelect, disabled }) => {
  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg mb-6 select-none transition duration-300 hover:shadow-2xl">
      <h2 className="text-lg md:text-2xl font-semibold mb-3 md:mb-4 leading-tight">
        {question.question}
        {question.description && (
          <span className="block text-sm text-gray-500 mt-1">{question.description}</span>
        )}
      </h2>

      {/* Layout container ensures image + options fit the viewport well */}
      {question.image ? (
        <div
          className="flex flex-col md:flex-row gap-6 items-start"
          style={{ minHeight: 200 }}
        >
          {/* Image container: responsive, keeps height limited relative to viewport */}
          <div className="flex-shrink-0 md:w-1/2 w-full flex justify-center items-center">
            <div
              className="w-full max-w-full rounded-lg overflow-hidden border"
              style={{ maxHeight: "60vh" }}
            >
              <img
                src={question.image}
                alt="Question"
                className="w-full h-full object-contain block"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
          </div>

          {/* Options container: responsive grid that adapts columns to viewport width.
              Uses auto-fit / minmax to prevent overflow, so options are always visible
              without requiring page scroll (they will reflow into more columns/rows). */}
          <div className="flex-1 w-full">
            <div
              className="grid gap-3"
              style={{
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(220px, 100%), 1fr))",
              }}
            >
              {question.options.map((opt, idx) => (
                <OptionButton
                  key={idx}
                  option={opt}
                  isSelected={selectedOption === opt}
                  onClick={onOptionSelect}
                  disabled={disabled}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        // No image: options in responsive grid (same behavior)
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))",
          }}
        >
          {question.options.map((opt, idx) => (
            <OptionButton
              key={idx}
              option={opt}
              isSelected={selectedOption === opt}
              onClick={onOptionSelect}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* =========================
   Navigation buttons & Timer
   (styling improved but behavior unchanged)
   ========================= */

const NavigationButtons = ({
  currentIndex,
  totalQuestions,
  canSubmit,
  onPrev,
  onNext,
  onSubmit,
  submitting,
  disabled,
}) => (
  <div className="mt-6 flex flex-col sm:flex-row justify-between gap-3 sm:gap-2 select-none">
    <div className="flex gap-2 w-full sm:w-auto">
      <button
        disabled={currentIndex === 0 || disabled}
        onClick={onPrev}
        className="flex-1 sm:flex-none bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-300"
      >
        Previous
      </button>
      <button
        disabled={currentIndex === totalQuestions - 1 || disabled}
        onClick={onNext}
        className="flex-1 sm:flex-none bg-gradient-to-r from-blue-500 to-blue-700 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-300"
      >
        Next
      </button>
    </div>

    {currentIndex === totalQuestions - 1 && (
      <div className="w-full sm:w-auto">
        <button
          onClick={onSubmit}
          disabled={!canSubmit || submitting || disabled}
          className={`w-full py-2 px-4 rounded-lg text-white transition duration-300 ${
            canSubmit && !submitting && !disabled
              ? "bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    )}
  </div>
);

const TimerBar = ({ timeLeft, totalTime }) => {
  const percentage = (timeLeft / totalTime) * 100;
  const bgColor =
    percentage > 50 ? "bg-green-500" : percentage > 20 ? "bg-yellow-400" : "bg-red-500";

  return (
    <div className="w-full h-3 sm:h-4 bg-gray-300 rounded-full overflow-hidden mb-4 shadow-inner">
      <div
        className={`${bgColor} h-3 sm:h-4 transition-all duration-500`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

/* =========================
   Main Quiz component
   (functionality preserved; UI improved/responsive)
   ========================= */

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
  const [startingCountdown, setStartingCountdown] = useState(3);
  const [showStartingLoader, setShowStartingLoader] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quizFrozen, setQuizFrozen] = useState(false);

  const { quizId } = useParams();
  const navigate = useNavigate();

  // --- Security listeners (unchanged) ---
  useEffect(() => {
    const prevent = (e) => e.preventDefault();
    document.addEventListener("copy", prevent);
    document.addEventListener("contextmenu", prevent);
    document.addEventListener("dragstart", prevent);
    document.addEventListener("selectstart", prevent);
    const keyListener = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase())) ||
        (e.ctrlKey && e.key.toUpperCase() === "U")
      )
        e.preventDefault();
    };
    document.addEventListener("keydown", keyListener);
    return () => {
      document.removeEventListener("copy", prevent);
      document.removeEventListener("contextmenu", prevent);
      document.removeEventListener("dragstart", prevent);
      document.removeEventListener("selectstart", prevent);
      document.removeEventListener("keydown", keyListener);
    };
  }, []);

  // --- Freeze on tab change (unchanged) ---
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden" && !quizCompleted && !quizFrozen) {
        setQuizFrozen(true);
        handleSubmit();
        alert("Tab change detected! Quiz is frozen and submitted.");
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [quizCompleted, quizFrozen]);

  // --- Load student and quiz (unchanged endpoints) ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/student/me", {
          withCredentials: true,
        });
        if (data.success) setStudent(data.student);
      } catch {
        handleLogout();
      }
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/quizzes/${quizId}`,
          { withCredentials: true }
        );
        if (!data.success) {
          navigate("/already-attempted");
          return;
        }
        setCategories(data.data.quiz.categories || []);
        const progress = data.data.progress;
        if (progress) {
          setCurrentQuestionIndex(progress.currentQuestionIndex || 0);
          setAnswers(progress.answers || []);
          setTimeLeft(progress.timeLeft || 15 * 60);
        }
        setProgressLoaded(true);
        enterFullscreen();
      } catch (e) {
        console.error(e);
      }
    };
    loadData();
  }, [quizId]);

  // --- Shuffle questions & options (preserved) ---
  useEffect(() => {
    if (categories.length > 0 && progressLoaded && student) {
      let flatQuestions = categories.flatMap((c) => c.questions);
      flatQuestions = flatQuestions.map((q) => ({
        ...q,
        options: seededShuffle(q.options, student._id + q._id),
      }));
      setQuestions(seededShuffle(flatQuestions, student._id));
    }
  }, [categories, progressLoaded, student]);

  // --- Starting countdown (preserved) ---
  useEffect(() => {
    if (!progressLoaded || questions.length === 0) return;
    if (startingCountdown > 0) {
      const timer = setTimeout(() => setStartingCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowStartingLoader(false);
    }
  }, [startingCountdown, progressLoaded, questions.length]);

  // --- Save progress (unchanged) ---
  const saveProgress = async () => {
    if (quizCompleted || quizFrozen || !progressLoaded) return;
    try {
      await axios.post(
        `http://localhost:5000/api/quizzes/${quizId}/save-progress`,
        { currentQuestionIndex, answers, timeLeft },
        { withCredentials: true }
      );
    } catch (e) {
      console.error("Save progress error:", e);
    }
  };
  useEffect(() => {
    saveProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, currentQuestionIndex, timeLeft]);

  // --- Timer (preserved) ---
  useEffect(() => {
    if (!quizCompleted && !quizFrozen && timeLeft > 0) {
      const interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    } else if (timeLeft === 0 && !quizCompleted) {
      setQuizFrozen(true);
      handleSubmit();
    }
  }, [timeLeft, quizCompleted, quizFrozen]);

  // --- Option click (preserved) ---
  const handleOptionClick = (option) => {
    if (quizFrozen || quizCompleted) return;
    const qId = questions[currentQuestionIndex]?._id;
    const updatedAnswers = [...answers];
    const idx = updatedAnswers.findIndex((a) => a.questionId === qId);
    if (idx !== -1) updatedAnswers[idx].selectedOption = option;
    else updatedAnswers.push({ questionId: qId, selectedOption: option });
    setAnswers(updatedAnswers);
    setSelectedOption(option);
  };

  // --- Load selected option for current question (preserved) ---
  useEffect(() => {
    const currQ = questions[currentQuestionIndex];
    const ans = answers.find((a) => a.questionId === currQ?._id);
    setSelectedOption(ans?.selectedOption || null);
  }, [currentQuestionIndex, questions, answers]);

  // --- Submit quiz (preserved) ---
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
    } catch (e) {
      console.error(e);
      setSubmitting(false);
    }
  };

  // --- Fullscreen helpers (preserved) ---
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

  const toggleSidebar = () => setSidebarOpen((s) => !s);
  const handleLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    navigate("/");
  };
  const isAnswered = (i) => answers.some((a) => a.questionId === questions[i]?._id);

  /* ---------------------
     Early loading / countdown
     --------------------- */
  if (!progressLoaded || questions.length === 0)
    return <p className="text-center mt-20 text-lg">Loading quiz...</p>;

  if (showStartingLoader)
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-85 backdrop-blur-sm text-white text-9xl font-bold select-none">
        {startingCountdown > 0 ? startingCountdown : "Go!"}
      </div>
    );

  const currentQ = questions[currentQuestionIndex];

  /* ===========================
     FINAL RENDER - improved layout
     - keeps the same components & logic
     - ensures content fits viewport (no page scrolling required)
     - responsive: image above options on small screens, side-by-side on larger screens
     =========================== */
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-200 select-none">
      <Navbar userName={student?.name || "Student"} onProfileClick={toggleSidebar} />

      {/* Sidebar & overlay */}
      {sidebarOpen && (
        <>
          <aside className="h-screen w-4/5 sm:w-1/3 md:w-1/5 bg-gradient-to-b from-blue-900 to-blue-700 text-white p-6 shadow-xl flex flex-col justify-between fixed top-0 left-0 z-50 select-none">
            <div>
              <h2 className="text-xl font-bold mb-6 border-b pb-2 border-gray-400">Student Profile</h2>
              <div className="space-y-3 text-sm bg-blue-800/80 p-4 rounded-xl shadow-inner">
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
          <div className="fixed inset-0 bg-black bg-opacity-40 z-40" onClick={toggleSidebar} />
        </>
      )}

      {/* Submitting overlay */}
      {submitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm text-white text-3xl font-semibold select-none">
          Submitting...
        </div>
      )}

      {/* Main area: two columns on md+, single column on small */}
      <main className="flex flex-col md:flex-row flex-grow gap-4 md:gap-6 p-3 md:p-6 overflow-hidden">
        {/* Primary column (question + controls) */}
        <div
          className="flex flex-col flex-grow max-w-3xl mx-auto w-full"
          style={{ minHeight: 0 /* allows children to scroll if needed in this column */ }}
        >
          {/* Timer & header */}
          <div className="mb-2">
            <TimerBar timeLeft={timeLeft} totalTime={15 * 60} />
            <div className="flex items-center justify-between gap-2">
              <div className="text-lg font-semibold text-red-600">
                Time Left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
              </div>
              {quizFrozen && <div className="text-lg font-semibold text-red-700">Quiz Frozen</div>}
            </div>
          </div>

          {/* Scroll container for the question content only (keeps overall page from scrolling)
              NOTE: we keep overflow-auto here so very long content (rare) won't break layout. */}
          <div className="flex-grow overflow-auto py-2">
            <QuestionComponent
              question={currentQ}
              selectedOption={selectedOption}
              onOptionSelect={handleOptionClick}
              disabled={quizFrozen || quizCompleted}
            />
          </div>

          {/* Navigation */}
          <div className="mt-3">
            <NavigationButtons
              currentIndex={currentQuestionIndex}
              totalQuestions={questions.length}
              canSubmit={answers.length === questions.length}
              onPrev={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
              onNext={() => setCurrentQuestionIndex((i) => Math.min(questions.length - 1, i + 1))}
              onSubmit={handleSubmit}
              submitting={submitting}
              disabled={quizFrozen || quizCompleted}
            />
          </div>
        </div>

        {/* Sidebar with question navigation (visible on md+) */}
        <aside className="hidden md:flex md:flex-col md:w-72 xl:w-80 bg-white p-4 shadow-md rounded-lg overflow-auto">
          <h2 className="font-bold text-lg mb-4 border-b pb-2 text-center">Question Navigation</h2>
          <div className="grid grid-cols-5 gap-3">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => !quizFrozen && !quizCompleted && setCurrentQuestionIndex(i)}
                className={`w-10 h-10 rounded-full font-semibold text-sm flex items-center justify-center transition duration-300 ease-in-out ${
                  i === currentQuestionIndex
                    ? "ring-2 ring-blue-500 bg-blue-100"
                    : isAnswered(i)
                    ? "bg-green-300 hover:bg-green-400"
                    : "bg-yellow-100 hover:bg-yellow-200"
                }`}
                title={`Question ${i + 1}`}
                disabled={quizFrozen || quizCompleted}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="mt-4 text-xs text-center text-gray-600">
            Answered: <span className="font-semibold">{answers.length}</span> / {questions.length}
          </div>

          <div className="mt-auto">
            <button
              onClick={() => {
                if (!quizFrozen && !quizCompleted) {
                  if (window.confirm("Are you sure you want to submit the quiz now?")) {
                    handleSubmit();
                  }
                }
              }}
              className="mt-4 w-full py-2 rounded-md bg-gradient-to-r from-indigo-600 to-indigo-800 text-white hover:from-indigo-700 hover:to-indigo-900 transition"
              disabled={quizFrozen || quizCompleted || answers.length !== questions.length}
            >
              Quick Submit
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default Quiz;
