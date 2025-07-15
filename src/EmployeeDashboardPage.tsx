import React, { useState } from 'react';
import logo from './assets/LOGO.png';
import './EmployeeDashboardPage.css';
import { Calendar, EventProps } from './components/Calendar';
import getStatusColor, { Status } from './components/utils/getStatusColor';
import formatDate from './components/utils/formatDate';
import Dropdown from './components/Dropdown';
import { ButtonDropdown } from './components/Button';

function EmployeeDashboardPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const events: EventProps[] = [
            { status: Status.Accepted, time: '12:00–16:00', employee: 'Noosa', date: formatDate(new Date(), true) },
            { status: Status.Unaccepted, time: '12:00–16:00', employee: 'Noosa', date: formatDate(new Date(), true) },
            { status: Status.Leave, time: '00:00–23:59', employee: 'Noosa', date: formatDate(new Date(), true) },
            { status: Status.OpenShift, time: '12:00–16:00', employee: 'Noosa', date: formatDate(new Date(), true) },
            { status: Status.DeclinedShift, time: '12:00–16:00', employee: 'Noosa', date: formatDate(new Date(), true) },
            { status: Status.Request, time: '12:00–16:00', employee: 'Noosa', date: formatDate(new Date(), true) },
            { status: Status.Unassigned, time: '12:00–16:00', employee: '', date: formatDate(new Date(), true) }
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
          {/* <select><option>All Shifts</option></select> */}
          <ButtonDropdown items={['All', ...Object.values(Status)]} actAsFilter setFilter={setActiveFilter}>All Shifts</ButtonDropdown>
          <select><option>April</option></select>
          <button className="add-leave">Add Leave</button>
        </div>


        <Calendar events = {events} showStatus={activeFilter}></Calendar>;
        
      </div>
    </div>
  );
}

export default EmployeeDashboardPage;
