import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

const BlockedStudent = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlockedStudents = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/faculty/quizzes/blocked-students",
          { withCredentials: true }
        );
        if (data.success) setQuizzes(data.data);
      } catch (e) {
        console.error(e);
        toast.error("Failed to fetch blocked students.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlockedStudents();
  }, []);

  const handleUnblock = async (quizId, studentId) => {
    try {
      await axios.post(
        `http://localhost:5000/api/faculty/quizzes/${quizId}/unblock-student`,
        { studentId },
        { withCredentials: true }
      );

      setQuizzes((prev) =>
        prev.map((q) =>
          q.quizId === quizId
            ? {
                ...q,
                blockedStudents: q.blockedStudents.filter(
                  (s) => s._id !== studentId
                ),
              }
            : q
        )
      );

      toast.success("Student successfully unfrozen!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to unblock student.");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-semibold">Loading blocked students...</p>
      </div>
    );

  if (quizzes.length === 0)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-semibold">No blocked students found.</p>
      </div>
    );

  return (
    <div className="flex">

      <div className="flex-1 p-6 bg-gray-100 min-h-screen">
        <Toaster position="top-right" reverseOrder={false} />
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Blocked Students
        </h1>

        {quizzes.map((quiz) => (
          <div
            key={quiz.quizId}
            className="mb-6 border rounded-lg p-4 bg-white shadow-md"
          >
            <h2 className="text-xl font-semibold mb-3 text-gray-700">
              {quiz.title}
            </h2>

            {quiz.blockedStudents.length === 0 ? (
              <p className="text-gray-500">No blocked students in this quiz.</p>
            ) : (
              <ul className="space-y-3">
                {quiz.blockedStudents.map((student) => (
                  <li
                    key={student._id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 rounded-lg p-3 shadow-sm"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        {student.name} ({student.studentId})
                      </p>
                      <p className="text-sm text-gray-500">
                        {student.email} - Year {student.year}
                      </p>
                    </div>
                    <button
                      onClick={() => handleUnblock(quiz.quizId, student._id)}
                      className="mt-2 sm:mt-0 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
                    >
                      Unfreeze
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlockedStudent;
