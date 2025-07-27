import { useState } from 'react';

import { Calendar, EventProps } from './components/Calendar';
import getStatusColor, { Status } from './components/utils/getStatusColor';
import formatDate from './components/utils/formatDate';
import Dropdown from './components/Dropdown';
import { createModal, ModalDetailsProps, ModalTypes } from './components/Modal';
import Icon from './assets/icons/Icons';
import ListView, { ListViewHandle } from './components/ListView';
import { createNotifications, NotificationProps } from './components/utils/notification';
import { createRoot } from 'react-dom/client';
import { injectModalOverlay, PageProps } from './App';
import Layout from './components/Layout';
import { useLocation } from 'react-router-dom';
import Button from './components/Button';
import { MonthCalendar } from '@mui/x-date-pickers';
import dayjs from 'dayjs';


export default function EmployeeDashboardPage({modalContainer}: PageProps) {

  const [activeFilter, setActiveFilter] = useState(["All"]);
  
  const leaveDetails = {
      Date: "11-04-2024",
      Time: "12:00-16:30"
  };


  const openShiftDetails : ModalDetailsProps = {
      Date: "11-04-2024",
      Time: "12:00-16:30",
      Location: "Noosa",
      Address: "111 Test Drive, Noosa, 4110",
      Notes: "School excursion. 50+ students. Arrive early."
  };

  const declinedShiftDetails : ModalDetailsProps = {
      Date: "11-04-2024",
      Time: "12:00-16:30",
      Location: "Noosa",
      Address: "111 Test Drive, Noosa, 4110",
      Notes: "Please take a break, you have done a lot of shifts this week..."
  };

  const events: EventProps[] = [
            { status: Status.Accepted, time: '12:00–16:00', location: 'Noosa', date: formatDate(new Date(), true), details: openShiftDetails},
            { status: Status.Unaccepted, time: '12:00–16:00', location: 'Noosa', date: formatDate(new Date(), true), details: openShiftDetails },
            { status: Status.Leave, time: '00:00–23:59', date: formatDate(new Date(), true) , details: leaveDetails},
            { status: Status.OpenShift, time: '12:00–16:00', location: 'Noosa', date: formatDate(new Date(), true), details: openShiftDetails},
            { status: Status.DeclinedShift, time: '12:00–16:00', location: 'Noosa', date: formatDate(new Date(), true), details: declinedShiftDetails },
            // { status: Status.Request, time: '12:00–16:00', location: 'Noosa', date: formatDate(new Date(), true) },
            // { status: Status.Unassigned, time: '12:00–16:00', location: '', date: formatDate(new Date(), true) }
          ];

  const [openModal, setOpenModal] = useState(false);
  
  return (
      <Layout modalContainer={modalContainer}>
        <div className="relative flex-[1] bg-[#f4f4f4] overflow-hidden">
          <div className='p-[40px] overflow-y-auto h-full'>

          <h2 className="text-2xl mb-[30px]">Welcome, <span className="text-[color:var(--primary-color)] font-semibold">Anas</span></h2>

          <div className='flex justify-between -mb-6 items-end'>
            <div className="flex gap-3 items-end">
            
              <Dropdown items={['BCC', 'LCC', 'MBRC']} placeholder="Select location" actAsFilter setFilter={setActiveFilter} maxVisibleItems={6} className='rounded-b-none'/>

              <Dropdown items={['All', ...Object.values(Status)]} multiple placeholder="Select shift" actAsFilter setFilter={setActiveFilter} maxVisibleItems={6} className='rounded-b-none' initialSelectedItem='All'/>

              <Dropdown placeholder="Select month" actAsFilter setFilter={setActiveFilter} maxVisibleItems={6} className='rounded-b-none' custom={true}>
                <MonthCalendar defaultValue={dayjs()}/>
              
              </Dropdown>
            </div>

            <Button onClick={() => setOpenModal(true)} className='rounded-b-none rounded-t-md text-sm h-full' fontSize='0.8em'>Add Leave</Button>
          </div>
          
          
          <Calendar events = {events} showStatus={activeFilter} modalContainer={modalContainer}></Calendar>

          {openModal && modalContainer.current && createModal(ModalTypes.AddLeave, true, modalContainer.current, null, setOpenModal)};
          
          </div>
        </div>

      </Layout>
      
    
  );
}
