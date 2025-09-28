import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CreateQuiz = ({ facultyDetails }) => {
  const [quizFile, setQuizFile] = useState(null);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDuration, setQuizDuration] = useState(30);
  const [quizzes, setQuizzes] = useState([]);
  const [showQuizTable, setShowQuizTable] = useState(false);

  const [showImageForm, setShowImageForm] = useState(false);
  const [imageQuestion, setImageQuestion] = useState({
    category: "",
    question: "",
    image: null,
    description:"",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOption: "A",
  });
  const [currentQuizId, setCurrentQuizId] = useState(null);

  const navigate = useNavigate();

  // Fetch quizzes
  const fetchQuizzes = async () => {
    if (!facultyDetails?._id) return;
    try {
      const res = await axios.get(
        `http://localhost:5000/api/faculty/${facultyDetails._id}/quizzes`
      );
      if (res.data.success) {
        setQuizzes(res.data.data);
        setShowQuizTable(true);
      } else {
        setQuizzes([]);
        setShowQuizTable(false);
      }
    } catch (err) {
      console.error("Fetch quizzes failed:", err);
    }
  };

  // Upload CSV Quiz
  const handleQuizUpload = async () => {
    if (!quizFile || !quizTitle || !quizDuration)
      return alert("Title, Duration, and CSV required");

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvText = e.target.result;
      try {
        const res = await axios.post("http://localhost:5000/api/quizzes/upload", {
          title: quizTitle,
          facultyId: facultyDetails._id,
          duration: quizDuration,
          csvData: csvText,
        });
        if (res.data.success) {
          setQuizzes((prev) => [...prev, res.data.data]);
          setQuizFile(null);
          setQuizTitle("");
          setQuizDuration(30);
          alert("Quiz uploaded successfully!");
        }
      } catch (err) {
        console.error("Quiz upload failed:", err);
        alert("Failed to upload quiz");
      }
    };
    reader.readAsText(quizFile);
  };

  // Add Image Question to Existing Quiz
  const handleAddImageQuestion = async () => {
    const { category, image,description, optionA, optionB, optionC, optionD, correctOption, question } =
      imageQuestion;

    if (!category || !image || !optionA || !optionB || !optionC || !optionD)
      return alert("All fields are required");

    if (!currentQuizId) return alert("Select a quiz first or create new quiz");

    const formData = new FormData();
    formData.append("image", image);
    formData.append("description", description|| "");
    formData.append("options", JSON.stringify([optionA, optionB, optionC, optionD]));
    formData.append("answer", imageQuestion[`option${correctOption}`]);
    formData.append("category", category);
    formData.append("question", question || "");

    try {
      const res = await axios.post(
        `http://localhost:5000/api/quizzes/${currentQuizId}/addqs`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        alert("Image question added successfully!");
        setShowImageForm(false);
        setImageQuestion({
          category: "",
          question: "",
          image: null,
          description:"",
          optionA: "",
          optionB: "",
          optionC: "",
          optionD: "",
          correctOption: "A",
        });
        fetchQuizzes();
      }
    } catch (err) {
      console.error("Add image question failed:", err.response || err);
      alert("Failed to add question.");
    }
  };

  // Create New Quiz with First Image Question
  const handleCreateQuizWithImage = async () => {
    const { category, question, image,description, optionA, optionB, optionC, optionD, correctOption } =
      imageQuestion;

    if (!quizTitle || !quizDuration || !category || !image || !optionA || !optionB || !optionC || !optionD)
      return alert("All fields are required");

    const formData = new FormData();
    formData.append("title", quizTitle);
    formData.append("duration", quizDuration);
    formData.append("facultyId", facultyDetails._id);
    formData.append("category", category);
    formData.append("question", question || "");
    formData.append("options", JSON.stringify([optionA, optionB, optionC, optionD]));
    formData.append("answer", imageQuestion[`option${correctOption}`]);
    formData.append("image", image);
        formData.append("description", description|| "");


    try {
      const res = await axios.post(
        "http://localhost:5000/api/quizzes/imagebaseqs",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        alert("Quiz created with first image question!");
        setShowImageForm(false);
        setCurrentQuizId(res.data.data._id);
        setImageQuestion({
          category: "",
          question: "",
          image: null,
          description:"",
          optionA: "",
          optionB: "",
          optionC: "",
          optionD: "",
          correctOption: "A",
        });
        setQuizTitle("");
        setQuizDuration(30);
        fetchQuizzes();
      }
    } catch (err) {
      console.error("Create quiz with image failed:", err.response || err);
      alert("Failed to create quiz.");
    }
  };

    const handleDeleteQuiz = async (quizId) => {
    try {
  
      const res = await axios.delete(
        `http://localhost:5000/api/quizzes/${quizId}`
      );
      if(res.data){
        alert("Quiz delete Successfully")
      }
      if (res.data.success) {
        setQuizzes((prev) => prev.filter((quiz) => quiz._id !== quizId));
      } else {
        alert("Failed to delete quiz");
      }

    } catch (err) {
      console.error(err);
      alert("Error deleting quiz");
    }
  };

  return (
    <div className="relative">
      {/* Create Quiz / Upload CSV Section */}
      <div className="mt-4 p-4 border rounded-lg shadow-md bg-gray-50">
        <h4 className="text-md font-medium mb-2">Create Quiz</h4>
        <input
          type="text"
          placeholder="Enter Quiz Title"
          value={quizTitle}
          onChange={(e) => setQuizTitle(e.target.value)}
          className="border p-2 w-full mb-3 rounded-md shadow-sm"
        />
        <input
          type="number"
          placeholder="Quiz Duration (minutes)"
          value={quizDuration}
          onChange={(e) => setQuizDuration(Number(e.target.value))}
          className="border p-2 w-full mb-3 rounded-md shadow-sm"
          min={1}
        />
        <div className="flex items-center space-x-2">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setQuizFile(e.target.files[0])}
            className="border p-2 rounded-md"
          />
          <button
            onClick={handleQuizUpload}
            className="bg-[#243278] text-white px-4 py-2 hover:bg-[#222d66] rounded"
          >
            Upload Quiz (CSV)
          </button>
          <button
            onClick={fetchQuizzes}
            className="bg-[#243278] text-white px-4 py-2 hover:bg-[#222d66] rounded"
          >
            Get My Quizzes
          </button>
          <button
            onClick={() => setShowImageForm(true)}
            className="bg-[#243278] text-white px-4 py-2 hover:bg-[#222d66] rounded"
          >
            Add / Create Image Quiz
          </button>
        </div>
      </div>

      {/* Quiz Table */}
      {showQuizTable && quizzes.length > 0 && (
        <div className="mt-6 p-4 border rounded-lg shadow-md bg-white relative">
          <button
            onClick={() => setShowQuizTable(false)}
            className="absolute top-2 right-2 text-red-500 font-bold"
          >
            ✕
          </button>
          <h4 className="text-md font-medium mb-3">All My Quizzes</h4>
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">Quiz ID</th>
                <th className="border px-4 py-2">Quiz Title</th>
                <th className="border px-4 py-2">Duration (mins)</th>
                <th className="border px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <tr key={quiz._id} className="text-center">
                  <td className="border px-4 py-2">{quiz._id}</td>
                  <td className="border px-4 py-2">{quiz.title}</td>
                  <td className="border px-4 py-2">{quiz.duration || "-"}</td>
                  <td className="border px-4 py-2 flex justify-center space-x-2">
                    <button
                      onClick={() => {
                        setCurrentQuizId(quiz._id);
                        setShowImageForm(true);
                      }}
                      className="bg-[#1f2757] text-white px-2 py-1 rounded hover:bg-[#334081]"
                    >
                      Add Image Question
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/quiz-results/${quiz._id}`, {
                          state: { quiz, facultyDetails },
                        })
                      }
                      className="bg-[#243278] text-white px-2 py-1 rounded hover:bg-[#222d66]"
                    >
                      View Results
                    </button>
                     <button
                      onClick={() => handleDeleteQuiz(quiz._id)}
                      className="bg-red-700 text-white px-2 py-1 rounded hover:bg-amber-700"
                    >
                      Delete
                    </button>
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
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 space-y-3">
            <h4 className="font-bold text-lg mb-2">Add / Create Image Quiz</h4>

            {!currentQuizId && (
              <>
                <input
                  type="text"
                  placeholder="Quiz Title"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="border p-1 w-full rounded mb-2"
                />
                <input
                  type="number"
                  placeholder="Quiz Duration (minutes)"
                  value={quizDuration}
                  onChange={(e) => setQuizDuration(Number(e.target.value))}
                  className="border p-1 w-full rounded mb-2"
                  min={1}
                />
              </>
            )}

            <input
              type="text"
              placeholder="Category"
              value={imageQuestion.category}
              onChange={(e) =>
                setImageQuestion({ ...imageQuestion, category: e.target.value })
              }
              className="border p-1 w-full rounded"
            />
            {/* <input
              type="text"
              placeholder="Question (optional)"
              value={imageQuestion.question}
              onChange={(e) =>
                setImageQuestion({ ...imageQuestion, question: e.target.value })
              }
              className="border p-1 w-full rounded"
            /> */}
            <input
              type="text"
              placeholder="Question Description"
              value={imageQuestion.description}
              onChange={(e) =>
                setImageQuestion({ ...imageQuestion, description: e.target.value })
              }
              className="border p-1 w-full rounded"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setImageQuestion({ ...imageQuestion, image: e.target.files[0] })
              }
            />
            <input
              type="text"
              placeholder="Option A"
              value={imageQuestion.optionA}
              onChange={(e) =>
                setImageQuestion({ ...imageQuestion, optionA: e.target.value })
              }
              className="border p-1 w-full rounded"
            />
            <input
              type="text"
              placeholder="Option B"
              value={imageQuestion.optionB}
              onChange={(e) =>
                setImageQuestion({ ...imageQuestion, optionB: e.target.value })
              }
              className="border p-1 w-full rounded"
            />
            <input
              type="text"
              placeholder="Option C"
              value={imageQuestion.optionC}
              onChange={(e) =>
                setImageQuestion({ ...imageQuestion, optionC: e.target.value })
              }
              className="border p-1 w-full rounded"
            />
            <input
              type="text"
              placeholder="Option D"
              value={imageQuestion.optionD}
              onChange={(e) =>
                setImageQuestion({ ...imageQuestion, optionD: e.target.value })
              }
              className="border p-1 w-full rounded"
            />
            <select
              value={imageQuestion.correctOption}
              onChange={(e) =>
                setImageQuestion({ ...imageQuestion, correctOption: e.target.value })
              }
              className="border p-1 w-full rounded"
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>

            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => setShowImageForm(false)}
                className="bg-[#243278] text-white px-3 py-1 rounded hover:bg-[#222d66]"
              >
                Cancel
              </button>
              {currentQuizId ? (
                <button
                  onClick={handleAddImageQuestion}
                  className="bg-[#243278] text-white px-3 py-1 rounded hover:bg-[#222d66]"
                >
                  Add Question
                </button>
              ) : (
                <button
                  onClick={handleCreateQuizWithImage}
                  className="bg-[#243278] text-white px-3 py-1 rounded hover:bg-[#222d66]"
                >
                  Create Quiz
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateQuiz;
