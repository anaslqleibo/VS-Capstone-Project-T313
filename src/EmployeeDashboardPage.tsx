import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import logo from './assets/LOGO.png';
import './EmployeeDashboardPage.css';

function EmployeeDashboardPage() {
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

        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          selectable={true}
          events={[
            { title: 'Accepted shift\n12:00–16:00\nNoosa', date: '2024-04-02', color: '#2a2e87' },
            { title: 'Unaccepted shift\n12:00–16:00\nNoosa', date: '2024-04-03', color: '#f97316' },
            { title: 'Leave\n00:00–23:59', date: '2024-04-04', color: '#6b7280' },
            { title: 'Open shift\n12:00–16:00\nNoosa', date: '2024-04-06', color: '#60a5fa' }
          ]}
        />
      </div>
    </div>
  );
}

export default EmployeeDashboardPage;
