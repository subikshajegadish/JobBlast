import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';

// Simple auth check that won't throw errors
const checkAuth = () => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) return false;
    // Don't decode here to avoid errors - just check if token exists
    return true;
  } catch {
    return false;
  }
};

// Protected Route component
const ProtectedRoute = ({ children }) => {
  if (!checkAuth()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Public Route component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  if (checkAuth()) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
