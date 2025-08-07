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
import LoginPage from './LoginPage';
import PrivateRoute from './components/PrivateRoute';

export interface PageProps{
  modalContainer: RefObject<HTMLDivElement|null>;
  children?: ReactNode;
}



export function injectModalOverlay(modalContainer: RefObject<HTMLDivElement|null>){
  return <div className="absolute z-100 inset-0 m-auto pointer-events-none w-full" ref={modalContainer}></div>;
}

function App() {
  const modalContainer = useRef<HTMLDivElement>(null);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Router>
      <Routes>
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/" element={<Navigate to="/home" replace />} />
      
        {/* Protected Routes */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <EmployeeDashboardPage modalContainer={modalContainer} />
            </PrivateRoute>
          }
        />
        <Route
          path="/unavailability"
          element={
            <PrivateRoute>
              <UnavailabilityPage modalContainer={modalContainer} />
            </PrivateRoute>
          }
        />
        <Route
          path="/locations"
          element={
            <PrivateRoute>
              <LocationsPage modalContainer={modalContainer}/>
            </PrivateRoute>
          }
        />
        <Route
          path="/messaging"
          element={
            <PrivateRoute>
              <MessagingPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/account"
          element={
            <PrivateRoute>
              <AccountPage modalContainer={modalContainer}/>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
    </LocalizationProvider>

    
  );
}

export default App;
