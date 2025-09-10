"use client";
import { useEffect, useRef, useState } from 'react';
import { Calendar, CalendarFilter } from '@/app/components/Calendar';
import getStatusColor, { Status } from '@/app/components/utils/getStatusColor';
import formatDate, { formatDateDayJS, sqlDateFormatToRegularFormat } from '@/app/components/utils/formatDate';
import Dropdown from '@/app/components/Dropdown';
import { createModal, ModalTypes } from '@/app/components/Modal';
import { PageProps } from '@/app/layout';
import Layout from '@/app/components/Layout';
import Button from '@/app/components/Button';
import { MonthCalendar, PickerValidDate } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import Accordion from '@/app/components/Accordion';
import Input from '@/app/components/Input';
import useIsOverMd from '@/app/components/utils/useIsOverMd';
import { buildShiftEvent, getEventInputShifts } from '@/app/controllers/Shifts';
import { EventInput } from '@fullcalendar/core';
import Checkbox from '@/app/components/Checkbox';
import { fetchLocations } from '@/app/controllers/Location';
import { getEventInputLeaves, getEventInputUnavailabilities } from '@/app/controllers/Unavailabilities';
import { useAuth } from '@/app/contexts/AuthContext';
import Toast from '@/app/components/Toast';
import Spinner from '@/app/components/Spinner';

export default function EmployeeDashboardPage() {
  const modalContainer = useRef<HTMLDivElement>(null);
  const account = useAuth().user;

  const [activeFilter, setActiveFilter] = useState<CalendarFilter>({status: ["All shifts"], location:["All locations"], month:dayjs()});
  
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


  const [locations, setLocations] = useState<string[]>([]);
  const [events, setEvents] = useState<EventInput[]>([]);
  const [showUnavailability, setShowUnavailability] = useState(false);

  useEffect(() => {
    async function fetchEvents() {
      if (account){

        const shifts = await getEventInputShifts(account!.id);
        const leaves = await getEventInputLeaves(account!.id);
        
        let allEvents: EventInput[] = [];

        if (showUnavailability){
          const unavailabilities = await getEventInputUnavailabilities(account?.id ? account?.id : 0);
          allEvents = [...shifts, ...leaves, ...unavailabilities];
        }
        else{
          allEvents = [...shifts, ...leaves];
        }
        
        setEvents(allEvents);
      }
      
    }

    async function getLocations() {
      const locations = await fetchLocations();
      setLocations(locations.map((location) => location.name));
    }

    fetchEvents();
    getLocations();
  }, [showUnavailability, account]);



  const [openModal, setOpenModal] = useState(false);

  const setYear = (year:number) => {
    setMonth(formatDateDayJS(year, activeFilter.month.month(), activeFilter.month.date()));
  }

  const handleMonthChange = (e : PickerValidDate) => {
    setMonth(e);
  }

  const monthSelectedDropdown = (activeFilter.month.year() === dayjs().year()) ? activeFilter.month.format('MMMM') : activeFilter.month.format('MMMM') + ", " + activeFilter.month.year(); 

  const isOverMd = useIsOverMd();

  const [showToast, setToastShown] = useState(false);
  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState<"success"|"error">("success");

  const displayToast = (message: string, toastType: "success"|"error") => {
      setMessage(message);
      setToastType(toastType);
      setToastShown(true);
  }

  return (
      <Layout modalContainer={modalContainer}>
        <div className="relative flex-[1] h-full bg-[#f4f4f4]">
          <Toast message={message} type={toastType} shown={showToast} setShown={setToastShown}/>
          <div className='p-6 h-full flex flex-col'>
            
            {account && <h2 className="text-2xl mb-[30px]">Welcome, <span className="text-[color:var(--primary-color)] font-semibold">{account.first_name+ ' ' + account.last_name}</span></h2>}
           
            {events.length === 0 ? <Spinner/> :
            <>
              <div className='flex justify-between items-end mb-4 md:mb-0 gap-5'>
                <div className="flex flex-col items-start md:flex-row flex-wrap gap-3 ">
                
                  <Dropdown items={['All locations', ...locations]} placeholder="Select location" actAsFilter setFilter={setLocation} maxVisibleItems={6} className='md:rounded-b-none' initialSelectedItem='All locations min-w-32'/>

                  <Dropdown items={['All shifts', ...Object.values(Status).slice(0, Object.values(Status).length-1)]} placeholder="Select shift" actAsFilter setFilter={setStatus} maxVisibleItems={6} className='md:rounded-b-none min-w-32' initialSelectedItem='All shifts'/>

                  <Dropdown placeholder="Select month" actAsFilter setMonth={activeFilter.month} maxVisibleItems={6} className='md:rounded-b-none min-w-32' custom customSelected={monthSelectedDropdown}>
                    <Input arrow='leftRight' value={activeFilter.month.year()} containerClassName='float-end pr-7' readonly setValue={setYear}/>

                    
                    <MonthCalendar defaultValue={dayjs()} value={activeFilter.month} onChange={(e)=>handleMonthChange(e)}/>
                  
                  </Dropdown>
                </div>

                
                <div className='flex flex-col items-end md:items-center gap-2 md:flex-row md:gap-4 mt-3 md:mt-0'>
                  {/* <Checkbox checked={showUnavailability} onChange={setShowUnavailability} label='Show unavailability'/> */}

                  <Button onClick={() => setOpenModal(true)} className='md:rounded-b-none md:rounded-t-md text-sm md:h-full p-3' fontSize='0.8em'>Add Leave</Button>
                </div>
                

              </div>
              
              <Calendar key={isOverMd ? 'month' : 'list'}  events={events} showSelectedFilter={activeFilter} modalContainer={modalContainer} hideHeader={true} initialView={isOverMd ? 'dayGridMonth' : 'listMonth'}></Calendar>

              {openModal && modalContainer.current && createModal(ModalTypes.AddLeave, true, modalContainer.current, {recurrence: ''}, setOpenModal,undefined, undefined, displayToast)}
              {/* The key 'recurrence' here plays an important role as it is used to check what type of details it sent, so either keep it or implement a safety measure to replace it*/}
            
            </>}
            
          </div>
        </div>

      </Layout>
      
    
  );
}
