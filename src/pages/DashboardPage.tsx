import { useState } from 'react';
import { Calendar, CalendarFilter, EventProps } from '../components/Calendar';
import getStatusColor, { Status } from '../components/utils/getStatusColor';
import formatDate, { formatDateDayJS } from '../components/utils/formatDate';
import Dropdown from '../components/Dropdown';
import { createModal, ModalDetailsProps, ModalTypes } from '../components/Modal';
import { PageProps } from '../App';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { MonthCalendar, PickerValidDate } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import Accordion from '../components/Accordion';
import Input from '../components/Input';


export default function EmployeeDashboardPage({modalContainer}: PageProps) {
  // const [status, setStatus] = useState<string[]>(["All shifts"]);
  // const [location, setLocation] = useState<string[]>(["All locations"]);
  // const [month, setMonth] = useState<dayjs.Dayjs>(dayjs());

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

  const events: EventProps[] = [
            { status: Status.Accepted, time: '12:00–16:00', location: 'BCC', date: formatDate(new Date(), true), details: openShiftDetails},
            { status: Status.Unaccepted, time: '12:00–16:00', location: 'MBRC', date: formatDate(new Date(), true), details: openShiftDetails },
            { status: Status.Leave, time: '00:00–23:59', date: formatDate(new Date(), true) , details: leaveDetails, location: 'BCC'},
            { status: Status.OpenShift, time: '12:00–16:00', location: 'LCC', date: formatDate(new Date(), true), details: openShiftDetails},
            { status: Status.DeclinedShift, time: '12:00–16:00', location: 'LCC', date: formatDate(new Date(), true), details: declinedShiftDetails },
            { status: Status.Request, time: '12:00–16:00', location: 'MBRC', date: formatDate(new Date(), true) },
            { status: Status.Unassigned, time: '12:00–16:00', location: 'MBRC', date: formatDate(new Date(), true) }
          ];

  const [openModal, setOpenModal] = useState(false);

  const setYear = (year:number) => {
    setMonth(formatDateDayJS(year, activeFilter.month.month(), activeFilter.month.date()));
  }

  const handleMonthChange = (e : PickerValidDate) => {
    setMonth(e);
  }

  const monthSelectedDropdown = (activeFilter.month.year() === dayjs().year()) ? activeFilter.month.format('MMMM') : activeFilter.month.format('MMMM') + ", " + activeFilter.month.year(); 


  return (
      <Layout modalContainer={modalContainer}>
        <div className="relative flex-[1] h-full bg-[#f4f4f4]">
          <div className='p-6 h-full md:flex md:flex-col'>
            
            <h2 className="text-2xl mb-[30px]">Welcome, <span className="text-[color:var(--primary-color)] font-semibold">Anas</span></h2>

            <div className='flex justify-between md:-mb-6 items-end'>
              <div className="flex flex-wrap gap-3 items-end">
              
                <Dropdown items={['All locations', 'BCC', 'LCC', 'MBRC']} placeholder="Select location" actAsFilter setFilter={setLocation} maxVisibleItems={6} className='md:rounded-b-none' initialSelectedItem='All locations'/>

                <Dropdown items={['All shifts', ...Object.values(Status)]} multiple placeholder="Select shift" actAsFilter setFilter={setStatus} maxVisibleItems={6} className='md:rounded-b-none' initialSelectedItem='All shifts'/>

                <Dropdown placeholder="Select month" actAsFilter setMonth={activeFilter.month} maxVisibleItems={6} className='md:rounded-b-none' custom customSelected={monthSelectedDropdown}>
                  <Input arrow='leftRight' value={activeFilter.month.year()} className='float-end pr-7' readonly setValue={setYear}/>

                  
                  <MonthCalendar defaultValue={dayjs()} value={activeFilter.month} onChange={(e)=>handleMonthChange(e)}/>
                
                </Dropdown>
              </div>

              <Button onClick={() => setOpenModal(true)} className='md:rounded-b-none md:rounded-t-md text-sm md:h-full' fontSize='0.8em'>Add Leave</Button>
            </div>

            <Accordion text="Show color code info" className='md:hidden mt-3'>
              <div className='flex flex-col gap-2 justify-start'>

                { (Object.values(Status) as Status[]).map((item, index) => (
                 <div key={index} className='flex gap-4 items-center'>
                  <div className="rounded-md w-6 h-4" style={{backgroundColor: `${getStatusColor(item)}`}}></div>
                  {item + " shift"}
                 </div>
                ))
                }
                
                
              </div>
            </Accordion>
            
            
            <Calendar events = {events} showSelectedFilter={activeFilter} modalContainer={modalContainer}></Calendar>

            {openModal && modalContainer.current && createModal(ModalTypes.AddLeave, true, modalContainer.current, null, setOpenModal)}
            
          </div>
        </div>

      </Layout>
      
    
  );
}
