import React from 'react';
import Layout from '../components/Layout';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './UnavailabilityPage.css'; // Optional styling

const UnavailabilityPage = () => {
  const unavailableEvents = [
    { title: 'Unavailable', start: '2025-05-04T00:00:00', end: '2025-05-04T23:59:00', color: '#6C757D' },
    { title: 'Unavailable', start: '2025-05-06T11:00:00', end: '2025-05-06T18:00:00', color: '#6C757D' },
    { title: 'Unavailable', start: '2025-05-07T09:00:00', end: '2025-05-07T14:00:00', color: '#6C757D' },
  ];

  return (
    <Layout>
      <div className="unavailability-header">
        <h1 className="text-3xl font-bold text-blue-900">Unavailability</h1>
        <button className="add-button">Add Unavailability</button>
      </div>

      <div className="calendar-container">
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          allDaySlot={false}
          height="auto"
          slotDuration="01:00:00"
          events={unavailableEvents}
        />
      </div>
    </Layout>
  );
};

export default UnavailabilityPage;
