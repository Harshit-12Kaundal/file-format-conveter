// src/components/Login/Signup.jsx
import React, { useState } from "react";
import { auth } from "../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import pdfsimpLogo from "../../Images/pdfsimp.png";
import axios from "axios";

function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmpassword: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  /* ---------------- GOOGLE SIGNUP ---------------- */
  const handleGoogleSignup = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await axios.post("http://localhost:3001/api/auth/send-otp", {
        email: user.email,
      });

      navigate("/verify-otp", { state: { email: user.email } });
    } catch (error) {
      console.error("Google signup error:", error);
      setErrorMessage("Google signup failed");
    }
  };

  /* ---------------- EMAIL + PASSWORD SIGNUP ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (formData.password !== formData.confirmpassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: formData.username });
      await sendEmailVerification(user);

      setSuccessMessage(
        "Registration successful! Please verify your email before logging in."
      );

      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      console.error("Signup error:", error);
      setErrorMessage(error.message);
    }
  };

  return (
    <div
      className="
      flex items-center justify-center min-h-screen
      bg-gray-50 text-black
      dark:bg-gray-900 dark:text-white
      transition-colors duration-300
    ">
      {/* CARD */}
      <div
        className="
          w-full max-w-md rounded-xl shadow-xl p-8
          bg-white/90 dark:bg-gray-800/90 backdrop-blur
          border border-gray-200 dark:border-gray-700
          transition-colors duration-300
        "
      >
        {/* LOGO */}
        <div className="flex justify-center mb-5">
          <Link to="/">
            <img src={pdfsimpLogo} className="w-14 rounded-lg" alt="PDF Simp Logo" />
          </Link>
        </div>

        <h2 className="text-2xl font-bold text-center mb-4">
          Create new account
        </h2>

        {/* MESSAGES */}
        {errorMessage && (
          <p className="text-red-500 text-center mb-3">{errorMessage}</p>
        )}
        {successMessage && (
          <p className="text-green-500 text-center mb-3">{successMessage}</p>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <input
            id="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="
              w-full mb-3 px-3 py-2 rounded-lg
              bg-gray-200 dark:bg-gray-700
              text-black dark:text-white
              focus:ring-2 focus:ring-blue-500
              transition-colors
            "
          />

          <input
            id="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="
              w-full mb-3 px-3 py-2 rounded-lg
              bg-gray-200 dark:bg-gray-700
              text-black dark:text-white
              focus:ring-2 focus:ring-blue-500
              transition-colors
            "
          />

          <input
            id="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="
              w-full mb-3 px-3 py-2 rounded-lg
              bg-gray-200 dark:bg-gray-700
              text-black dark:text-white
              focus:ring-2 focus:ring-blue-500
              transition-colors
            "
          />

          <input
            id="confirmpassword"
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmpassword}
            onChange={handleChange}
            className="
              w-full mb-5 px-3 py-2 rounded-lg
              bg-gray-200 dark:bg-gray-700
              text-black dark:text-white
              focus:ring-2 focus:ring-blue-500
              transition-colors
            "
          />

          {/* SUBMIT */}
          <button
            className="
              w-full py-2 rounded-lg font-semibold
              bg-blue-600 text-white
              hover:bg-blue-700
              transition duration-300
            "
          >
            Sign Up
          </button>
        </form>

        {/* GOOGLE SIGNUP */}
        <div className="my-5 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            Or sign up with
          </p>
          <button
            onClick={handleGoogleSignup}
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

        {/* LOGIN LINK */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
