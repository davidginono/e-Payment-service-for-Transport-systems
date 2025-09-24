import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import StopsPage from './pages/StopsPage';
import PaymentPage from './pages/PaymentPage';
import SuccessPage from './pages/SuccessPage';
import RegisterPage from './pages/RegisterPage';
import ManualEntryPage from './pages/ManualEntryPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/stops" element={<StopsPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/success" element={<SuccessPage />} />
         <Route path="/register" element={<RegisterPage />} />
        <Route path="/manual-entry" element={<ManualEntryPage />} />
      </Routes>
    </Router>
  );
}

export default App; 