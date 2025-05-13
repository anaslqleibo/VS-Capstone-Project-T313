import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

function EmployeeDashboardPage() {
  return (
    <div className="dashboard-container">
      <h2>Employee Dashboard</h2>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        selectable={true}
        events={[
          { title: 'Fishing Class - Gold Coast', date: '2024-05-15' },
          { title: 'Fishing Class - Sunshine Coast', date: '2024-05-20' }
        ]}
      />
    </div>
  );
}

export default EmployeeDashboardPage;
