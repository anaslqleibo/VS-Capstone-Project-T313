import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import UnavailabilityPage from './pages/UnavailabilityPage';
import MessagingPage from './pages/MessagingPage';
import AccountPage from './pages/AccountPage';
import LocationsPage from './pages/LocationsPage';

import EmployeeDashboardPage from './EmployeeDashboardPage';
import './App.css'
import Demo from './demo/Demo';
import Sidebar from './components/Sidebar';
import { ReactNode, RefObject, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import Layout from './components/Layout';

export interface PageProps{
  modalContainer: RefObject<HTMLDivElement|null>;
  rootRef: RefObject<ReturnType<typeof createRoot> | null>;
  children?: ReactNode;
}



export function injectModalOverlay(modalContainer: RefObject<HTMLDivElement|null>){
  return <div className="absolute z-10 inset-0 pointer-events-none" ref={modalContainer}></div>;
}

function App() {
  const modalContainer = useRef<HTMLDivElement>(null);
  const rootRef = useRef<ReturnType<typeof createRoot> | null>(null);
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<EmployeeDashboardPage modalContainer={modalContainer} rootRef={rootRef}/>} />
        <Route path="/unavailability" element={
          <UnavailabilityPage modalContainer={modalContainer} rootRef={rootRef}/>} 
        />
        
        <Route path="/locations" element={<LocationsPage />} />
        <Route path="/messaging" element={<MessagingPage />} />
        <Route path="/account" element={<AccountPage />} />
      </Routes>
    </Router>
  );
}

export default App;
