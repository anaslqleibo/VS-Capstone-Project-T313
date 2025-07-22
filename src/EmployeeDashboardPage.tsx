import React, { useRef, useState } from 'react';
import logo from './assets/LOGO.png';
import notification from './assets/icons/notification.png';
import notification_empty from './assets/icons/no-notification.png';
import home from './assets/icons/home.png';
import unavailability from './assets/icons/unavailability.png';
import messaging from './assets/icons/messaging.png';
import account from './assets/icons/account.png';
import './EmployeeDashboardPage.css';
import { Calendar, EventProps } from './components/Calendar';
import getStatusColor, { Status } from './components/utils/getStatusColor';
import formatDate from './components/utils/formatDate';
import Dropdown from './components/Dropdown';
import { ButtonDropdown } from './components/Button';
import { createModal, ModalDetailsProps, ModalTypes } from './components/Modal';
import Icon from './assets/icons/Icons';
import ListView, { ListViewHandle } from './components/ListView';
import { createNotifications, NotificationProps } from './components/utils/notification';
import { createRoot } from 'react-dom/client';

function EmployeeDashboardPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const modalContainer = useRef<HTMLDivElement>(null);
  
  const rootRef = useRef<ReturnType<typeof createRoot> | null>(null);
  
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
  
 
  // Initial notifications read from db
  const notifications : NotificationProps[] = [{type:Status.Request},{type:Status.Accepted, date:"17-02-2025", onClick: ()=>alert("Redirecting...")},{type:Status.Unassigned, date:"01-02-2025", daysLeft: 5, onClick: ()=>alert("Redirecting...")},{type:Status.DeclinedShift, date:"15-02-2025"}]

  const listViewRef = useRef<ListViewHandle>(null);
  const toggleButtonRef = useRef<HTMLDivElement>(null);

  const toggleListView = () => {
    listViewRef.current?.toggleShown(true); 
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="bg-[color:var(--primary-color)] text-white w-[220px] px-[15px] py-[20px] flex flex-col items-center">
        <img src={logo} alt="2 Bent Rods logo" className="w-36 mb-2"/>
        
        <div className="w-12 h-12 hover:bg-[#1e2266] rounded-full flex items-center justify-center ml-auto mb-2" ref={toggleButtonRef} onClick={()=>{
                if (modalContainer.current) {
                    if (!rootRef.current){
                      rootRef.current = createRoot(modalContainer.current);
                    
                      
                    }
                    
                    rootRef.current.render(<ListView title="Notifications" container={modalContainer.current} ref={listViewRef} toggleButtonRef={toggleButtonRef}>{createNotifications(notifications)}</ListView>);
                    toggleListView();
                }
            }}>
          <img src={notification} alt="Notifications" className="w-6 object-contain" />
        </div>
        
        <nav className='w-full flex flex-col items-center [&>a]:w-full [&>a]:flex [&>a]:items-center [&>a]:p-[10px] [&>a]:text-white [&>a]:font-bold [&>a]:mb-[15px] [&>a]:rounded-[10px] [&>a]:transition-colors [&>a]:duration-200 [&>a]:hover:bg-[#1e2266] [&>a]:gap-5'>
          
          <a href="/dashboard"><img src={home} className='w-4'></img>Home</a>
          <a href="/unavailability"><img src={unavailability} className='w-4'></img>Unavailability</a>
          <a href="/messaging"><img src={messaging} className='w-4'></img>Messaging</a>
          <a href="/account"><img src={account} className='w-4'></img>Account</a>
        </nav>
      </aside>

      

      <div className="relative flex-[1] bg-[#f4f4f4] overflow-hidden">
        <div className="absolute z-10 inset-0 pointer-events-none" ref={modalContainer}></div>

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
    </div>
  );
}

export default EmployeeDashboardPage;
