import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const StudentLogin = () => {
  const [uid, setUid] = useState("");
  const [password, setPassword] = useState("");
  const [quizId, setQuizId] = useState("");
  const [email, setEmail] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const navigate = useNavigate();

  // 🔹 Prevent Esc, Tab, and browser close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" || e.key === "Tab") e.preventDefault();
    };
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // 🔹 Login Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/student/login",
        { uid, password, quizId },
        { withCredentials: true }
      );

      if (response.data.success) {
        setSuccessMsg("Login successful! Redirecting...");
        navigate(`/quiz/${response.data.data.quizId}`);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Forgot Password
  const handleForgot = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    try {
      const res = await axios.post("http://localhost:5000/api/student/forgot-password", { email });
      setSuccessMsg(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Error sending reset link");
    }
  };

  // 🔹 Reset Password
  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    try {
      const res = await axios.post("http://localhost:5000/api/student/reset-password", {
        token: resetToken,
        password: newPassword,
      });
      setSuccessMsg(res.data.message);
      setShowForgot(false);
    } catch (err) {
      setError(err.response?.data?.message || "Error resetting password");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top White Section */}
      <div className="bg-white text-center py-6 shadow-sm">
        <h1 className="text-2xl md:text-3xl font-bold text-[#243185]">
          St. Vincent Pallotti College of Engineering & Technology
        </h1>
        <p className="text-gray-600">Student Quiz Login Portal</p>
      </div>

      {/* Bottom Gradient Section */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-[#1e3a8a] to-[#1e40af]">
        <div className="bg-white text-black p-8 rounded-2xl shadow-xl w-full max-w-md">
          {!showForgot ? (
            <form onSubmit={handleSubmit}>
              <h2 className="text-2xl font-bold mb-6 text-center text-[#243185]">
                Student Login
              </h2>
              <label className="block text-sm font-medium mb-1">UID</label>
              <input
                type="text"
                placeholder="Enter UID"
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <label className="block text-sm font-medium mb-1">Quiz ID</label>
              <input
                type="text"
                placeholder="Enter quiz ID"
                value={quizId}
                onChange={(e) => setQuizId(e.target.value)}
                className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-700 text-white p-2 rounded hover:bg-blue-800 transition"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
              <p
                className="text-blue-600 mt-4 text-sm cursor-pointer text-center hover:underline"
                onClick={() => setShowForgot(true)}
              >
                Forgot Password?
              </p>
              {error && <p className="text-red-600 mt-2 text-center">{error}</p>}
              {successMsg && <p className="text-green-600 mt-2 text-center">{successMsg}</p>}
            </form>
          ) : (
            <div>
              <h2 className="text-xl font-bold mb-4 text-center text-[#243185]">
                Forgot Password
              </h2>
              <form onSubmit={handleForgot}>
                <input
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mb-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
                >
                  Send Reset Link
                </button>
              </form>
              <form onSubmit={handleReset} className="mt-4">
                <input
                  type="text"
                  placeholder="Enter reset token"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className="w-full mb-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full mb-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700 transition"
                >
                  Reset Password
                </button>
              </form>
              {error && <p className="text-red-600 mt-2 text-center">{error}</p>}
              {successMsg && <p className="text-green-600 mt-2 text-center">{successMsg}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 text-sm text-gray-200 bg-[#1e3a8a]">
        © 2025 St. Vincent Pallotti College of Engineering & Technology | All Rights Reserved
      </footer>
    </div>
  );
};

export default StudentLogin;
