import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleForgot = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/student/forgot-password",
        { email }
      );

      setMessage(res.data.message || "OTP sent to your email!");
      
      // Navigate to Reset Password page with token
      navigate(`/reset-password/${res.data.token}`, { state: { email } });

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
          Forgot Password
        </h2>
        <form onSubmit={handleForgot} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your registered email"
            className="w-full border border-blue-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        {message && <p className="text-green-600 text-center mt-3">{message}</p>}
        {error && <p className="text-red-600 text-center mt-3">{error}</p>}

        <p className="text-sm text-center mt-6">
          Remember password?{" "}
          <button onClick={() => navigate("/login")} className="text-blue-600 hover:underline">
            Back to Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
