import React from 'react';
import Sidebar from '../components/Sidebar';
import CalendarView from '../components/CalendarView'; // Fixed import
import './DashboardPage.css'; // Optional: for layout

const DashboardPage = () => {
  return (
    <div className="dashboard-container" style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ marginLeft: '220px', padding: '30px', width: '100%' }}>
        <h1>Welcome, Naomi</h1>
        <CalendarView />
      </main>
    </div>
  );
};

export default DashboardPage;
