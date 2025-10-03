import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Seeresult = () => {
  const [uid, setUid] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/student/resultlogin",
        { uid, password },
        { withCredentials: true }
      );

      if (response.data.success) {
        localStorage.setItem("studentDetails", JSON.stringify(response.data.data));
        // Redirect to student's result page
        navigate(`/result/${response.data.data.uid}`);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Top Heading */}
      <header className="text-center py-6 bg-white shadow-md">
        <h1 className="text-3xl font-bold text-blue-800">
          St. Vincent Pallotti College of Engineering & Technology
        </h1>
        <p className="text-gray-600 mt-1 text-lg font-medium">Student Result Portal</p>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 relative">
        {/* Left: Login Form */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-10 relative z-10">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 md:p-10 relative z-10">
            <h2 className="text-2xl font-bold text-center mb-8 text-blue-700">
              Student Login
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  UID
                </label>
                <input
                  type="text"
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                  className="w-full p-3 border border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your UID"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-blue-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && <p className="text-red-600 mt-2 text-center">{error}</p>}

              <button
                type="submit"
                className="w-full bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-blue-800 transition duration-300"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Image */}
        <div className="flex-1 hidden md:flex items-center justify-center -ml-16">
          <img
            src="https://img.freepik.com/free-vector/access-control-system-abstract-concept_335657-3180.jpg?semt=ais_hybrid&w=740&q=80"
            alt="Student Login Illustration"
            className="object-contain h-[28rem] md:h-[34rem] w-[28rem] md:w-[34rem] rounded-xl"
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-gray-500 py-4 text-sm bg-white border-t">
        © 2025 St. Vincent Pallotti College of Engineering & Technology | All Rights Reserved
      </footer>
    </div>
  );
};

export default Seeresult;
