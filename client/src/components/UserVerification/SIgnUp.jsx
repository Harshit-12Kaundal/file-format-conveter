import React, { useState } from 'react';
import { auth } from '../firebaseConfig'; // Correct Firebase auth import
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendEmailVerification, updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc'; // Google icon from react-icons
import {Link} from 'react-router-dom'
import pdfsimpLogo from '../../Images/pdfsimp.png';


function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmpassword: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate(); // React Router for navigation

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  // Google Authentication handler
  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Google signup successful, user:', result.user);
      alert('Google signup successful');
      navigate('/main'); // Redirect to homepage after signup
    } catch (error) {
      console.error('Error with Google signup:', error.message);
      setErrorMessage(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmpassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      console.log('User created: ', userCredential.user);

      // Update user's profile with username
      await updateProfile(userCredential.user, {
        displayName: formData.username,
      });
      console.log('Username updated:', formData.username);

      // Send verification email
      await sendEmailVerification(userCredential.user);
      console.log('Verification email sent.');

      setSuccessMessage('Registration successful! Please check your email to verify your account.');

      // Redirect after successful signup
      setTimeout(() => {
        navigate('/login'); // Redirect to login after a short delay
      }, 2000); // Adjust delay as needed

    } catch (error) {
      console.error('Error registering user:', error.message);
      setErrorMessage(error.message);
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
        <h2 className="text-xl font-bold text-center text-white mb-3 font-sans">Create new acccount</h2>

        {errorMessage && <p className="text-red-500 text-center mb-4">{errorMessage}</p>}
        {successMessage && <p className="text-green-500 text-center mb-4">{successMessage}</p>}

        <form onSubmit={handleSubmit}>
          {/* Username field */}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="username">
              UserName
            </label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email field */}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
              placeholder="Enter your email"
            />
          </div>

          {/* Password field */}
          <div className="mb-4">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
              placeholder="Enter your password"
            />
          </div>

          {/* Confirm Password field */}
          <div className="mb-6">
            <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="confirmpassword">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmpassword"
              value={formData.confirmpassword}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
              placeholder="Confirm your password"
            />
          </div>

          {/* Sign up button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Sign Up
          </button>
        </form>

        {/* Modernized Social Signup */}
        <div className="my-4 text-center">
          <p className="text-gray-400 mb-2">Or sign up with:</p>
          <button
            onClick={handleGoogleSignup}
            className="flex items-center justify-center w-12 h-12 bg-gray-700 rounded-full shadow-md hover:bg-gray-600 transition duration-300 mx-auto"
          >
            <FcGoogle size={24} />
          </button>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-blue-500 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

export default Signup;
