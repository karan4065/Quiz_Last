import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast,{Toaster} from 'react-hot-toast'
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [stage, setStage] = useState("email"); // "email" or "otp"
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(0); // OTP resend timer
  const navigate = useNavigate();

  // Countdown effect
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Step 1: Send OTP
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await axios.post("http://localhost:5000/api/student/forgot-password", { email });
      setMessage(res.data.message || "OTP sent to your email!");
      setStage("otp"); // move to OTP stage
      setTimer(60); // start 60 sec countdown
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
await axios.post(
  "https://quiz-last.onrender.com/api/student/verify-otp",
  { email, otp }
);

      setMessage("OTP verified successfully!");
      setTimeout(() => navigate("/reset-password", { state: { email } }), 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
const res = await axios.post(
  "https://quiz-last.onrender.com/api/student/forgot-password",
  { email }
);

      setMessage(res.data.message || "OTP resent to your email!");
      setTimer(60); // restart countdown
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
          Forgot Password
        </h2>
        <p className="text-gray-600 text-center mb-6">
          {stage === "email"
            ? "Enter your registered email to receive an OTP."
            : "Enter the OTP sent to your email."}
        </p>

        <form onSubmit={stage === "email" ? handleEmailSubmit : handleOtpSubmit} className="space-y-4">
          {stage === "email" ? (
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full border border-blue-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white/70"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          ) : (
            <>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                className="w-full border border-blue-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white/70 tracking-widest text-center font-semibold"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              <div className="flex justify-between items-center text-sm text-gray-600">
                {timer > 0 ? (
                  <p>Resend OTP in {timer}s</p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-blue-700 hover:underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-semibold transition-all duration-300 ${
              loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading
              ? stage === "email"
                ? "Sending OTP..."
                : "Verifying..."
              : stage === "email"
              ? "Send OTP"
              : "Verify OTP"}
          </button>
        </form>

        {message && <p className="text-green-600 text-center mt-4">{message}</p>}
        {error && <p className="text-red-600 text-center mt-4">{error}</p>}

        <div className="text-center mt-6">
          <button onClick={() => navigate("/login")} className="text-blue-700 font-medium hover:underline">
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
