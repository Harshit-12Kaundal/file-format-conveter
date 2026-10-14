import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const VerifyOtp = ({ setOtpVerified }) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { state } = useLocation();

  const email = state?.email;

  const verifyOtp = async () => {
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }

    try {
      await axios.post(
        "http://localhost:3001/api/auth/verify-otp",
        { email, otp },
        { withCredentials: true }
      );

      localStorage.setItem("otpVerified", "true");
      setOtpVerified(true);
      navigate("/main");
    } catch (err) {
      // Show the REAL backend message instead of a hardcoded string,
      // so we can actually tell which branch failed server-side.
      console.error("OTP verify failed - full error:", err);
      console.error("OTP verify failed - response body:", err.response?.data);
      setError(err.response?.data?.message || err.message || "Something went wrong");
    }
  };

  return (
    <div
      className="
        flex items-center justify-center min-h-screen
        bg-gray-50 text-black
        dark:bg-gray-900 dark:text-white
        transition-colors duration-300
      "
    >
      <div
        className="
          w-full max-w-md rounded-xl shadow-xl p-8
          bg-white/90 dark:bg-gray-800/90 backdrop-blur
          border border-gray-200 dark:border-gray-700
          transition-colors duration-300
        "
      >
        <h2 className="text-2xl font-bold text-center mb-3">
          Verify OTP
        </h2>

        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
          Enter the 6-digit OTP sent to your email
        </p>

        {!email && (
          <p className="text-yellow-500 text-center mb-4 text-sm">
            No email found for this session - go back and sign in/sign up again.
          </p>
        )}

        {error && (
          <p className="text-red-500 text-center mb-4">
            {error}
          </p>
        )}

        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          className="
            w-full px-4 py-2 mb-6 rounded-lg
            bg-gray-200 dark:bg-gray-700
            text-black dark:text-white text-center
            tracking-widest text-xl
            focus:ring-2 focus:ring-blue-500 outline-none
            transition-colors duration-300
          "
        />

        <button
          onClick={verifyOtp}
          className="
            w-full py-2 rounded-lg font-semibold
            bg-blue-600 text-white
            hover:bg-blue-700
            transition duration-300
          "
        >
          Verify OTP
        </button>
      </div>
    </div>
  );
};

export default VerifyOtp;