import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import LoginPage from './LoginPage';
import EmployeeDashboardPage from './EmployeeDashboardPage';

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
