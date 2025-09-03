"use client";
import { useEffect, useRef, useState } from 'react';
import { AdminCalendarFilter, Calendar, CalendarFilter } from '@/app/components/Calendar';
import getStatusColor, { Status } from '@/app/components/utils/getStatusColor';
import formatDate, { formatDateDayJS, sqlDateFormatToRegularFormat } from '@/app/components/utils/formatDate';
import Dropdown from '@/app/components/Dropdown';
import { createModal, ModalTypes } from '@/app/components/Modal';
import Layout from '@/app/components/Layout';
import Button from '@/app/components/Button';
import { MonthCalendar, PickerValidDate } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import Accordion from '@/app/components/Accordion';
import Input from '@/app/components/Input';
import useIsOverMd from '@/app/components/utils/useIsOverMd';
import { EventInput } from '@fullcalendar/core';
import { fetchLocations, getLocationsStatic } from '@/app/controllers/Location';
import { getEventInputShifts } from '@/app/controllers/Shifts';
import { fetchAllEmployees } from '@/app/controllers/User';
import Checkbox from '@/app/components/Checkbox';
import { fetchLeaves, getEventInputLeaves, getEventInputUnavailabilities } from '@/app/controllers/Unavailabilities';
import { useModal } from '@/app/components/ModalContext';
import { useAuth } from '@/app/contexts/AuthContext';


export default function AdminCalendarPage() {
  const modalContainer = useRef<HTMLDivElement>(null);
  const account = useAuth().user;

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

  const [employees, setEmployees] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [events, setEvents] = useState<EventInput[]>([]);
  const [showUnavailability, setShowUnavailability] = useState(false);

  useEffect(() => {
    async function fetchEvents() {
      const shifts = await getEventInputShifts(true, account!.id);
      const leaves = await getEventInputLeaves(true, account!.id);
    
      let allEvents: EventInput[] = [];

      if (showUnavailability){
        const unavailabilities = await getEventInputUnavailabilities(true, account!.id);
        allEvents = [...shifts, ...leaves, ...unavailabilities];
      }
      else{
        allEvents = [...shifts, ...leaves];
      }
      
      setEvents(allEvents);
    }

    async function getLocations() {
      const locations = await fetchLocations();
      setLocations(locations.map((location) => location.name));
    }

    async function getEmployees() {
      const employees = await fetchAllEmployees();

      setEmployees(employees.map((employee) => (employee.first_name + ' ' + employee.last_name)));
    }
    

    fetchEvents();
    getLocations();
    getEmployees();
  }, [showUnavailability]);


  const modal = useModal();
  const {modalShown, setModalShown} = modal;

  const setYear = (year:number) => {
    setMonth(formatDateDayJS(year, activeFilter.month.month(), activeFilter.month.date()));
  }

  const handleMonthChange = (e : PickerValidDate) => {
    setMonth(e);
  }

  const monthSelectedDropdown = (activeFilter.month.year() === dayjs().year()) ? activeFilter.month.format('MMMM') : activeFilter.month.format('MMMM') + ", " + activeFilter.month.year(); 

  const isOverMd = useIsOverMd();
  useEffect(()=>{
    modal.setModalShown(false);

  }, [isOverMd])
  return (
      <Layout modalContainer={modalContainer}>
        <div className="relative flex-[1] h-full bg-[#f4f4f4]">
          <div className='p-6 h-full flex flex-col'>
            
            <h2 className="text-2xl mb-[30px]">Welcome, <span className="text-[color:var(--primary-color)] font-semibold">{(account?account.first_name:'')+ ' ' + (account?account.last_name:'')}</span></h2>

            <div className='flex justify-between items-center mb-4 md:mb-0'>
              <div className="flex flex-col items-start md:flex-row flex-wrap gap-3 ">
              
                <Dropdown items={['All employees', ...employees]} placeholder="Select employee" actAsFilter setFilter={setEmployee} maxVisibleItems={6} className='md:rounded-b-none min-w-32' initialSelectedItem='All employees'/>

                <Dropdown items={['All locations', ...locations]} placeholder="Select location" actAsFilter setFilter={setLocation} maxVisibleItems={6} className='md:rounded-b-none' initialSelectedItem='All locations'/>

                <Dropdown items={['All shifts', ...Object.values(Status)]} placeholder="Select shift" actAsFilter setFilter={setStatus} maxVisibleItems={6} className='md:rounded-b-none' initialSelectedItem='All shifts'/>

                <Dropdown placeholder="Select month" actAsFilter setMonth={activeFilter.month} maxVisibleItems={6} className='md:rounded-b-none' custom customSelected={monthSelectedDropdown}>
                  <Input arrow='leftRight' value={activeFilter.month.year()} containerClassName='float-end pr-7' readonly setValue={setYear}/>
                  
                  <MonthCalendar defaultValue={dayjs()} value={activeFilter.month} onChange={(e)=>handleMonthChange(e)}/>
                
                </Dropdown>
              </div>

              <Checkbox checked={showUnavailability} onChange={setShowUnavailability} label='Show unavailability'/>              
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
            
            
            <Calendar key={isOverMd ? 'month' : 'list'}  events={events} showSelectedFilter={activeFilter} modalContainer={modalContainer} hideHeader={true} initialView={isOverMd ? 'dayGridMonth' : 'listMonth'}></Calendar>

            {modalShown && modalContainer.current && createModal(ModalTypes.AddLeave, true, modalContainer.current, null, setModalShown)}
            
          </div>
        </div>

      </Layout>
      
    
  );
}
