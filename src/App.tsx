import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import LoginPage from './LoginPage';
import EmployeeDashboardPage from './EmployeeDashboardPage';
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ButtonDemo from './demo/ButtonDemo'
import IconDemo from './demo/IconDemo'
import InputDemo from './demo/InputDemo'
import FormDemo from './demo/FormDemo'
import ComponentDemo from './demo/ComponentDemo'


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<EmployeeDashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;
