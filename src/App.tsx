import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UnavailabilityPage from './pages/UnavailabilityPage';
import MessagingPage from './pages/MessagingPage';
import AccountPage from './pages/AccountPage';
import LocationsPage from './pages/LocationsPage';
import EmployeeDashboardPage from './pages/DashboardPage';
import './App.css'
import { ReactNode, RefObject, useRef } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Demo from './demo/Demo';

export interface PageProps{
  modalContainer: RefObject<HTMLDivElement|null>;
  children?: ReactNode;
}



export function injectModalOverlay(modalContainer: RefObject<HTMLDivElement|null>){
  return <div className="absolute z-10 inset-0 pointer-events-none" ref={modalContainer}></div>;
}

function App() {
  const modalContainer = useRef<HTMLDivElement>(null);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<EmployeeDashboardPage modalContainer={modalContainer}/>} />
        <Route path="/unavailability" element={
          <UnavailabilityPage modalContainer={modalContainer}/>} 
        />
        
        <Route path="/locations" element={<LocationsPage modalContainer={modalContainer}/>} />
        <Route path="/messaging" element={<MessagingPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/demo" element={<Demo/>}/>
      </Routes>
    </Router>
    </LocalizationProvider>

    
  );
}

export default App;
