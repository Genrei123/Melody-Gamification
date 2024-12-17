// src/App.js
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import HomePage from './HomePage';
import GameController from './GameController';
import ProtectedRoute from './ProtectedRoute';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { GameProvider } from './GameContext';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <GameProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/game/:gameId"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <GameController />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/" /> : <Login />
            }
          />
          <Route
            path="/signup"
            element={
              isAuthenticated ? <Navigate to="/" /> : <Signup />
            }
          />
          {/* Redirect any unknown routes to home or login */}
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
          />
        </Routes>
      </Router>
    </GameProvider>
  );
};

export default App;
