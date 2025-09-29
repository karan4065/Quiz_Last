// Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    // Attempt faculty login first
    let response = await fetch("http://localhost:5000/api/faculty/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: username, password }),
      credentials: "include",
    });

    let result = await response.json();

    if (response.ok && result.success) {
      if (result.data.isAdmin) {
        // Admin login
        navigate("/admin-dashboard", {
          state: { facultyDetails: result.data },
        });
      } else {
        // Regular faculty login
        navigate("/dashboard", {
          state: { facultyDetails: result.data },
        });
      }
    } else {
      alert("Invalid Username or Password");
    }
  } catch (error) {
    console.error("An error occurred:", error);
    alert(
      `An error occurred: ${error.message || "Please try again later."}`
    );
  }
};


  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-[#4a0e23] via-[#6d1b3b] to-[#8e244d]">
      {/* Top Heading */}
      <header className="text-center py-6 bg-white shadow-md">
        <h1 className="text-3xl font-bold text-[#6d1b3b]">
          St. Vincent Pallotti College of Engineering & Technology
        </h1>
        <p className="text-gray-600 mt-1 text-lg font-medium">
          Faculty Quiz Login Portal
        </p>
      </header>

      {/* Main Login Card */}
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-10">
          <h2 className="text-2xl font-bold text-center mb-8 text-[#6d1b3b]">
            Faculty Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label
                className="block text-sm font-semibold text-gray-700 mb-1"
                htmlFor="username"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6d1b3b]"
                placeholder="Enter your username"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-sm font-semibold text-gray-700 mb-1"
                htmlFor="password"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6d1b3b]"
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#6d1b3b] text-white font-semibold py-3 rounded-lg shadow-md hover:bg-[#4a0e23] transition duration-300"
            >
              Login
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-gray-200 py-4 text-sm bg-[#4a0e23]/90">
        © 2025 St. Vincent Pallotti College of Engineering & Technology | All
        Rights Reserved
      </footer>
    </div>
  );
};

export default Login;
