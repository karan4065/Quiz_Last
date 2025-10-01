import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const CreateQuiz = () => {
  const location = useLocation();
const navigate = useNavigate();
const facultyDetails =
  location.state?.facultyDetails ||
  JSON.parse(localStorage.getItem("facultyDetails"));

if (!facultyDetails) {
  navigate("/"); // force back to login if no details
}

  const [quizFile, setQuizFile] = useState(null);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDuration, setQuizDuration] = useState(30);
  const [quizLimit, setQuizLimit] = useState(80);
  const [quizSession, setQuizSession] = useState("");
  const [subject, setSubject] = useState("");
  const [quizzes, setQuizzes] = useState([]);
  const [showQuizTable, setShowQuizTable] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  useEffect(() => { fetchQuizzes(); }, []);

  const fetchQuizzes = async () => {
    if (!facultyDetails?._id) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/faculty/${facultyDetails._id}/quizzes`);
      if (res.data.success) setQuizzes(res.data.data);
      setShowQuizTable(true);
    } catch (err) { console.error(err); }
  };

  const handleQuizUpload = async () => {
    if (!quizFile || !quizTitle || !quizDuration || !subject || !quizSession || !quizLimit)
      return alert("All fields are required for CSV upload");

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
        if (res.data.success) { fetchQuizzes(); resetForm(); }
      } catch (err) { console.error(err); alert("Upload failed"); }
    };
    reader.readAsText(quizFile);
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm("Delete this quiz?")) return;
    try {
      const res = await axios.delete(`http://localhost:5000/api/quizzes/${quizId}`);
      if (res.data.success) setQuizzes(quizzes.filter((q) => q._id !== quizId));
    } catch (err) { console.error(err); alert("Delete failed"); }
  };

  const handleAddImageQuestion = async () => {
    const quiz = quizzes.find(q => q._id === currentQuizId);
    const { category, image, description, optionA, optionB, optionC, optionD, correctOption } = imageQuestion;
    if (!category || !optionA || !optionB || !optionC || !optionD)
      return alert("All fields except Question are required");

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
      if (res.data.success) { resetImageForm(); fetchQuizzes(); }
    } catch (err) { console.error(err); }
  };

  const handleCreateImageQuiz = async () => {
    const { category, image, description, optionA, optionB, optionC, optionD, correctOption, subject } = imageQuestion;
    if (!quizTitle || !quizDuration || !quizLimit || !quizSession || !subject || !category || !optionA || !optionB || !optionC || !optionD)
      return alert("All fields except Question are required");

    const formData = new FormData();
    formData.append("title", quizTitle);
    formData.append("duration", quizDuration);
    formData.append("limit", quizLimit);
    formData.append("session", quizSession);
    formData.append("facultyId", facultyDetails._id);
    formData.append("category", category);
    formData.append("description", description || "");
    formData.append("options", JSON.stringify([optionA, optionB, optionC, optionD]));
    formData.append("answer", imageQuestion[`option${correctOption}`]);
    formData.append("subject", subject);
    if (image) formData.append("image", image);

    try {
      const res = await axios.post("http://localhost:5000/api/quizzes/imagebaseqs", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) { resetForm(); fetchQuizzes(); }
    } catch (err) { console.error(err); }
  };

  const resetForm = () => {
    setQuizTitle(""); setQuizDuration(30); setQuizLimit(80); setQuizSession(""); setSubject(""); resetImageForm();
  };

  const resetImageForm = () => {
    setImageQuestion({
      category: "", image: null, description: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: "A", subject: "",
    });
    setShowImageForm(false); setCurrentQuizId(null); setIsNewQuiz(false);
  };

  const filteredQuizzes = quizzes.filter(
    (q) =>
      q.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.session.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-5 text-gray-800">Create Quiz</h2>

      {/* CSV / Create Quiz Form */}
      <div className="bg-white p-5 rounded-xl shadow-lg mb-6 space-y-4">
        <input type="text" placeholder="Quiz Title" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} className="border p-2 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400" />
        <div className="grid grid-cols-2 gap-4">
          <input type="number" placeholder="Duration" value={quizDuration} onChange={(e) => setQuizDuration(Number(e.target.value))} className="border p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400" />
          <input type="number" placeholder="Limit" value={quizLimit} onChange={(e) => setQuizLimit(Number(e.target.value))} className="border p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400" />
        </div>
        <input type="text" placeholder="Session" value={quizSession} onChange={(e) => setQuizSession(e.target.value)} className="border p-2 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400" />
        <select value={subject} onChange={(e) => setSubject(e.target.value)} className="border p-2 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400">
          <option value="">Select Subject</option>
          {facultyDetails?.subjects?.map((subj, idx) => (<option key={idx} value={subj}>{subj}</option>))}
        </select>
        <div className="flex space-x-3 items-center">
          <input type="file" accept=".csv" onChange={(e) => setQuizFile(e.target.files[0])} />
          <button onClick={handleQuizUpload} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition">Upload CSV</button>
          <button onClick={() => { setIsNewQuiz(true); setShowImageForm(true); }} className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-700 transition">Create Image Quiz</button>
        </div>
      </div>

      {/* Search */}
      <input type="text" placeholder="Search by subject/session" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="border p-2 w-full mb-4 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400" />

      {/* Quiz Table */}
      {showQuizTable && filteredQuizzes.length > 0 && (
        <div className="overflow-x-auto bg-white shadow rounded-xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {["Title","Subject","Duration","Session","Limit","Created At","Actions"].map((t,i) => <th key={i} className="px-4 py-2 text-left text-gray-700">{t}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredQuizzes.map((q) => (
                <tr key={q._id}>
                  <td className="px-4 py-2">{q.title}</td>
                  <td className="px-4 py-2">{q._id}</td>
                  <td className="px-4 py-2">{q.subject}</td>
                  <td className="px-4 py-2">{q.duration}</td>
                  <td className="px-4 py-2">{q.session}</td>
                  <td className="px-4 py-2">{q.limit}</td>
                  <td className="px-4 py-2">{new Date(q.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button className="bg-purple-600 text-white px-3 py-1 rounded-lg shadow hover:bg-purple-700 transition" onClick={() => { setCurrentQuizId(q._id); setIsNewQuiz(false); setShowImageForm(true); }}>Add Image Qs</button>
                    <button className="bg-red-600 text-white px-3 py-1 rounded-lg shadow hover:bg-red-700 transition" onClick={() => handleDeleteQuiz(q._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Image Question Modal */}
      {showImageForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-96 space-y-3">
            <h3 className="text-lg font-bold text-gray-800">{isNewQuiz ? "Create New Image Quiz" : "Add Image Question"}</h3>

            {isNewQuiz && (
              <>
                <input type="text" placeholder="Quiz Title" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} className="border p-2 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400" />
                <input type="text" placeholder="Session" value={quizSession} onChange={(e) => setQuizSession(e.target.value)} className="border p-2 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Limit" value={quizLimit} onChange={(e) => setQuizLimit(Number(e.target.value))} className="border p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400" />
                  <input type="number" placeholder="Duration" value={quizDuration} onChange={(e) => setQuizDuration(Number(e.target.value))} className="border p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400" />
                </div>
                <select value={imageQuestion.subject} onChange={(e) => setImageQuestion({...imageQuestion, subject: e.target.value})} className="border p-2 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400">
                  <option value="">Select Subject</option>
                  {facultyDetails?.subjects?.map((subj, idx) => (<option key={idx} value={subj}>{subj}</option>))}
                </select>
              </>
            )}

            {/* Common fields */}
            <input type="text" placeholder="Category" value={imageQuestion.category} onChange={(e) => setImageQuestion({...imageQuestion, category: e.target.value})} className="border p-2 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400" />
            <input type="text" placeholder="Description" value={imageQuestion.description} onChange={(e) => setImageQuestion({...imageQuestion, description: e.target.value})} className="border p-2 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400" />
            <input type="file" accept="image/*" onChange={(e) => setImageQuestion({...imageQuestion, image: e.target.files[0]})} />
            <div className="grid grid-cols-2 gap-2">
              {["A","B","C","D"].map(opt => (
                <input key={opt} type="text" placeholder={`Option ${opt}`} value={imageQuestion[`option${opt}`]} onChange={(e) => setImageQuestion({...imageQuestion, [`option${opt}`]: e.target.value})} className="border p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400" />
              ))}
            </div>
            <select value={imageQuestion.correctOption} onChange={(e) => setImageQuestion({...imageQuestion, correctOption: e.target.value})} className="border p-2 w-full rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400">
              {["A","B","C","D"].map(opt => <option key={opt} value={opt}>Option {opt}</option>)}
            </select>

            <div className="flex justify-between">
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition" onClick={isNewQuiz ? handleCreateImageQuiz : handleAddImageQuestion}>
                {isNewQuiz ? "Create Quiz" : "Add Question"}
              </button>
              <button className="bg-gray-400 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-500 transition" onClick={resetImageForm}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateQuiz;
