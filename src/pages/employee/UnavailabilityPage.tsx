import React, { useState } from 'react';
import Layout from '../../components/Layout';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { injectModalOverlay, PageProps } from '../../App';
import { createModal, ModalTypes } from '../../components/Modal';
import Button from '../../components/Button';

const UnavailabilityPage = ({modalContainer}: PageProps) => {
  const unavailableEvents = [
    { title: 'Unavailable', start: '2025-05-04T00:00:00', end: '2025-05-04T23:59:00', color: '#6C757D' },
    { title: 'Unavailable', start: '2025-05-06T11:00:00', end: '2025-05-06T18:00:00', color: '#6C757D' },
    { title: 'Unavailable', start: '2025-05-07T09:00:00', end: '2025-05-07T14:00:00', color: '#6C757D' },
  ];

  const [openModal, setOpenModal] = useState(false);

  return (
    <Layout modalContainer={modalContainer}>
      <div className="flex flex-wrap gap-3 justify-between items-center mb-[20px]">
        <h1 className="text-3xl font-bold text-blue-900">Unavailability</h1>
        
        <Button onClick={()=>setOpenModal(true)}>Add Unavailability</Button>
      </div>

      <div className="bg-white p-[20px] rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          allDaySlot={false}
          height="auto"
          slotDuration="01:00:00"
          events={unavailableEvents}
        />
      </div>

  

      {openModal && modalContainer.current && createModal(ModalTypes.AddUnavailability, true, modalContainer.current, null, setOpenModal)};
          
    </Layout>
              
  );
};

export default UnavailabilityPage;
