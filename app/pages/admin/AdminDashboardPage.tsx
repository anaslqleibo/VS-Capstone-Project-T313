"use client";
import { useEffect, useRef, useState} from 'react';
import { Status } from '@/app/components/utils/getStatusColor';
import Modal, { ModalTypes } from '@/app/components/Modal';
import Layout from '@/app/components/Layout';
import ListView from '@/app/components/ListView';
import { createNotifications, fetchNotifications, NotificationProps } from '@/app/controllers/Notification';
import { useAuth } from '@/app/contexts/AuthContext';
import Spinner from '@/app/components/Spinner';


export default function AdminDashboardPage() {
  const modalContainer = useRef<HTMLDivElement>(null);
  const user = useAuth().user;
  const [notifications, setNotifications] = useState<NotificationProps[]|null>(null);

  useEffect(()=>{
    async function loadNotifications(){
      if (user){
        const result = await fetchNotifications(user.id.toString());
        setNotifications(result);

        console.log(result);
      }
    }
    loadNotifications();
  }, [user])

  const declinedShiftDetails = {
      status: Status.DeclinedShift,
      assignee_name: "Naomi",
      date: "11-04-2024",
      time: "12:00-16:30",
      location_name: "Noosa",
      address: "111 Test Drive, Noosa, 4110",
      notes: "Please take a break, you have done a lot of shifts this week..."
  };
  
  return (
      <Layout modalContainer={modalContainer}>
        <div className="relative flex-[1] h-full bg-[#f4f4f4]">
          <div className='p-6 h-full md:flex md:flex-col'>
            
            <h2 className="text-2xl mb-[30px]">Welcome, <span className="text-[color:var(--primary-color)] font-semibold">{(user?user.first_name:'')+ ' ' + (user?user.last_name:'')}</span></h2>

            {
                notifications ? 
                 <div className="flex flex-1 justify-center gap-4 flex-col md:flex-row items-center">
                { notifications && <ListView title="Notifications" containerRef={modalContainer} closeButton={false}>{createNotifications(true, notifications??[])}</ListView>}

                {/* <ListView title="Notifications" containerRef={modalContainer} closeButton={false}>{createNotifications(true)}</ListView> */}

                {/* {modalContainer.current && <Modal modalContainer={modalContainer.current} noOverlay={true} type={ModalTypes.DeclinedDetails} details={declinedShiftDetails}/>} */}
            </div> : <Spinner custom showWater backgroundGradient borderSpinner/>
            }
           
          </div>
        </div>

      </Layout>
      
    
  );
}
