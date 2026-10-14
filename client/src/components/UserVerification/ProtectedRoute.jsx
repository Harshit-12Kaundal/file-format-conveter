import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const otpVerified = localStorage.getItem("otpVerified") === "true";

  if (!user) return <Navigate to="/login" />;
  if (!otpVerified) return <Navigate to="/verify-otp" />;

  return children;
};

export default ProtectedRoute;
