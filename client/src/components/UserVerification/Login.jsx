// src/components/Login/Login.jsx
import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendEmailVerification } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import pdfsimpLogo from "../../Images/pdfsimp.png";
import { Link } from "react-router-dom";
import axios from 'axios';

function Login({setOtpVerified}) {
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEmailNotVerified, setIsEmailNotVerified] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.usernameOrEmail || !formData.password) {
      setErrorMessage('Please fill in both fields');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.usernameOrEmail.trim(),
        formData.password
      );
      const user = userCredential.user;
      await user.reload();

      if (!user.emailVerified) {
        setErrorMessage('Please verify your email before logging in.');
        setIsEmailNotVerified(true);
        return;
      }
      localStorage.removeItem("otpVerified");
      setOtpVerified(false); // prop passed down from App.js, same as VerifyOtp gets

      localStorage.setItem("user", JSON.stringify({ email: user.email }));

      await axios.post('http://localhost:3001/api/auth/send-otp',{ email: user.email });

      navigate('/verify-otp',{ state:{ email: user.email } });

    } catch (error) {
      console.error('Error logging in:', error.message);
      setErrorMessage(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.emailVerified) {
        setErrorMessage('Please verify your email before logging in.');
        setIsEmailNotVerified(true);
        return;
      }
      localStorage.removeItem("otpVerified");
      setOtpVerified(false);

      localStorage.setItem("user", JSON.stringify({ email: user.email }));

      await axios.post('http://localhost:3001/api/auth/send-otp',{ email: user.email });
      navigate('/verify-otp',{ state:{ email: user.email } });

    } catch (error) {
      console.error('Error with Google Login:', error.message);
      setErrorMessage('Failed to login with Google. Please try again.');
    }
  };

  const handleResendVerification = async () => {
    try {
      await sendEmailVerification(auth.currentUser);
      alert('Verification email sent! Please check your inbox.');
    } catch (error) {
      console.error('Error resending verification email:', error.message);
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
      {/* CARD */}
      <div
        className="
          w-full max-w-md rounded-xl shadow-xl p-8
          bg-white/90 dark:bg-gray-800/90 backdrop-blur
          border border-gray-200 dark:border-gray-700
          transition-colors duration-300
        "
      >
        {/* Logo */}
        <div className="flex justify-center items-center mb-4">
          <Link to="/">
            <img
              src={pdfsimpLogo}
              className="w-14 rounded-lg"
              alt="PDF Simp Logo"
              loading="lazy"
            />
          </Link>
        </div>

        <h2 className="text-2xl font-bold text-center mb-6">
          Login into your account
        </h2>

        {/* Messages */}
        {errorMessage && <p className="text-red-500 text-center mb-3">{errorMessage}</p>}
        {successMessage && <p className="text-green-500 text-center mb-3">{successMessage}</p>}

        {/* FORM */}
        <form onSubmit={handleSubmit}>

          <label className="block text-sm font-semibold mb-1">
            Username or Email
          </label>
          <input
            type="text"
            id="usernameOrEmail"
            value={formData.usernameOrEmail}
            onChange={handleChange}
            className="
              w-full px-3 py-2 rounded-lg mb-4
              bg-gray-200 dark:bg-gray-700
              text-black dark:text-white
              focus:ring-2 focus:ring-blue-500
              transition-colors duration-300
            "
            placeholder="Enter your username or email"
          />

          <label className="block text-sm font-semibold mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            className="
              w-full px-3 py-2 rounded-lg mb-6
              bg-gray-200 dark:bg-gray-700
              text-black dark:text-white
              focus:ring-2 focus:ring-blue-500
              transition-colors duration-300
            "
            placeholder="Enter your password"
          />

          <button
            type="submit"
            className="
              w-full py-2 rounded-lg font-semibold
              bg-blue-600 text-white
              hover:bg-blue-700
              transition duration-300
            "
          >
            Login
          </button>
        </form>

        {/* Google Login */}
        <div className="mt-5 mb-3 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-1">Or continue with</p>

          <button
            onClick={handleGoogleLogin}
            className="
              flex items-center justify-center w-12 h-12 mx-auto
              bg-gray-200 dark:bg-gray-700
              rounded-full shadow-sm
              hover:bg-gray-300 dark:hover:bg-gray-600
              transition-all
            "
          >
            <FcGoogle size={24} />
          </button>
        </div>

        {/* Signup Link */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>

        {/* Resend verification email */}
        {isEmailNotVerified && (
          <div className="text-center mt-4">
            <button
              onClick={handleResendVerification}
              className="text-blue-600 hover:underline"
            >
              Resend verification email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
