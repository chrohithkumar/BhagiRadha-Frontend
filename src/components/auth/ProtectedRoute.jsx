import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedTypes = [] }) {
  const token = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");
  


  // Not logged in
  if (!token) return <Navigate to="/login" replace />;

  // Logged in but not allowed type (case-insensitive)
  if (
    allowedTypes.length > 0 &&
    !allowedTypes.some(type => type.toLowerCase() === (userType || "").toLowerCase())
  ) {
    return <Navigate to="/login" replace />;
  }

  // All good
  return children;
}
