import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email; // email passed from OTP verification

  // Guard: redirect if email is not available (OTP not verified)
  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirm) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/student/reset-password", { email, password });
      setMessage("Password reset successful!");
      setTimeout(() => navigate("/login"), 2000); // redirect to login
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50">
      <div className="backdrop-blur-lg bg-white/60 shadow-xl rounded-2xl p-8 w-full max-w-md border border-white/30">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-4">
          Reset Password
        </h2>
        <p className="text-gray-600 text-center mb-6">Enter your new password below.</p>

        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="password"
            placeholder="New password"
            className="w-full border border-blue-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white/70"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm new password"
            className="w-full border border-blue-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white/70"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-semibold transition-all duration-300 ${
              loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {message && <p className="text-green-600 text-center mt-4">{message}</p>}
        {error && <p className="text-red-600 text-center mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;
