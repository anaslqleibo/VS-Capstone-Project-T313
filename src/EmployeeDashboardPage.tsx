import React from 'react';
import logo from './assets/LOGO.png';
import './EmployeeDashboardPage.css';
import { Calendar, EventProps } from './components/Calendar';
import getStatusColor, { Status } from './components/utils/getStatusColor';

function EmployeeDashboardPage() {
  const events: EventProps[] = [
            { status: 'Accepted shift', time: '12:00–16:00', employee: 'Noosa', date: '2025-07-13', color: getStatusColor(Status.Accepted) },
            { status: 'Unaccepted shift', time: '12:00–16:00', employee: 'Noosa', date: '2025-07-13', color: getStatusColor(Status.Unaccepted) },
            { status: 'Leave', time: '00:00–23:59', employee: 'Noosa', date: '2025-07-13', color: getStatusColor(Status.Leave) },
            { status: 'Open shift', time: '12:00–16:00', employee: 'Noosa', date: '2025-07-13', color: getStatusColor(Status.OpenShift) }
          ];

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <img src={logo} alt="2 Bent Rods logo" />
        <nav>
          <a href="#">🏠 Home</a>
          <a href="#">📅 Unavailability</a>
          <a href="#">💬 Messaging</a>
          <a href="#">👤 Account</a>
        </nav>
      </aside>

      <div className="dashboard-content">
        <h2>Welcome, <span>Anas</span></h2>

        <div className="calendar-controls">
          <select><option>Anas</option></select>
          <select><option>All Shifts</option></select>
          <select><option>April</option></select>
          <button className="add-leave">Add Leave</button>
        </div>


        <Calendar events = {events}></Calendar>;
        
      </div>
    </div>
  );
}

export default EmployeeDashboardPage;
