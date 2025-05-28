import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import UnavailabilityPage from './pages/UnavailabilityPage';
import MessagingPage from './pages/MessagingPage';
import AccountPage from './pages/AccountPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<DashboardPage />} />
        <Route path="/unavailability" element={<UnavailabilityPage />} />
        <Route path="/messaging" element={<MessagingPage />} />
        <Route path="/account" element={<AccountPage />} />
      </Routes>
    </Router>
  );
}

export default App;
