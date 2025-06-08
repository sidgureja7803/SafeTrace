import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import { gsap } from 'gsap';

// Pages
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import BreachChecker from './components/BreachChecker';
import FakeData from './components/FakeData';
import Vault from './components/Vault';
import RiskChecker from './components/RiskChecker';
import News from './components/News';
import LoginPage from './components/LoginPage';
import NotFound from './components/NotFound';

// Styles
import './styles/App.css';

// Authentication guard for protected routes
const ProtectedRoute = ({ children }) => {
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
    return <div className="loading-container">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  useEffect(() => {
    // Initialize GSAP animations
    gsap.config({
      nullTargetWarn: false,
    });

    // Page transition animation
    gsap.fromTo(
      '.page-transition',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    );
  }, []);

  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/breach-checker" element={
            <ProtectedRoute>
              <BreachChecker />
            </ProtectedRoute>
          } />
          <Route path="/fake-data" element={
            <ProtectedRoute>
              <FakeData />
            </ProtectedRoute>
          } />
          <Route path="/vault" element={
            <ProtectedRoute>
              <Vault />
            </ProtectedRoute>
          } />
          <Route path="/risk-checker" element={
            <ProtectedRoute>
              <RiskChecker />
            </ProtectedRoute>
          } />
          <Route path="/news" element={
            <ProtectedRoute>
              <News />
            </ProtectedRoute>
          } />

          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 