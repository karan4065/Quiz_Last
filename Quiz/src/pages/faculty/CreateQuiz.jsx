import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import toast,{Toaster} from  'react-hot-toast'
const CreateQuiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const facultyDetails =
    location.state?.facultyDetails ||
    JSON.parse(localStorage.getItem("facultyDetails"));

  if (!facultyDetails) {
    navigate("/"); // redirect to login if no details
  }

  // Quiz states
  const [quizFile, setQuizFile] = useState(null);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDuration, setQuizDuration] = useState(30);
  const [quizLimit, setQuizLimit] = useState(80);
  const [quizSession, setQuizSession] = useState("");
  const [subject, setSubject] = useState("");
  const [quizzes, setQuizzes] = useState([]);
  const [showQuizTable, setShowQuizTable] = useState(false);

  // Search/filter states
  const [titleSearch, setTitleSearch] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");

  // Image quiz states
  const [showImageForm, setShowImageForm] = useState(false);
  const [imageQuestion, setImageQuestion] = useState({
    category: "",
    image: null,
    description: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOption: "A",
    subject: "",
  });
  const [currentQuizId, setCurrentQuizId] = useState(null);
  const [isNewQuiz, setIsNewQuiz] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);
 const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm("Are you sure you want to delete this quiz?")) return;

    try {
      const res = await axios.delete(
        `http://localhost:5000/api/quizzes/${quizId}`
      );
      const data = res.data;
      console.log("Delete response:", data);
      if (data.success) {
        const updated = quizzes.filter((q) => q._id !== quizId);
        setQuizzes(updated);
        applyFilters(updated, searchTerm, selectedSession);
        toast.success("Quiz deleted successfully!");
      } else {
        toast.error("Failed to delete quiz.");
      }
    } catch (err) {
      console.error("delete error:", err);
      alert("Error deleting quiz.");
    }
  };
  const fetchQuizzes = async () => {
    if (!facultyDetails?._id) return;
    try {
     const res = await axios.get(
  `http://localhost:5000/api/faculty/${facultyDetails._id}/quizzes`
);

      if (res.data.success) {
        setQuizzes(res.data.data || []);
      }
      setShowQuizTable(true);
    } catch (err) {
      console.error("Error fetching quizzes:", err);
    }
  };

  const handleQuizUpload = async () => {
    if (!quizFile || !quizTitle || !quizDuration || !subject || !quizSession || !quizLimit) {
      return toast.error("All fields are required for CSV upload");
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvText = e.target.result;
      try {
        const res = await axios.post("http://localhost:5000/api/quizzes/upload", {
          title: quizTitle,
          facultyId: facultyDetails._id,
          duration: quizDuration,
          limit: quizLimit,
          session: quizSession,
          subject,
          csvData: csvText,
        });
        if (res.data.success) {
          toast.success("Quiz upload successfully")
          await fetchQuizzes();
          resetForm();
        } else {
           toast.error("Upload failed: " + (res.data.message || ""));
        }
      } catch (err) {
        console.error("Upload error:", err);
         toast.error("Upload failed");
      }
    };
    reader.readAsText(quizFile);
  };

  const handleCreateImageQuiz = async () => {
    // Use subject from imageQuestion if isNewQuiz
    const quizSubject = isNewQuiz ? imageQuestion.subject : subject;

    if (
      !quizTitle ||
      !quizDuration ||
      !quizLimit ||
      !quizSession ||
      !quizSubject ||
      !imageQuestion.category ||
      !imageQuestion.optionA ||
      !imageQuestion.optionB ||
      !imageQuestion.optionC ||
      !imageQuestion.optionD
    ) {
      return toast.error("All required fields must be filled");
    }

    const formData = new FormData();
    formData.append("title", quizTitle);
    formData.append("duration", quizDuration);
    formData.append("limit", quizLimit);
    formData.append("session", quizSession);
    formData.append("facultyId", facultyDetails._id);
    formData.append("subject", quizSubject);
    formData.append("category", imageQuestion.category);
    formData.append("description", imageQuestion.description || "");
    formData.append(
      "options",
      JSON.stringify([
        imageQuestion.optionA,
        imageQuestion.optionB,
        imageQuestion.optionC,
        imageQuestion.optionD,
      ])
    );
    formData.append("answer", imageQuestion[`option${imageQuestion.correctOption}`]);
    if (imageQuestion.image) formData.append("image", imageQuestion.image);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/quizzes/imagebaseqs",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (res.data.success) {
        toast.success("Image Quiz created successfully!");
        resetForm();
        fetchQuizzes();
      } else {
        alert("Create image quiz failed: " + (res.data.message || ""));
      }
    } catch (err) {
      console.error("Create image quiz error:", err);
      alert("Create image quiz failed");
    }
  };

  const handleAddImageQuestion = async () => {
    if (!currentQuizId) return alert("Quiz not selected");

    const quiz = quizzes.find((q) => q._id === currentQuizId);
    if (!quiz) return alert("Quiz not found");

    const { category, image, description, optionA, optionB, optionC, optionD, correctOption } =
      imageQuestion;

    if (!category || !optionA || !optionB || !optionC || !optionD) {
      return toast.error("All fields except image are required");
    }

    const formData = new FormData();
    formData.append("category", category);
    formData.append("description", description || "");
    formData.append("options", JSON.stringify([optionA, optionB, optionC, optionD]));
   formData.append("answer", imageQuestion[`option${correctOption}`]);
    formData.append("subject", quiz.subject);
    if (image) formData.append("image", image);

    try {
     const res = await axios.post(
  `http://localhost:5000/api/quizzes/${currentQuizId}/addqs`,
  formData,
  { headers: { "Content-Type": "multipart/form-data" } }
);

      if (res.data.success) {
         toast.success("Question added successfully!");
        resetImageForm();
        fetchQuizzes();
      } else {
         toast.error("Add question failed: " + (res.data.message || ""));
      }
    } catch (err) {
      console.error("Add image question error:", err);
       toast.error("Add image question failed");
    }
  };

  const resetForm = () => {
    setQuizTitle("");
    setQuizDuration(30);
    setQuizLimit(80);
    setQuizSession("");
    setSubject("");
    resetImageForm();
  };

  const resetImageForm = () => {
    setImageQuestion({
      category: "",
      image: null,
      description: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctOption: "A",
      subject: "",
    });
    setShowImageForm(false);
    setCurrentQuizId(null);
    setIsNewQuiz(false);
  };

  const allSessions = Array.from(new Set(quizzes.map((q) => q.session))).filter(Boolean);
  const filteredQuizzes = quizzes.filter((q) =>
    q.title.toLowerCase().includes(titleSearch.toLowerCase()) &&
    (sessionFilter ? q.session === sessionFilter : true)
  );

  return (
    <div className=" bg-gray-100 min-h-screen">
      <Toaster/>
      <Navbar userName={`Hey, ${facultyDetails.name}`} />


      <h2 className="text-2xl font-semibold mb-6 mt-6 text-gray-800">Manage Quizzes</h2>

      {/* Create / Upload Form */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Quiz Title"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-indigo-400"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Duration (minutes)"
                value={quizDuration}
                onChange={(e) => setQuizDuration(e.target.value)}
                className="border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-indigo-400"
              />
              <input
                type="number"
                placeholder="Limit (Student Limit)"
                value={quizLimit}
                onChange={(e) => setQuizLimit(e.target.value)}
                className="border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <input
              type="text"
              placeholder="Session (e.g. 2025-Fall)"
              value={quizSession}
              onChange={(e) => setQuizSession(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-indigo-400"
            />
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Select Subject</option>
              {facultyDetails?.subjects?.map((subj, idx) => (
                <option key={idx} value={subj}>{subj}</option>
              ))}
            </select>
          </div>
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <label className="block text-gray-700">Upload CSV</label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setQuizFile(e.target.files[0])}
                className="block w-full border border-[#243278] rounded-md text-sm text-gray-600
                  file:mr-4 file:py-2 file:px-4
                  file:border-0
                  file:text-sm file:font-semibold
                  file:bg-[#243278] file:text-white
                  hover:file:bg-[#162675]"
              />
              <button
                onClick={handleQuizUpload}
                className="w-full bg-[#243278] hover:bg-[#202c6b] text-white font-medium py-3 rounded-md transition"
              >
                Upload via CSV
              </button>
            </div>
            <div>
              <button
                onClick={() => {
                  setIsNewQuiz(true);
                  setShowImageForm(true);
                  setImageQuestion({ ...imageQuestion, subject }); // fix: default subject
                }}
                className="w-full bg-[#17ce54] hover:bg-[#1b9e47] text-white font-medium py-3 rounded-md transition"
              >
                Create Image-based Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
 <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row md:items-center md:space-x-4">
        <div className="flex-1 mb-3 md:mb-0">
          <input
            type="text"
            placeholder="Search by quiz title"
            value={titleSearch}
            onChange={(e) => setTitleSearch(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div className="flex-1">
          <select
            value={sessionFilter}
            onChange={(e) => setSessionFilter(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">All Sessions</option>
            {allSessions.map((sess, idx) => (
              <option key={idx} value={sess}>
                {sess}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quiz Table */}
      {showQuizTable && filteredQuizzes.length > 0 ? (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Title", "Subject", "Session", "Duration", "Limit", "Created At", "Actions"].map(
                  (heading, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 text-left text-sm font-medium text-gray-600"
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredQuizzes.map((q) => (
                <tr key={q._id}>
                  <td className="px-4 py-3 text-gray-800">{q.title}</td>
                  <td className="px-4 py-3 text-gray-800">{q.subject}</td>
                  <td className="px-4 py-3 text-gray-800">{q.session}</td>
                  <td className="px-4 py-3 text-gray-800">{q.duration}</td>
                  <td className="px-4 py-3 text-gray-800">{q.limit}</td>
                  <td className="px-4 py-3 text-gray-800">
                    {new Date(q.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 flex space-x-2">
                    <button
                      className="bg-[#243278]  hover:bg-[#3a51c5]   text-white px-3 py-1 rounded-md transition"
                      onClick={() => {
                        setCurrentQuizId(q._id);
                        setIsNewQuiz(false);
                        setShowImageForm(true);
                      }}
                    >
                      Add Image Qs
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md transition"
                      onClick={() => handleDeleteQuiz(q._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-gray-500 text-center mt-6">
          {filteredQuizzes.length === 0 ? "No quizzes found." : "Loading..."}
        </div>
      )}

      {/* Image Question / Quiz Modal */}
      {showImageForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">
              {isNewQuiz ? "Create New Image Quiz" : "Add Image Question"}
            </h3>

            {isNewQuiz && (
              <>
                <input
                  type="text"
                  placeholder="Quiz Title"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-indigo-400"
                />
                <input
                  type="text"
                  placeholder="Session"
                  value={quizSession}
                  onChange={(e) => setQuizSession(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-indigo-400"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Limit"
                    value={quizLimit}
                    onChange={(e) => setQuizLimit(Number(e.target.value))}
                    className="border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-indigo-400"
                  />
                  <input
                    type="number"
                    placeholder="Duration"
                    value={quizDuration}
                    onChange={(e) => setQuizDuration(Number(e.target.value))}
                    className="border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <select
                  value={imageQuestion.subject}
                  onChange={(e) =>
                    setImageQuestion({
                      ...imageQuestion,
                      subject: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="">Select Subject</option>
                  {facultyDetails?.subjects?.map((subj, idx) => (
                    <option key={idx} value={subj}>
                      {subj}
                    </option>
                  ))}
                </select>
              </>
            )}

            <input
              type="text"
              placeholder="Category"
              value={imageQuestion.category}
              onChange={(e) =>
                setImageQuestion({ ...imageQuestion, category: e.target.value })
              }
              className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-indigo-400"
            />
            <input
              type="text"
              placeholder="Description"
              value={imageQuestion.description}
              onChange={(e) =>
                setImageQuestion({
                  ...imageQuestion,
                  description: e.target.value,
                })
              }
              className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-indigo-400"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setImageQuestion({ ...imageQuestion, image: e.target.files[0] })
              }
              className="w-full"
            />

            <div className="grid grid-cols-2 gap-3">
            {["A", "B", "C", "D"].map((opt) => (
              <input
                key={opt}
                type="text"
                placeholder={`Option ${opt}`}
                value={imageQuestion[`option${opt}`] || ""}
                onChange={(e) =>
                  setImageQuestion({
                    ...imageQuestion,
                    [`option${opt}`]: e.target.value,
                  })
                }
                className="border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-indigo-400"
              />
            ))}
          </div>


            <select
              value={imageQuestion.correctOption}
              onChange={(e) =>
                setImageQuestion({
                  ...imageQuestion,
                  correctOption: e.target.value,
                })
              }
              className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-indigo-400"
            >
              {["A", "B", "C", "D"].map((opt) => (
                <option key={opt} value={opt}>
                  Option {opt}
                </option>
              ))}
            </select>

            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={isNewQuiz ? handleCreateImageQuiz : handleAddImageQuestion}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md transition"
              >
                {isNewQuiz ? "Create Quiz" : "Add Question"}
              </button>
              <button
                onClick={resetImageForm}
                className="bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded-md transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Table and Image modal code remains same as previous version */}

    </div>
  );
};

export default CreateQuiz;
