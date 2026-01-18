import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
// import AdminApproval from "./pages/AdminApproval";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminDashboard from "./components/admin/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        
        {/* User Dashboard - Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes - Protected with admin check */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <Navigate to="/admin/dashboard" replace />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/documents"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard initialTab="documents" />
            </ProtectedRoute>
          }
        />

        {/* Old admin routes - redirect to new dashboard */}
        <Route
          path="/admin/approval"
          element={
            <ProtectedRoute requireAdmin={true}>
              <Navigate to="/admin/documents" replace />
            </ProtectedRoute>
          }
        />

        {/* Catch-all route for unknown paths */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;