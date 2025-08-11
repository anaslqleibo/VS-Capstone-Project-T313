import { useState } from 'react';
import { AdminCalendarFilter, Calendar, CalendarFilter } from '../../components/Calendar';
import getStatusColor, { Status } from '../../components/utils/getStatusColor';
import formatDate, { formatDateDayJS } from '../../components/utils/formatDate';
import Dropdown from '../../components/Dropdown';
import { createModal, ModalDetailsProps, ModalTypes } from '../../components/Modal';
import { PageProps } from '../../App';
import Layout from '../../components/Layout';
import Button from '../../components/Button';
import { MonthCalendar, PickerValidDate } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import Accordion from '../../components/Accordion';
import Input from '../../components/Input';
import useIsOverMd from '../../components/utils/useIsOverMd';
import { EventInput } from '@fullcalendar/core';
import { getEmployeeStatic } from '../../classes/Employee';
import { getLocationsStatic } from '../../classes/Location';


export default function AdminCalendarPage({modalContainer}: PageProps) {
  const [activeFilter, setActiveFilter] = useState<AdminCalendarFilter>({status: ["All shifts"], location:["All locations"], month:dayjs(), employee: ["All employees"]});
  
  const setStatus = (status:string[]) => {
    setActiveFilter((prev) => ({
      ...prev, status : status
    }));
  }
  const setLocation = (location:string[]) => {
    setActiveFilter((prev) => ({
      ...prev, location : location
    }));
  }
  const setMonth = (month:dayjs.Dayjs) => {
    setActiveFilter((prev) => ({
      ...prev, month : month
    }));
  }

  const setEmployee = (employee:string[]) => {
    setActiveFilter((prev) => ({
      ...prev, employee : employee
    }));
  }

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

  const employees = getEmployeeStatic();
  const locations = getLocationsStatic();

  const today = formatDate(new Date(), true); 
  const yesterday = formatDate(new Date(dayjs().subtract(1,'day').format('YYYY-MM-DD')), true);
  const nextWeek = formatDate(new Date(dayjs().add(7,'day').format('YYYY-MM-DD')), true);

  const events2: EventInput[] = [
    {
      start: today,
      extendedProps: {
        status: Status.Accepted,
        time: '12:00–16:00',
        location: locations[0],
        details: openShiftDetails,
        employee: employees[0],
      },
      color: getStatusColor(Status.Accepted),
    },
    {
      start: nextWeek,
      extendedProps: {
        status: Status.Pending,
        time: '11:00–12:00',
        location: locations[1],
        details: openShiftDetails,
        employee: employees[1],
      },
      color: getStatusColor(Status.Pending),
    },
    {
      start: yesterday,
      allDay: true,
      extendedProps: {
        status: Status.Leave,
        details: leaveDetails,
        employee: employees[2],
      },
      color: getStatusColor(Status.Leave),
    },
    {
      start: today,
      extendedProps: {
        status: Status.OpenShift,
        time: '08:00–12:00',
        location: locations[2],
        details: openShiftDetails,
        employee: employees[2],
      },
      color: getStatusColor(Status.OpenShift),
    },
    {
      start: today,
      extendedProps: {
        status: Status.DeclinedShift,
        time: '14:00–17:30',
        location: locations[3],
        details: declinedShiftDetails,
        employee: employees[3],
      },
      color: getStatusColor(Status.DeclinedShift),
    },
    {
      start: today,
      extendedProps: {
        status: Status.Request,
        time: '13:00–16:00',
        location: locations[4],
        employee: employees[0],
      },
      color: getStatusColor(Status.Leave),
    },
    {
      start: today,
      extendedProps: {
        status: Status.Unassigned,
        time: '07:00-11:00',
        location: locations[2],
      },
      color: getStatusColor(Status.Unassigned),
    },
  ];



  const [openModal, setOpenModal] = useState(false);

  const setYear = (year:number) => {
    setMonth(formatDateDayJS(year, activeFilter.month.month(), activeFilter.month.date()));
  }

  const handleMonthChange = (e : PickerValidDate) => {
    setMonth(e);
  }

  const monthSelectedDropdown = (activeFilter.month.year() === dayjs().year()) ? activeFilter.month.format('MMMM') : activeFilter.month.format('MMMM') + ", " + activeFilter.month.year(); 

  const isOverMd = useIsOverMd();

  return (
      <Layout modalContainer={modalContainer}>
        <div className="relative flex-[1] h-full bg-[#f4f4f4]">
          <div className='p-6 h-full md:flex md:flex-col'>
            
            <h2 className="text-2xl mb-[30px]">Welcome, <span className="text-[color:var(--primary-color)] font-semibold">Anas</span></h2>

            <div className='flex justify-between items-end mb-4 md:mb-0'>
              <div className="flex flex-col items-start md:flex-row flex-wrap gap-3 ">
              
                <Dropdown items={['All employees', ...employees]} placeholder="Select employee" actAsFilter setFilter={setEmployee} maxVisibleItems={6} className='md:rounded-b-none' initialSelectedItem='All employees'/>

                <Dropdown items={['All locations', ...locations]} placeholder="Select location" actAsFilter setFilter={setLocation} maxVisibleItems={6} className='md:rounded-b-none' initialSelectedItem='All locations'/>

                <Dropdown items={['All shifts', ...Object.values(Status)]} multiple placeholder="Select shift" actAsFilter setFilter={setStatus} maxVisibleItems={6} className='md:rounded-b-none' initialSelectedItem='All shifts'/>

                <Dropdown placeholder="Select month" actAsFilter setMonth={activeFilter.month} maxVisibleItems={6} className='md:rounded-b-none' custom customSelected={monthSelectedDropdown}>
                  <Input arrow='leftRight' value={activeFilter.month.year()} className='float-end pr-7' readonly setValue={setYear}/>

                  
                  <MonthCalendar defaultValue={dayjs()} value={activeFilter.month} onChange={(e)=>handleMonthChange(e)}/>
                
                </Dropdown>
              </div>

              <Button onClick={() => setOpenModal(true)} className='md:rounded-b-none md:rounded-t-md text-sm md:h-full p-3' fontSize='0.8em'>Add Leave</Button>

            </div>

            {/* <Accordion text="Show color code info" className='md:hidden mt-3'>
              <div className='flex flex-col gap-2 justify-start'>

                { (Object.values(Status) as Status[]).map((item, index) => (
                 <div key={index} className='flex gap-4 items-center'>
                  <div className="rounded-md w-6 h-4" style={{backgroundColor: `${getStatusColor(item)}`}}></div>
                  {item + " shift"}
                 </div>
                ))
                }
                
                
              </div>
            </Accordion> */}
            
            
            <Calendar key={isOverMd ? 'month' : 'list'}  events={events2} showSelectedFilter={activeFilter} modalContainer={modalContainer} hideHeader={true} initialView={isOverMd ? 'dayGridMonth' : 'listMonth'}></Calendar>

            {openModal && modalContainer.current && createModal(ModalTypes.AddLeave, true, modalContainer.current, null, setOpenModal)}
            
          </div>
        </div>

      </Layout>
      
    
  );
}
