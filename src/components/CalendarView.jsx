import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import './CalendarView.css'; // Optional styling file

const CalendarView = () => {
  const [user, setUser] = useState("Naomi");
  const [shiftType, setShiftType] = useState("All Shifts");
  const [month, setMonth] = useState("May");

  const events = [
    { title: 'Accepted shift\n12:00–16:00\nNoosa', date: '2025-05-02', color: '#3B5BDB' },
    { title: 'Unaccepted shift\n12:00–16:00\nNoosa', date: '2025-05-01', color: '#FFA41B' },
    { title: 'Leave\n00:00–23:59', date: '2025-05-04', color: '#6C757D' },
    { title: 'Open shift\n12:00–16:00\nNoosa', date: '2025-05-06', color: '#7BB1FF' },
    { title: 'Accepted shift\n12:00–16:00\nNoosa', date: '2025-05-09', color: '#3B5BDB' },
    { title: 'Leave\n00:00–23:59', date: '2025-05-20', color: '#6C757D' },
  ];

  return (
    <div className="calendar-wrapper">
      <div className="calendar-controls">
        <select value={user} onChange={(e) => setUser(e.target.value)}>
          <option>Naomi</option>
          <option>Admin</option>
        </select>
        <select value={shiftType} onChange={(e) => setShiftType(e.target.value)}>
          <option>All Shifts</option>
          <option>Accepted</option>
          <option>Leave</option>
          <option>Unaccepted</option>
        </select>
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          <option>May</option>
          <option>June</option>
          <option>July</option>
        </select>
      </div>

      <div className="calendar-frame">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height="auto"
          events={events}
        />
      </div>
    </div>
  );
};

export default CalendarView;
