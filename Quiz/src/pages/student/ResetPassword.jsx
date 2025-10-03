import React, { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { token } = useParams(); // token from URL
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email; // email passed from Forgot page

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/student/reset-password", {
        token,
        password,
      });
      setMessage(res.data.message || "Password reset successfully!");
      setTimeout(() => navigate("/login"), 2000); // redirect to login
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
          Reset Password
        </h2>

        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="password"
            placeholder="Enter new password"
            className="w-full border border-blue-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm new password"
            className="w-full border border-blue-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {message && <p className="text-green-600 text-center mt-3">{message}</p>}
        {error && <p className="text-red-600 text-center mt-3">{error}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;
