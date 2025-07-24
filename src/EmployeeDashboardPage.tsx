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


export default function EmployeeDashboardPage({modalContainer, rootRef}: PageProps) {

  const [activeFilter, setActiveFilter] = useState("All");
  
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
  
 


  return (
      <div className="relative flex-[1] bg-[#f4f4f4] overflow-hidden">
        {injectModalOverlay(modalContainer)}

        <div className='p-[40px] overflow-y-auto h-full'>

        <h2 className="text-2xl mb-[30px]">Welcome, <span className="text-[color:var(--primary-color)] font-semibold">Anas</span></h2>

        <div className="flex gap-3 -mb-6.5">
          {/* <select><option>Anas</option></select> */}
          {/* <select><option>All Shifts</option></select> */}
        
          <Dropdown items={['All', ...Object.values(Status)]} showCheckbox={true} placeholder="Select employee" actAsFilter setFilter={setActiveFilter} maxVisibleItems={6} className='rounded-b-none'/>

          <Dropdown items={['All', ...Object.values(Status)]} showCheckbox={true} placeholder="Select shift" actAsFilter setFilter={setActiveFilter} maxVisibleItems={6} className='rounded-b-none' initialSelectedItem='All'/>

          <Dropdown items={['All', ...Object.values(Status)]} showCheckbox={true} placeholder="Select month" actAsFilter setFilter={setActiveFilter} maxVisibleItems={6} className='rounded-b-none'/>

          {/* <select><option>April</option></select> */}
          <button className="add-leave ml-auto">Add Leave</button>
        </div>
        
        <Calendar events = {events} showStatus={activeFilter} modalContainer={modalContainer} rootRef={rootRef}></Calendar>
        
        </div>
      </div>
    
  );
}
