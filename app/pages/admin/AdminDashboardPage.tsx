"use client";
import { useEffect, useRef, useState} from 'react';
import { Status } from '@/app/components/utils/getStatusColor';
import Modal, { createModal, createModalNoOverlay, EventTypes, getModalTypesByStatus, ModalTypes, ShiftExtendedProps } from '@/app/components/Modal';
import Layout from '@/app/components/Layout';
import ListView from '@/app/components/ListView';
import { createNotifications, fetchNotifications, NotificationProps } from '@/app/controllers/Notification';
import { useAuth } from '@/app/contexts/AuthContext';
import Spinner from '@/app/components/Spinner';
import { fetchShiftExtProps } from '@/app/controllers/Shifts';
import Toast from '@/app/components/Toast';

export default function AdminDashboardPage() {
  const modalContainer = useRef<HTMLDivElement>(null);
  const user = useAuth().user;
  const [notifications, setNotifications] = useState<NotificationProps[]|null>(null);
  const [displayShift, setDisplayShift] = useState<ShiftExtendedProps|null>(null);

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
  
  useEffect(()=>{
    async function loadNotifications(){
      if (user){
        const result = await fetchNotifications(user.id.toString());
        setNotifications(result.map(notif=>({...notif, onClick: ()=>loadShift(notif?.shift_id)})));
      }
    }
    loadNotifications();
  }, [user])

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
      <Layout modalContainer={modalContainer}>
        {loading && <div className="absolute rounded-lg top-0 left-0 w-full h-full bg-[#ffffff56] z-300"> <Spinner /> </div>}

        <Toast message={message} type={toastType} shown={showToast} setShown={setToastShown}/>
        
        <div className="relative flex-[1] h-full bg-[#f4f4f4] overflow-y-auto">
          <div className='p-6 h-full md:flex md:flex-col'>
            
            <h2 className="text-2xl mb-[30px]">Welcome, <span className="text-[color:var(--primary-color)] font-semibold">{(user?user.first_name:'')+ ' ' + (user?user.last_name:'')}</span></h2>

            {
                notifications ? 
                <div className="flex flex-1 justify-center gap-4 flex-col md:flex-row items-center">
                  { notifications && <ListView title="Notifications" containerRef={modalContainer} closeButton={false}>{createNotifications(true, notifications??[])}</ListView>}

                  {/* <ListView title="Notifications" containerRef={modalContainer} closeButton={false}>{createNotifications(true)}</ListView> */}

                  {displayShift && modalContainer.current && createModalNoOverlay(getModalTypesByStatus(displayShift.status, displayShift?.type as EventTypes), modalContainer.current, displayShift, displayToast, (e:boolean)=>{!e && setDisplayShift(null)})}
                </div> 
                : <Spinner custom showWater backgroundGradient borderSpinner/>
            }
           
          </div>
        </div>

      </Layout>
      
    
  );
}
