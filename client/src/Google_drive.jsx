import React, { useEffect, useState } from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const GoogleDriveButton = () => {
  const [isGoogleApiReady, setGoogleApiReady] = useState(false);
  const [authStatus, setAuthStatus] = useState("");

  useEffect(() => {
    const loadGapiScript = () => {
      return new Promise((resolve, reject) => {
        if (!window.gapi) {
          const script = document.createElement("script");
          script.src = "https://apis.google.com/js/api.js";
          script.onload = () => resolve("GAPI loaded.");
          script.onerror = () => reject(new Error("GAPI script failed to load."));
          document.body.appendChild(script);
        } else {
          resolve("GAPI already loaded.");
        }
      });
    };

    const loadPickerScript = () => {
      return new Promise((resolve, reject) => {
        if (!window.google || !window.google.picker) {
          const script = document.createElement("script");
          script.src = "https://apis.google.com/js/api.js?onload=onPickerApiLoad";
          script.onload = () => resolve("Picker API loaded.");
          script.onerror = () => reject(new Error("Picker API script failed to load."));
          document.body.appendChild(script);
        } else {
          resolve("Picker API already loaded.");
        }
      });
    };

    const initializeGoogleApis = async () => {
      try {
        await loadGapiScript();
        await loadPickerScript();
        console.log("Google APIs successfully initialized.");
        setGoogleApiReady(true); // Mark APIs as ready
      } catch (error) {
        console.error("Error loading Google APIs:", error.message);
      }
    };

    initializeGoogleApis();
  }, []);

  const handleGoogleDriveConnect = async () => {
    if (!isGoogleApiReady) {
      console.error("Google APIs are not ready yet.");
      setAuthStatus("Google APIs are not ready yet. Please wait and try again.");
      return;
    }

    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    provider.addScope("https://www.googleapis.com/auth/drive.file");

    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential.accessToken;

      console.log("User signed in with Firebase:", result.user.displayName);

      window.gapi.load("client", () => {
        window.gapi.client
          .init({
            apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
            discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
          })
          .then(() => {
            console.log("Google API initialized.");
            window.gapi.client.setToken({ access_token: accessToken });
            createPicker(accessToken);
          })
          .catch((error) => {
            console.error("Error using Google API:", error.message);
            setAuthStatus("Error initializing Google API.");
          });
      });
    } catch (error) {
      console.error("Error during Google Drive connect:", error.message);
      setAuthStatus(`Error during Google Drive connect: ${error.message}`);
    }
  };

  const createPicker = (accessToken) => {
    if (!window.google || !window.google.picker) {
      console.error("Google Picker API is not loaded.");
      return;
    }
  
    const view = new window.google.picker.View(window.google.picker.ViewId.DOCS);
    const picker = new window.google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(accessToken)
      .setDeveloperKey(process.env.REACT_APP_GOOGLE_API_KEY)
      .setCallback(pickerCallback)
      .build();
    picker.setVisible(true);
  };

  const pickerCallback = (data) => {
    if (data.action === window.google.picker.Action.PICKED) {
      const file = data.docs[0];
      console.log("Selected file:", file);
      setAuthStatus(`Selected file: ${file.name}`);
    }
  };

  return (
    <div>
      <button
        type="button"
        className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-500"
        onClick={handleGoogleDriveConnect}
        disabled={!isGoogleApiReady} // Disable button until APIs are ready
      >
        Connect Google Drive
      </button>
      {authStatus && <p>{authStatus}</p>}
    </div>
  );
};

export default GoogleDriveButton;
