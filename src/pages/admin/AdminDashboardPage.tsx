import { useState } from 'react';
import { Calendar, CalendarFilter } from '../../components/Calendar';
import getStatusColor, { Status } from '../../components/utils/getStatusColor';
import formatDate, { formatDateDayJS } from '../../components/utils/formatDate';
import Dropdown from '../../components/Dropdown';
import Modal, { createModal, ModalDetailsProps, ModalTypes } from '../../components/Modal';
import { PageProps } from '../../App';
import Layout from '../../components/Layout';
import Button from '../../components/Button';
import { MonthCalendar, PickerValidDate } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import Accordion from '../../components/Accordion';
import Input from '../../components/Input';
import useIsOverMd from '../../components/utils/useIsOverMd';
import { EventInput } from '@fullcalendar/core';
import { useRole } from '../../components/RoleContext';
import ListView from '../../components/ListView';
import { createNotifications } from '../../components/utils/notification';


export default function AdminDashboardPage({modalContainer}: PageProps) {

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
  
  return (
      <Layout modalContainer={modalContainer}>
        <div className="relative flex-[1] h-full bg-[#f4f4f4]">
          <div className='p-6 h-full md:flex md:flex-col'>
            
            <h2 className="text-2xl mb-[30px]">Welcome, <span className="text-[color:var(--primary-color)] font-semibold">Anas</span></h2>

            <div className='flex justify-between items-end mb-4 md:mb-0'>
              <div className="flex flex-col items-start md:flex-row flex-wrap gap-5">
              
              <ListView title="Notifications" containerRef={modalContainer} closeButton={false}>{createNotifications()}</ListView>

              {modalContainer.current && <Modal modalContainer={modalContainer.current} noOverlay={true} type={ModalTypes.DeclinedDetails} details={declinedShiftDetails}/>}
            </div>

            
          </div>
        </div>
        </div>

      </Layout>
      
    
  );
}
