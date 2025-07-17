import { useState, useEffect } from "react";
import axios from "axios";
import { auth } from "../firebaseConfig";
import usernameImage from "../../Images/username.jpg";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [message, setMessage] = useState("");
  const [darkMode] = useState(true); // Set dark mode as default

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setName(currentUser.displayName || "");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    try {
      // Update the Firebase user's profile
      // await auth.currentUser.updateProfile({
      //     displayName: name,
      // });
      // Update user details in your backend database
      const response = await axios.post("http://localhost:3001/data/save", {
        userId: user.uid, // Assuming `uid` is the user ID from Firebase Auth
        name,
        age,
        gender,
      });

      if (response.status === 200) {
        setMessage("Profile updated successfully!");
        setEditMode(false);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage(
        error.response?.data?.message || "Server error, please try again later."
      );
    }
  };

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className={`flex justify-center items-center min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"}`}>
      <div className={`p-6 rounded-lg shadow-lg w-80 text-center ${darkMode ? "bg-gray-800" : "bg-white"}`}>
        {message && (
          <p className={`text-sm ${message.includes("successfully") ? "text-green-500" : "text-red-500"}`}>
            {message}
          </p>
        )}
        <div className="mb-4">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              className="rounded-full w-24 h-24 mx-auto"
              alt="User Avatar"
            />
          ) : (
            <div className="rounded-full w-24 h-24 flex justify-center items-center mx-auto">
              <img src={usernameImage} alt="Default Avatar" className="rounded-full"/>
            </div>
          )}
        </div>
        <h2 className="text-2xl font-semibold mb-4">Profile</h2>

        {!editMode ? (
          <>
            <p className="text-lg font-medium">Name: {name}</p>
            <p className="text-lg font-medium">Age: {age || "Not set"}</p>
            <p className="text-lg font-medium">Gender: {gender || "Not set"}</p>
            <button
              onClick={() => setEditMode(true)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Edit Profile
            </button>
          </>
        ) : (
          <>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"}`}
              />
            </div>
            <div className="mb-4">
              <input
                type="number"
                placeholder="Enter your age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"}`}
              />
            </div>
            <div className="mb-4">
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${darkMode ? "bg-gray-700 text-white border-gray-600" : "bg-white text-black border-gray-300"}`}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <button
              onClick={handleSave}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Save
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="mt-4 ml-2 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
