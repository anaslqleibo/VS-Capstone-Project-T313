import { PageProps } from "../App";
import { useRef, useState } from "react";
import logo from '../assets/LOGO.png';
import notification from '../assets/icons/notification.png';
import { FaHome, FaCalendarAlt, FaEnvelope, FaUser, FaMapMarkerAlt } from 'react-icons/fa';
import { NavLink } from "react-router-dom";
import { createModal, ModalTypes } from "./Modal";

export default function Sidebar({modalContainer} : PageProps){
  const toggleButtonRef = useRef<HTMLDivElement>(null);


  const [open,setOpen] = useState(false);

    return (
        <aside className="bg-[color:var(--primary-color)] text-white w-[220px] px-[15px] py-[20px] flex flex-col items-center">
        <img src={logo} alt="2 Bent Rods logo" className="w-36 mb-2"/>
        
        <div className="w-12 h-12 hover:bg-[#1e2266] rounded-full flex items-center justify-center ml-auto mb-2" ref={toggleButtonRef} onClick={()=>{setOpen(true)}}>


          <img src={notification} alt="Notifications" className="w-6 object-contain" />
        </div>

        {open && modalContainer.current && createModal(ModalTypes.Notifications, true, modalContainer.current, null, setOpen)}
        
        <nav className='w-full flex flex-col items-center [&>a]:w-full [&>a]:flex [&>a]:items-center [&>a]:p-[10px] [&>a]:text-white [&>a]:font-bold [&>a]:mb-[15px] [&>a]:rounded-[10px] [&>a]:transition-colors [&>a]:duration-200 [&>a]:hover:bg-[#1e2266] [&>a]:gap-5'>
          
            <NavLink to="/home" className="aria-[current]:bg-[color:var(--active-color)]"><FaHome /> Home</NavLink>
            <NavLink to="/unavailability" className="aria-[current]:bg-[color:var(--active-color)]"><FaCalendarAlt /> Unavailability</NavLink>
            <NavLink to="/locations" className="aria-[current]:bg-[color:var(--active-color)]"><FaMapMarkerAlt /> Locations</NavLink>
            <NavLink to="/messaging" className="aria-[current]:bg-[color:var(--active-color)]"><FaEnvelope /> Messaging</NavLink>
            <NavLink to="/account"  className="aria-[current]:bg-[color:var(--active-color)]" ><FaUser /> Account</NavLink>
        </nav>
      </aside>
    );
}