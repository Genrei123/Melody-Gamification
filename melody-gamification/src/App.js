// src/App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'; // Import useNavigate here
import Login from './Login';
import Signup from './Signup';
import HomePage from './HomePage';
import GameController from './GameController';
import ProtectedRoute from './ProtectedRoute';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { GameProvider } from './GameContext';
import CreateComposition from './CreateComposition';
import VerifyEmail from './VerifyEmail';
import ResendVerification from './ResendVerification';
import { ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  const switchToSignup = () => {
    navigate('/signup');
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    navigate('/');
  };

  return (
    <GameProvider>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/game/:gameId"
          element={
            <ProtectedRoute>
              <GameController />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-composition"
          element={
            <ProtectedRoute>
              <CreateComposition />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/" /> : <Login onLogin={handleLogin} switchToSignup={switchToSignup} />
          }
        />
        <Route
          path="/signup"
          element={
            isAuthenticated ? <Navigate to="/" /> : <Signup />
          }
        />
        <Route
          path="/verify-email"
          element={
            isAuthenticated ? <Navigate to="/" /> : <VerifyEmail />
          }
        />
        <Route
          path="/resend-verification"
          element={
            isAuthenticated ? <Navigate to="/" /> : <ResendVerification />
          }
        />
        {/* Redirect any unknown routes to home or login */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
        />
      </Routes>
      <ToastContainer /> {/* Add ToastContainer here */}
    </GameProvider>
  );
};

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
