// src/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import { toast } from 'react-toastify';

const ProtectedRoute = ({ children }) => {
  const [user, loading, error] = useAuthState(auth);

  if (loading) {
    return <div>Loading...</div>; // Or a spinner
  }

  if (error) {
    console.error("Authentication Error:", error);
    toast.error("Authentication error. Please try again.");
    return <Navigate to="/login" />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!user.emailVerified) {
    toast.warn("Please verify your email to access this page.");
    return <Navigate to="/verify-email" />;
  }

  return children;
};

export default ProtectedRoute;
