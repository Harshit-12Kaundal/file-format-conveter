import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';

function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    // Avoid rendering <Navigate> before Firebase has actually resolved
    // whether someone is logged in - that's what caused false
    // redirects to /login even for genuinely authenticated users.
    return null; // or a small spinner if you prefer
  }

  return user ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;