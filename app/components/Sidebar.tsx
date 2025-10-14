"use client";

import { PageProps } from "@/app//layout";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import logo from '@/public/LOGO.png';
import notification from '@/public/icons/notification.png';
import notification_none from '@/public/icons/notification_none.png';
import { FaHome, FaCalendarAlt, FaEnvelope, FaUser, FaMapMarkerAlt, FaPen, FaSignOutAlt, FaUsers } from 'react-icons/fa';
import { createModal, EventTypes, getModalTypesByStatus, LeaveExtendedProps, ModalTypes, ShiftExtendedProps } from "./Modal";
import Icon from "@/public/icons/Icons";
import { useClickOutside } from "./utils/useClickOutside";
import { Role } from "@/app/controllers/User";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import Button from "./Button";
import useIsOverMd from "./utils/useIsOverMd";
import { FaThLarge } from "react-icons/fa";
import { fetchNotifications, NotificationProps } from "../controllers/Notification";
import { fetchShiftExtProps, ShiftStatus } from "../controllers/Shifts";
import { stringToStatus } from "./utils/getStatusColor";
import Toast from "./Toast";
import Spinner from "./Spinner";


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

  const auth = useAuth();
  const user = auth.user;
  const role = user?.role;
  const router = useRouter();

  const pathName = usePathname();
  const isMobile = useIsOverMd();

  const logout = <div onClick={() => auth.logout()} className="absolute right-2 bottom-2 hover:bg-[color:var(--danger-color-hover)] hover:font-bold bg-[color:var(--danger-color-hover)] text-white md:bg-transparent flex items-center text-right gap-2 py-2 px-4 rounded-lg transition-colors duration-300 text-sm">
      <FaSignOutAlt className="rotate-180"/>
      Logout
    </div>;

  const adminNavs = <>
    <button onClick={() => router.replace("/home")} className={`${pathName === '/home' ? "bg-[color:var(--active-color)]" : ""}`}><FaHome /> Home</button>
    <button onClick={() => router.replace("/calendar")}  className={`${pathName === '/calendar' ? "bg-[color:var(--active-color)]" : ""}`}><FaCalendarAlt /> Calendar</button>
    <button onClick={() => router.replace("/shift-creation")}  className={`${pathName === '/shift-creation' ? "bg-[color:var(--active-color)]" : ""}`}><FaPen /> Shift creation</button>
    <button onClick={() => router.replace("/locations")}  className={`${pathName === '/locations' ? "bg-[color:var(--active-color)]" : ""}`}><FaMapMarkerAlt /> Locations</button>
    {/* <button onClick={() => router.replace("/messaging")}  className={`${pathName === '/messaging' ? "bg-[color:var(--active-color)]" : ""}`}><FaEnvelope /> Messaging</button> */}
    <button onClick={() => router.replace("/user-management")} className={`${pathName === '/user-management' ? "bg-[color:var(--active-color)]" : ""}`}><FaUsers /> Users</button>
    <button onClick={() => router.replace("/account")} className={`${pathName === '/account' ? "bg-[color:var(--active-color)]" : ""}`}><FaUser /> Account</button>
    <button onClick={() => router.replace("/portal")} className={`${pathName === '/portal' ? "bg-[color:var(--active-color)]" : ""}`}><FaThLarge /> Portal</button>
    </>;
  
  const staffNavs = <>
    <button onClick={() => router.replace("/home")} className={`${pathName === '/home' ? "bg-[color:var(--active-color)]" : ""}`}><FaHome /> Home</button>
    <button onClick={() => router.replace("/locations")} className={`${pathName === '/locations' ? "bg-[color:var(--active-color)]" : ""}`}><FaMapMarkerAlt /> Locations</button>
    {/* <button onClick={() => router.replace("/messaging")} className={`${pathName === '/messaging' ? "bg-[color:var(--active-color)]" : ""}`}><FaEnvelope /> Messaging</button> */}
    <button onClick={() => router.replace("/account")}className={`${pathName === '/account' ? "bg-[color:var(--active-color)]" : ""}`}><FaUser /> Account</button>
    </>
    
    const [loadNotification, setLoadNotification] = useState(false);
    const [notifications, setNotifications] = useState<NotificationProps[]|null>(null);
    const [displayShift, setDisplayShift] = useState<ShiftExtendedProps|LeaveExtendedProps|null>(null);
        
    async function loadShift(id?: string){
      if (id === undefined) return;
      if (displayShift && displayShift.id?.toString() === id.toString()) return;
      
      try{
        setLoading(true);
        const shift = await fetchShiftExtProps(id);
        setDisplayShift(shift);
      }
      finally{
        setLoading(false);
      }
      
    }
    
    async function loadNotifications(){
      if (user){
        const result = await fetchNotifications(user.id.toString());
        setNotifications(result.map(notif=>({...notif, onClick: ()=>loadShift(notif?.shift_id)})));
      }
    }
    
    useEffect(()=>{
       if (role === 'user'){  
        (async () => {
          try{
            await loadNotifications();
          }
          finally{
            setLoadNotification(false);
          }
        })();
      }
    }, [role])

    useEffect(()=>{
      if (role === 'user' && loadNotification){  
        (async () => {
          try{
            await loadNotifications();
          }
          finally{
            setOpen(true);
            setLoadNotification(false);
          }
        })();
      }
    }, [role, loadNotification])

    const openNotificationView = () => {
      setDisplayShift(null);
      setLoadNotification(true);
    }

    const [showToast, setToastShown] = useState(false);
    const [message, setMessage] = useState("");
    const [toastType, setToastType] = useState<"success"|"error">("success");

    const displayToast = (message: string, toastType: "success"|"error") => {
        setMessage(message);
        setToastType(toastType);
        setToastShown(true);
    }
    const [loading, setLoading] = useState(false);
    return (
      <>
        {loading && <div className="absolute rounded-lg top-0 left-0 w-full h-full bg-[#ffffff56] z-300"> <Spinner /> </div>}

        <Toast message={message} type={toastType} shown={showToast} setShown={setToastShown}/>
      
        <aside className="relative bg-[color:var(--primary-color)] text-white md:w-[220px] md:px-[15px] md:py-[20px] md:flex md:flex-col md:items-center md:h-full w-full h-fit">
        <div className="my-auto flex items-center p-4 md:my-1 md:p-0">

          <Icon id="menu" className="block md:hidden" onClick={()=>setIsMobileMenuOpen((prev)=>!prev)}></Icon>
          
          <Image src={logo} alt="2 Bent Rods logo" className="w-10 m-auto md:m-2 md:w-24" />
        </div>

        {role === "user" && <div className="p-2 hover:bg-[#1e2266] rounded-full md:flex items-center justify-center ml-auto mb-2 hidden" ref={toggleButtonRef} onClick={openNotificationView}>
          <Image id="notification-button-icon" src={(notifications && notifications?.length>0) ? notification : notification_none} alt="Notifications" className="w-6 object-contain" />
        </div>}
        

        {open && modalContainer.current && role==="user" && notifications && 
        createModal(displayShift ? getModalTypesByStatus(stringToStatus(displayShift.status), displayShift.type as EventTypes) : ModalTypes.Notifications, true, modalContainer.current, displayShift ? displayShift : notifications, setOpen, undefined, undefined, displayToast, (e:boolean)=>{!e && setNotifications([])})}
        
        <nav className='relative hidden w-full md:flex flex-col mb-2 overflow-y-auto items-center h-full [&>button]:w-full [&>button]:flex [&>button]:items-center [&>button]:p-[10px] [&>button]:text-white [&>button]:font-bold [&>button]:mb-[15px] [&>button]:rounded-[10px] [&>button]:transition-colors [&>button]:duration-200 [&>button]:hover:bg-[#1e2266] [&>button]:gap-5'>
          
          {role === "admin" ? adminNavs : staffNavs}
            
        </nav>

        {isMobile&&logout}
      </aside>

        {/* Mobile Menu Navigation View */}
        <div className={`fixed top-0 left-0 h-full w-fit max-w-[250px] z-50 p-2 bg-[color:var(--primary-color)] transform transition-transform duration-400 ease-in-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:hidden`} ref={mobileMenuRef}>
        <Icon id="x" className="text-white float-end" width="2em" height="2em" onClick={()=>setIsMobileMenuOpen(false)}></Icon>
        <Image src={logo} alt="2 Bent Rods logo" className="w-36 m-auto my-7 clear-end"/>

          {role === "user" && <div className="w-12 h-12 hover:bg-[#1e2266] rounded-full items-center justify-center ml-auto mb-2" ref={toggleButtonRef} onClick={()=>{setIsMobileMenuOpen(false); openNotificationView()}}>
            <Image id="notification-button-icon" src={(notifications && notifications?.length>0) ? notification : notification_none} alt="Notifications" className="w-6 object-contain" />
          </div>}

          <nav className='flex flex-col w-fit p-4 gap-4 md:hidden [&>button]:flex [&>button]:items-center [&>button]:gap-4 [&>button]:text-white [&>button]:font-semibold [&>button]:hover:bg-[#1e2266] [&>button]:p-2 [&>button]:rounded-md [&>button]:aria-[current]:bg-[color:var(--active-color)] items-stretch justify-center'>
            {role === "admin" ? adminNavs : staffNavs}
          </nav>

          {logout}
        </div>
        
        </>
    );
}