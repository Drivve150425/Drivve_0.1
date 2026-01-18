import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const admin = localStorage.getItem("admin");
  return admin ? children : <Navigate to="/" />;
}
