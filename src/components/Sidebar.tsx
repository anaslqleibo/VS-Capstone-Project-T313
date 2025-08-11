import { PageProps } from "../App";
import { useEffect, useRef, useState } from "react";
import logo from '../assets/LOGO.png';
import notification from '../assets/icons/notification.png';
import { FaHome, FaCalendarAlt, FaEnvelope, FaUser, FaMapMarkerAlt, FaHamburger } from 'react-icons/fa';
import { NavLink } from "react-router-dom";
import { createModal, ModalTypes } from "./Modal";
import Button from "./Button";
import Icon from "../assets/icons/Icons";
import { useClickOutside } from "./utils/useClickOutside";
import { useRole } from "./RoleContext";
import { Role } from "../classes/User";


export default function Sidebar({modalContainer} : PageProps){
  const toggleButtonRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [open,setOpen] = useState(false);

  useClickOutside(mobileMenuRef, ()=>setIsMobileMenuOpen(false));

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const role = useRole();

    return (
      <>
        <aside className="bg-[color:var(--primary-color)] text-white md:w-[220px] md:px-[15px] md:py-[20px] md:flex md:flex-col md:items-center md:h-screen md:static w-full h-fit">
        <div className="my-auto flex items-center p-4 md:my-1 md:p-0">

          <Icon id="menu" className="block md:hidden" onClick={()=>setIsMobileMenuOpen((prev)=>!prev)}></Icon>
          
          <img src={logo} alt="2 Bent Rods logo" className="w-12 m-auto md:m-2 md:w-36"/>
        </div>

        {role === Role.Staff && <div className="w-12 h-12 hover:bg-[#1e2266] rounded-full md:flex items-center justify-center ml-auto mb-2 hidden" ref={toggleButtonRef} onClick={()=>{setOpen(true)}}>
          <img src={notification} alt="Notifications" className="w-6 object-contain" />
        </div>}
        

        {open && modalContainer.current && role===Role.Staff && createModal(ModalTypes.Notifications, true, modalContainer.current, null, setOpen)}
        
        <nav className='hidden w-full md:flex flex-col items-center [&>a]:w-full [&>a]:flex [&>a]:items-center [&>a]:p-[10px] [&>a]:text-white [&>a]:font-bold [&>a]:mb-[15px] [&>a]:rounded-[10px] [&>a]:transition-colors [&>a]:duration-200 [&>a]:hover:bg-[#1e2266] [&>a]:gap-5'>
          
          {role === Role.Admin ? 
          
          <>
            <NavLink to="/home" className="aria-[current]:bg-[color:var(--active-color)]"><FaHome /> Home</NavLink>
            <NavLink to="/calendar" className="aria-[current]:bg-[color:var(--active-color)]"><FaCalendarAlt /> Calendar</NavLink>
            <NavLink to="/shift-creation" className="aria-[current]:bg-[color:var(--active-color)]"><FaMapMarkerAlt /> Shift creation</NavLink>
            <NavLink to="/messaging" className="aria-[current]:bg-[color:var(--active-color)]"><FaEnvelope /> Messaging</NavLink>
            <NavLink to="/account"  className="aria-[current]:bg-[color:var(--active-color)]" ><FaUser /> Account</NavLink>
          </>
          
            :
          <>
            <NavLink to="/home" className="aria-[current]:bg-[color:var(--active-color)]"><FaHome /> Home</NavLink>
            <NavLink to="/unavailability" className="aria-[current]:bg-[color:var(--active-color)]"><FaCalendarAlt /> Unavailability</NavLink>
            <NavLink to="/locations" className="aria-[current]:bg-[color:var(--active-color)]"><FaMapMarkerAlt /> Locations</NavLink>
            <NavLink to="/messaging" className="aria-[current]:bg-[color:var(--active-color)]"><FaEnvelope /> Messaging</NavLink>
            <NavLink to="/account"  className="aria-[current]:bg-[color:var(--active-color)]" ><FaUser /> Account</NavLink>
          </>
        }
            
            
        </nav>
      </aside>

        {/* Mobile Menu Navigation View */}
        <div className={`fixed top-0 left-0 h-full w-fit max-w-[250px] z-50 p-2 bg-[color:var(--primary-color)] transform transition-transform duration-400 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:hidden`} ref={mobileMenuRef}>
        <Icon id="x" className="text-white float-end" width="2em" height="2em" onClick={()=>setIsMobileMenuOpen(false)}></Icon>
        <img src={logo} alt="2 Bent Rods logo" className="w-36 m-auto my-7 clear-end"/>
        {role === Role.Staff && <div className="w-12 h-12 hover:bg-[#1e2266] rounded-full md:flex items-center justify-center ml-auto mb-2 hidden" ref={toggleButtonRef} onClick={()=>{setOpen(true)}}>
          <img src={notification} alt="Notifications" className="w-6 object-contain" />
        </div>}
          <nav className='flex flex-col w-fit  p-4 gap-4 md:hidden [&>a]:flex [&>a]:items-center [&>a]:gap-4 [&>a]:text-white [&>a]:font-semibold [&>a]:hover:bg-[#1e2266] [&>a]:p-2 [&>a]:rounded-md [&>a]:aria-[current]:bg-[color:var(--active-color)] items-stretch justify-center'>
            {role === Role.Admin ? 
          
          <>
            <NavLink to="/home" className="aria-[current]:bg-[color:var(--active-color)]"><FaHome /> Home</NavLink>
            <NavLink to="/calendar" className="aria-[current]:bg-[color:var(--active-color)]"><FaCalendarAlt /> Calendar</NavLink>
            <NavLink to="/shift-creation" className="aria-[current]:bg-[color:var(--active-color)]"><FaMapMarkerAlt /> Shift creation</NavLink>
            <NavLink to="/messaging" className="aria-[current]:bg-[color:var(--active-color)]"><FaEnvelope /> Messaging</NavLink>
            <NavLink to="/account"  className="aria-[current]:bg-[color:var(--active-color)]" ><FaUser /> Account</NavLink>
          </>
          
            :
          <>
            <NavLink to="/home" className="aria-[current]:bg-[color:var(--active-color)]"><FaHome /> Home</NavLink>
            <NavLink to="/unavailability" className="aria-[current]:bg-[color:var(--active-color)]"><FaCalendarAlt /> Unavailability</NavLink>
            <NavLink to="/locations" className="aria-[current]:bg-[color:var(--active-color)]"><FaMapMarkerAlt /> Locations</NavLink>
            <NavLink to="/messaging" className="aria-[current]:bg-[color:var(--active-color)]"><FaEnvelope /> Messaging</NavLink>
            <NavLink to="/account"  className="aria-[current]:bg-[color:var(--active-color)]" ><FaUser /> Account</NavLink>
          </>
        }
          </nav>
          </div>
        
        </>
    );
}