import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendEmailVerification } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import pdfsimpLogo from "../../Images/pdfsimp.png";
import {Link} from "react-router-dom";

function Login() {
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEmailNotVerified, setIsEmailNotVerified] = useState(false); // State to track email verification status
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
        formData.usernameOrEmail,
        formData.password
      );
      const user = userCredential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        setErrorMessage('Please verify your email before logging in.');
        setIsEmailNotVerified(true); // Mark email as not verified
        return;
      }

      console.log('User logged in:', user);
      setSuccessMessage('Login successful!');
      navigate('/main'); // Redirect to the homepage or dashboard
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

      // Check if email is verified
      if (!user.emailVerified) {
        setErrorMessage('Please verify your email before logging in.');
        setIsEmailNotVerified(true); // Mark email as not verified
        return;
      }

      console.log('Google Login Successful:', user);
      navigate('/'); // Redirect to the homepage or dashboard
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
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-md p-8">
        <div className="flex justify-center items-center h-full space-x-8 mb-3">
            <Link to="/">
              <img
                src={pdfsimpLogo}
                className="w-12 rounded-lg"
                alt="PDF Simp Logo"
                loading="lazy"
                />
            </Link>
        </div>
        <h2 className="text-2xl font-bold text-center text-white mb-8">Login into Your account</h2>

        {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}
        {successMessage && <p className="text-green-500 text-center mb-4">{successMessage}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="usernameOrEmail" className="block text-sm font-bold text-gray-300 mb-2">
              Username or Email
            </label>
            <input
              type="text"
              id="usernameOrEmail"
              value={formData.usernameOrEmail}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
              placeholder="Enter your username or email"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-bold text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Login
          </button>
        </form>

        {/* Google Login */}
        <div className="my-4 text-center">
          <p className="text-gray-400 mb-2">Or sign up with:</p>
          <button
            onClick={handleGoogleLogin}
            className="flex items-center justify-center w-12 h-12 bg-gray-700 rounded-full shadow-md hover:bg-gray-600 transition duration-300 mx-auto"
          >
            <FcGoogle size={24} />
          </button>
        </div>

        <p className="text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <a href="/signup" className="text-blue-500 hover:underline">
            Sign up
          </a>
        </p>

        {/* Resend verification email */}
        {isEmailNotVerified && (
          <div className="text-center mt-4">
            <button
              onClick={handleResendVerification}
              className="text-blue-500 hover:underline"
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
