import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import LoginPage from './LoginPage';
import EmployeeDashboardPage from './EmployeeDashboardPage';
import './App.css'
import Demo from './demo/Demo';
import Sidebar from './components/Sidebar';
import { RefObject, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import UnavailabilityPage from './UnavailabilityPage';

export interface PageProps{
  modalContainer: RefObject<HTMLDivElement|null>;
  rootRef: RefObject<ReturnType<typeof createRoot> | null>;
}

function PageParentContainer(props:React.PropsWithChildren){
  return (<div className="flex h-screen overflow-hidden">
    {props.children}
  </div>);
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
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={
          <PageParentContainer>
            <Sidebar modalContainer={modalContainer} rootRef={rootRef}/>
            <EmployeeDashboardPage modalContainer={modalContainer} rootRef={rootRef}/>
          </PageParentContainer>} 
        />
        <Route path="/unavailability" element={
          <PageParentContainer>
            <Sidebar modalContainer={modalContainer} rootRef={rootRef}/>
            <UnavailabilityPage modalContainer={modalContainer} rootRef={rootRef}/>
          </PageParentContainer>} 
        />
        <Route path="/demo" element={<Demo />} />
      </Routes>
    </Router>
  );
}

export default App;
