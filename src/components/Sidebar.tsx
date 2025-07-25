import { createRoot } from "react-dom/client";
import { PageProps } from "../App";
import { useRef } from "react";
import ListView, { ListViewHandle } from "./ListView";
import logo from '../assets/LOGO.png';
import notification from '../assets/icons/notification.png';
import notification_empty from '../assets/icons/no-notification.png';
import home from '../assets/icons/home.png';
import unavailability from '../assets/icons/unavailability.png';
import messaging from '../assets/icons/messaging.png';
import account from '../assets/icons/account.png';
import { FaHome, FaCalendarAlt, FaEnvelope, FaUser, FaMapMarkerAlt } from 'react-icons/fa';

import { createNotifications, NotificationProps } from "./utils/notification";
import { Status } from "./utils/getStatusColor";
import { NavLink } from "react-router-dom";

export default function Sidebar({modalContainer, rootRef} : PageProps){
  // Initial notifications read from db
  const notifications : NotificationProps[] = [{type:Status.Request},{type:Status.Accepted, date:"17-02-2025", onClick: ()=>alert("Redirecting...")},{type:Status.Unassigned, date:"01-02-2025", daysLeft: 5, onClick: ()=>alert("Redirecting...")},{type:Status.DeclinedShift, date:"15-02-2025"}]

  const listViewRef = useRef<ListViewHandle>(null);
  const toggleButtonRef = useRef<HTMLDivElement>(null);

  const toggleListView = () => {
    listViewRef.current?.toggleShown(true); 
  };
    return (
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
          
            <NavLink to="/home"><FaHome /> Home</NavLink>
            <NavLink to="/unavailability"><FaCalendarAlt /> Unavailability</NavLink>
            <NavLink to="/locations" ><FaMapMarkerAlt /> Locations</NavLink>
            <NavLink to="/messaging" ><FaEnvelope /> Messaging</NavLink>
            <NavLink to="/account"  ><FaUser /> Account</NavLink>
        </nav>
      </aside>
    );
}