"use client";
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AdminCalendarFilter, Calendar, CalendarFilter, weeklyPayType } from '@/app/components/Calendar';
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
import { fetchLeaves, getEventInputLeaves, getEventInputUnavailabilities } from '@/app/controllers/Leave';
import { useModal } from '@/app/components/ModalContext';
import { useAuth } from '@/app/contexts/AuthContext';
import Spinner from '@/app/components/Spinner';
import Modal from '@/app/components/Modal';
import Toast from '@/app/components/Toast';
import { FaClipboardList,  FaMapPin, FaUser } from 'react-icons/fa';


export default function AdminCalendarPage() {
  const modalContainer = useRef<HTMLDivElement>(null);
  const account = useAuth().user;

  const [activeFilter, setActiveFilter] = useState<AdminCalendarFilter>({status: ["All shifts"], location:["All locations"], month:dayjs(), employee: ["All employees"], show_unpublished: false});
  
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
  const setShowUnpublished = (shown: boolean) => {
    setActiveFilter((prev) => ({
      ...prev, show_unpublished : shown
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
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    async function fetchEvents() {
      const shifts = await getEventInputShifts(account!.id, (activeFilter.month.month()+1).toString());
      const leaves = await getEventInputLeaves(account!.id);
      setAllEvents([...shifts, ...leaves]);
      if (activeFilter.show_unpublished) setEvents([...shifts, ...leaves]);
      else setEvents([...shifts.filter(e=>e.extendedProps?.published===1), ...leaves]);

    } 

    (async ()=>{
      setLoadingEvents(true);

      try{
        fetchEvents();
      }
      finally{
        setLoadingEvents(false);
      }
    })();
  }, [activeFilter.month]);

  useEffect(()=>{
    if (activeFilter.show_unpublished) setEvents(allEvents);
    else setEvents(allEvents?.filter(e=>e.extendedProps?.published===1));
  }, [activeFilter.show_unpublished])

  useEffect(() => {
    async function getLocations() {
      const locations = await fetchLocations();
      setLocations(locations.map((location) => location.name));
    }

    async function getEmployees() {
      const employees = await fetchAllEmployees();

      setEmployees(employees.map((employee) => (employee.first_name + ' ' + employee.last_name)));
    }
    
    getLocations();
    getEmployees();
  }, []);



  const setYear = (year:number) => {
    setMonth(formatDateDayJS(year, activeFilter.month.month(), activeFilter.month.date()));
  }

  const handleMonthChange = (e : PickerValidDate) => {
    setMonth(e);
  }

  const monthSelectedDropdown = (activeFilter.month.year() === dayjs().year()) ? activeFilter.month.format('MMMM') : activeFilter.month.format('MMMM') + ", " + activeFilter.month.year(); 

  const isOverMd = useIsOverMd();

  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState<'publish'|'weekly-pay'>('publish');
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

  const [trHeights, setTrHeights] = useState<number[]>([]);

  const targetRef = useRef<HTMLTableElement>(null);
  useEffect(() => {
    const sourceEl = document.querySelector<HTMLElement>('.fc-scroller-liquid-absolute');
    const targetEl = targetRef.current;

  if (!sourceEl || !targetEl) {
    return;
  }

  const handleScroll = () => {
    targetEl.scrollTop = sourceEl.scrollTop;
    targetEl.scrollLeft = sourceEl.scrollLeft;
  };

  sourceEl.addEventListener("scroll", handleScroll);

    return () => {
      sourceEl.removeEventListener("scroll", handleScroll);
    };
  }, [targetRef.current, events]);

  const [weeklyPay, setWeeklyPay] = useState<weeklyPayType[]>([]);
  const [weeklyPayIndex, setWeeklyPayIndex] = useState<number|null>(null);

  return (
      <Layout modalContainer={modalContainer}>
        <Toast message={message} type={toastType} shown={showToast} setShown={setToastShown}/>
        <div className="relative flex-[1] h-full bg-[#f4f4f4]">
           {loadingEvents ? <div className="absolute rounded-lg top-0 left-0 w-full h-full z-20"> <Spinner/> </div> : ''}
          <div className='p-4 h-full flex flex-col'>
            {account && <h2 className="text-2xl mb-4">Welcome, <span className="text-primary font-semibold">{account.first_name+ ' ' + account.last_name}</span></h2>}
           

            {allEvents === undefined ? <Spinner custom showWater backgroundGradient borderSpinner/> :
            <>
            <div className='flex h-full flex-1 gap-2'>
              <div className='h-full hidden md:block'>
                <div style={{height: document.getElementById('top-section')?.clientHeight+'px'}}>&nbsp;</div>
                <div style={{height: document.getElementsByClassName('fc-dayGridMonth-view').item(0)?.clientHeight+'px'}} className='overflow-hidden' ref={targetRef}>
                  <table className='border-separate border-spacing-0'>
                  <thead>
                    <tr className="sticky top-0 z-10" style={{height: document.getElementsByClassName('fc-scrollgrid-sync-inner').item(0)?.clientHeight+'px'}}>
                      <th className='border bold text-primary bg-[#f2f2f2] border-light-grey'>Pay</th>
                    </tr>
                  </thead>
                  <tbody>
                    { 
                      trHeights.length>0 && trHeights.map((height, index)=>
                      <tr key={index} style={{height: height+"px"}}>
                        <td className='max-w-24 border px-3 text-hover font-semibold border-light-grey cursor-pointer hover:border-primary hover:bg-hover text-center hover:text-white duration-400 transition-colors' onClick={()=>{setWeeklyPayIndex(index); setModalType('weekly-pay'); setOpenModal(true); }}>${Math.round(weeklyPay[index].total*100)/100}</td>
                        </tr>)
                    }
                  </tbody>
                </table>
                </div>
                
              </div>
              <div className='flex flex-col flex-1'>
                <div id='top-section' className='flex justify-between items-end'>
                <div>
                  <div className='flex justify-between items-center mb-2 md:mb-1'>
                    <div className="flex items-start flex-row flex-wrap gap-3 ">
                      <Dropdown items={['All employees', ...employees]} placeholder="Select employee" actAsFilter setFilter={setEmployee} maxVisibleItems={6} containerClassName='md:rounded-b-none md:min-w-32' initialSelectedItem='All employees' simplifyOnMobile replacementIcon={<FaUser/>}/>

                      <Dropdown items={['All locations', ...locations]} placeholder="Select location" actAsFilter setFilter={setLocation} maxVisibleItems={6} containerClassName='md:rounded-b-none md:min-w-32' initialSelectedItem='All locations' simplifyOnMobile replacementIcon={<FaMapPin/>}/>

                      <Dropdown items={['All shifts', ...Object.values(Status).slice(0, Object.values(Status).length-3)]} placeholder="Select shift" actAsFilter setFilter={setStatus} maxVisibleItems={6} containerClassName='md:rounded-b-none min-w-fit' initialSelectedItem='All shifts' disableTyping simplifyOnMobile replacementIcon={<FaClipboardList/>}/>

                      <Dropdown placeholder="Select month" actAsFilter setMonth={activeFilter.month} maxVisibleItems={6} className='hidden md:block' containerClassName='rounded-b-none' custom disableTyping customSelected={monthSelectedDropdown}>
                        <Input arrow='leftRight' value={activeFilter.month.year()} containerClassName='float-end pr-7' readonly setValue={setYear}/>
                        
                        <MonthCalendar defaultValue={dayjs()} value={activeFilter.month} onChange={(e)=>handleMonthChange(e)} sx={{
                            gap: "16px 24px",
                            padding: "8px",
                            width: "300px",
                            "& .MuiMonthCalendar-button.Mui-selected": {
                              backgroundColor: "var(--primary-color)",
                              color: "#fff",
                            },
                          }}/>
                      
                      </Dropdown>
                    
                      
                    </div>
                  
                  </div>

                  <Dropdown placeholder="Select month" actAsFilter setMonth={activeFilter.month} maxVisibleItems={6} className='md:hidden mb-2' custom disableTyping customSelected={monthSelectedDropdown}>
                    <Input arrow='leftRight' value={activeFilter.month.year()} containerClassName='float-end pr-7' readonly setValue={setYear}/>
                    
                    <MonthCalendar defaultValue={dayjs()} value={activeFilter.month} onChange={(e)=>handleMonthChange(e)} sx={{
                            gap: "16px 4px",
                            padding: "8px",
                            width: "240px",
                            "& .MuiMonthCalendar-button.Mui-selected": {
                              backgroundColor: "var(--primary-color)",
                              color: "#fff",
                            },
                          }}/>
                  </Dropdown>
                </div>


                {(allEvents && allEvents.find(e => e.extendedProps?.published===0)) ?
                <div className='flex flex-col items-end gap-2'>
                  <Checkbox checked={activeFilter.show_unpublished} onChange={(e)=>setShowUnpublished(e)} label='Show unpublished shifts' className='text-sm -mt-7'/>
                  {activeFilter.show_unpublished && <Button className='rounded-b-none rounded-t-md py-2 px-4' fontSize='0.8em' onClick={()=>{setModalType('publish'); setOpenModal(true);}}>Publish all shifts</Button> }  

                </div> :<div className='h-full text-white text-sm py-2 font-semibold rounded-t-md rounded-b-none bg-light-grey px-4 flex items-center'>All shifts published for this month</div>
                }
                </div>
                <Calendar key={isOverMd ? 'month' : 'list'}  events={events??[]} showSelectedFilter={activeFilter} modalContainer={modalContainer} hideHeader={true} initialView={isOverMd ? 'dayGridMonth' : 'listMonth'} setColHeights={setTrHeights} setWeeklyPay={setWeeklyPay}></Calendar>
              </div>
            </div>
            
            { modalContainer.current &&       
              <Modal details={{}} shown={openModal} setShown={setOpenModal} modalContainer={modalContainer.current} setParentOpen={setOpenModal} displayToast={displayToast} title={modalType==='publish'?"Publish all shifts confirmation":"Weekly pay details"}>

                {modalType === 'publish' ? 
                <>
                  <div className='mt-4'>You are about to publish multiple shifts. Would you like to publish only the shifts scheduled for this month ({activeFilter.month.format("MMMM YYYY")}) or all upcoming shifts?</div>
                  

                  <div className='flex items-center justify-end gap-4 mt-6'> 
                    <Button type="cta" fontSize="0.8em"  className="py-3 px-5" onClick={()=>publishShift((activeFilter.month.month()+1).toString(), activeFilter.month.year().toString())}>This Month Only</Button>
                    <Button type="cta" htmlType='submit' fontSize="0.8em" className="py-3 px-5" onClick={()=>publishShift()}>All Shifts</Button>
                    
                  </div>
                </> :''}

                {modalType === 'weekly-pay' ? 
                <>
                  {(weeklyPayIndex!==null && weeklyPay.length>0 && weeklyPay[weeklyPayIndex]) ? 

                  <div>
                    <div className='font-medium text-secondary mb-4'>
                      <div className={``}>Date: {weeklyPay[weeklyPayIndex].date_start + ' - ' + weeklyPay[weeklyPayIndex].date_end}</div> 
                      <div className={``}>Total: ${Math.round(weeklyPay[weeklyPayIndex].total*100)/100}</div> 
                    </div>
                    
                  {weeklyPay[weeklyPayIndex].assignees.length>0 ? weeklyPay[weeklyPayIndex].assignees.map((a,idx)=>
                    <div key={idx} className='flex gap-2'>
                      <span className={`text-right mr-2 w-48 ${!a.name?'text-gray-600':''}`}>{a.name?a.name:'Open/unassigned shifts'}:</span> 
                      <span className={`${!a.name?'text-gray-600':'text-primary font-medium'} `}>{a.duration?(Math.floor(a.duration/60)+'h'+ ((a.duration%60>0)?(' '+a.duration%60+'m'):'')):'0h'}</span>- 
                      <span className={`${!a.name?'text-gray-600':'text-hover font-medium'} `}>${a.total_pay}</span></div>) : 'There are no shifts this week'}
                  </div>

                  : ''}
                </>
                : ""}
                
              </Modal>
            }
            
            </>}
            
          </div>
        </div>

      </Layout>
      
    
  );
}
