"use client";
import { useEffect, useRef, useState } from 'react';
import { AdminCalendarFilter, Calendar, CalendarFilter } from '@/app/components/Calendar';
import getStatusColor, { Status } from '@/app/components/utils/getStatusColor';
import formatDate, { formatDateDayJS, sqlDateFormatToRegularFormat } from '@/app/components/utils/formatDate';
import Dropdown from '@/app/components/Dropdown';
import { createModal, ModalTypes, ShiftExtendedProps } from '@/app/components/Modal';
import Layout from '@/app/components/Layout';
import Button from '@/app/components/Button';
import { MonthCalendar, PickerValidDate } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import Accordion from '@/app/components/Accordion';
import Input from '@/app/components/Input';
import useIsOverMd from '@/app/components/utils/useIsOverMd';
import { EventInput } from '@fullcalendar/core';
import { fetchLocations, getLocationsStatic } from '@/app/controllers/Location';
import { getEventInputShifts, publishBulkShift } from '@/app/controllers/Shifts';
import { fetchAllEmployees } from '@/app/controllers/User';
import Checkbox from '@/app/components/Checkbox';
import { fetchLeaves, getEventInputLeaves, getEventInputUnavailabilities } from '@/app/controllers/Unavailabilities';
import { useModal } from '@/app/components/ModalContext';
import { useAuth } from '@/app/contexts/AuthContext';
import Spinner from '@/app/components/Spinner';
import Modal from '@/app/components/Modal';
import Toast from '@/app/components/Toast';


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
  const [events, setEvents] = useState<EventInput[]|undefined>(undefined);
  const [allEvents, setAllEvents] = useState<EventInput[]|undefined>(undefined);

  const [showUnpublished, setShowUnpublished] = useState(false);

  useEffect(() => {
    async function fetchEvents() {
      const shifts = await getEventInputShifts(account!.id);
      const leaves = await getEventInputLeaves(account!.id);
      setAllEvents([...shifts, ...leaves]);
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
  }, []);

  useEffect(() => {
    if (showUnpublished) {
      setEvents(allEvents);
    } else {
      if (allEvents)
        setEvents(allEvents.filter((s) => s.extendedProps?.published || s.extendedProps?.type==='leave' || s.extendedProps?.type==='unavailability'));
      else setEvents([]);
    }
  }, [showUnpublished, allEvents]);

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

  const updateEventData = (event: EventInput, mode="update") => {
    if (allEvents && events){
      if (mode==='create'){
        setAllEvents([event, ...allEvents]);
        setEvents([event, ...events]);
      
      }
      else if (mode==='delete'){
          setAllEvents(allEvents.filter(e => e.extendedProps?.id !== event.extendedProps?.id ));
          setEvents(events.filter(e => e.extendedProps?.id !== event.extendedProps?.id ));
      }
      else{
          setAllEvents(allEvents.map(e => e.extendedProps?.id === event.extendedProps?.id ? event : e));
          setEvents(events.map(e => e.extendedProps?.id === event.extendedProps?.id ? event : e));
      }
    }
  }

  const [openModal, setOpenModal] = useState(false);
  const [showToast, setToastShown] = useState(false);
  const [message, setMessage] = useState("");
  const [toastType, setToastType] = useState<"success"|"error">("success");

  const displayToast = (message: string, toastType: "success"|"error") => {
      setMessage(message);
      setToastType(toastType);
      setToastShown(true);
  }

  const publishShift = async (month?:string, year?:string) => {
    const res = await publishBulkShift(month, year);
    if (res){
      console.log('success');
      setOpenModal(false);
      if (month || year)
        displayToast("Successfully published shifts for this month! Please refresh the page to view the latest changes.", 'success');
      else
        displayToast("Successfully published all upcoming shifts! Please refresh the page to view the latest changes.", 'success');
    }
    else displayToast("Fail to publish multiple shifts!", 'error');
  }
   
  return (
      <Layout modalContainer={modalContainer}>
        <Toast message={message} type={toastType} shown={showToast} setShown={setToastShown}/>
        <div className="relative flex-[1] h-full bg-[#f4f4f4]">
          <div className='p-4 h-full flex flex-col'>
            
            {account && <h2 className="text-2xl mb-4">Welcome, <span className="text-primary font-semibold">{account.first_name+ ' ' + account.last_name}</span></h2>}
           

            {allEvents === undefined ? <Spinner custom showWater backgroundGradient borderSpinner/> :
            <>
              <div className={`flex justify-between ${showUnpublished ? 'items-end' : 'items-center'}  mb-4 md:mb-0`}>
                <div className="flex flex-col items-start md:flex-row flex-wrap gap-3">
                
                  <Dropdown items={['All employees', ...employees]} placeholder="Select employee" actAsFilter setFilter={setEmployee} maxVisibleItems={6} className='md:rounded-b-none min-w-32' initialSelectedItem='All employees'/>

                  <Dropdown items={['All locations', ...locations]} placeholder="Select location" actAsFilter setFilter={setLocation} maxVisibleItems={6} className='md:rounded-b-none min-w-32' initialSelectedItem='All locations'/>

                  <Dropdown items={['All shifts', ...Object.values(Status).slice(0, Object.values(Status).length-2)]} placeholder="Select shift" actAsFilter setFilter={setStatus} maxVisibleItems={6} className='md:rounded-b-none min-w-32' initialSelectedItem='All shifts'/>

                  <Dropdown placeholder="Select month" actAsFilter setMonth={activeFilter.month} maxVisibleItems={6} className='md:rounded-b-none' custom customSelected={monthSelectedDropdown}>
                    <Input arrow='leftRight' value={activeFilter.month.year()} containerClassName='float-end pr-7' readonly setValue={setYear}/>
                    
                    <MonthCalendar defaultValue={dayjs()} value={activeFilter.month} onChange={(e)=>handleMonthChange(e)}/>
                  
                  </Dropdown>
                </div>

                {(allEvents && allEvents.find(e => e.extendedProps?.published===0)) &&
                <div className='flex flex-col items-end gap-2'>
                  <Checkbox checked={showUnpublished} onChange={setShowUnpublished} label='Show unpublished shifts' className='text-sm'/>
                  {showUnpublished && <Button className='md:rounded-b-none py-2 px-4' fontSize='0.8em' onClick={()=>setOpenModal(true)}>Publish all shifts</Button> }  

                </div>
                }
                
                         
            </div>

            <Calendar key={isOverMd ? 'month' : 'list'}  events={events ?? []} showSelectedFilter={activeFilter} modalContainer={modalContainer} hideHeader={true} initialView={isOverMd ? 'dayGridMonth' : 'listMonth'} updateEventData={updateEventData}></Calendar>

            { modalContainer.current &&       
              <Modal details={{}} shown={openModal} setShown={setOpenModal} modalContainer={modalContainer.current} setParentOpen={setOpenModal} displayToast={displayToast} title="Publish all shifts confirmation">
                <div className='mt-4'>You are about to publish multiple shifts. Would you like to publish only the shifts scheduled for this month ({activeFilter.month.format("MMMM YYYY")}) or all upcoming shifts?</div>
                

                <div className='flex items-center justify-end gap-4 mt-6'> 
                  <Button type="cta" fontSize="0.8em"  className="py-3 px-5" onClick={()=>publishShift((activeFilter.month.month()+1).toString(), activeFilter.month.year().toString())}>This Month Only</Button>
                  <Button type="cta" htmlType='submit' fontSize="0.8em" className="py-3 px-5" onClick={()=>publishShift()}>All Shifts</Button>
                  
                </div>
              </Modal>
            }
            
            </>}
            
          </div>
        </div>

      </Layout>
      
    
  );
}
