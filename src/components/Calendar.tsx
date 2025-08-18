import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import getStatusColor, { Status } from "./utils/getStatusColor";
import { createModal, DetailsPropsList, getModalTypesByStatus, DetailsExtProps, LeaveExtProps, UnavailExtProps } from "./Modal";
import { createRoot } from "react-dom/client";
import { RefObject, useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import listPlugin from '@fullcalendar/list';
import { EventInput } from "@fullcalendar/core";
import './Calendar.css'
import Toast from "./Toast";
import { buildEventTitle } from "../classes/Event";
import { useRole } from "./RoleContext";
import { Role } from "../classes/User";

// export interface EventProps{
//     status: Status;
//     time: string;
//     location: string;
//     date: string;
//     details?: ModalUnavailDetailsProps|ModalLeaveDetailsProps|ModalDetailsProps; 
// }

export interface CalendarFilter{
    location: string[];
    status: string[];
    month: dayjs.Dayjs;
}

export interface AdminCalendarFilter{
    location: string[];
    status: string[];
    month: dayjs.Dayjs;
    employee: string[];
}

interface CalendarProps{
    initialView ?: 'dayGridMonth' | 'listMonth'; // TODO: should specify enum
    selectable ?: boolean;
    events: EventInput[];
    showSelectedFilter?: CalendarFilter | AdminCalendarFilter;
    modalContainer: React.RefObject<HTMLDivElement|null>;
    rootRef ?: RefObject<ReturnType<typeof createRoot> | null>;
    hideHeader?: boolean;
    // onClicks ?: ((...e:any) => void)[];
}

function constructEventsArray(events: EventInput[], role: Role) {
  const newEvents: EventInput[] = [];
  
  events.forEach(e => {
    const { status, date, time, location, employee, address, notes, repeat} = e.extendedProps || {};

    const [startTime, endTime] = (time || '00:00–23:59').split("–");
    const start = `${e.start}T${startTime}`;
    const end = `${e.start}T${endTime}`;

    let details = {};
    if (status === Status.Unavailable){
      
        details = {day:"Monday", date, time, repeat}
    }
    else{
        details = {status, employee, date, time, location, address, notes};
    }

    const event: EventInput = {
        id: crypto.randomUUID(),
        title: role===Role.Admin ? buildEventTitle(status, time, location, employee) : buildEventTitle(status, time, location),
        start,
        end,
        allDay: e.allDay ?? false,
        backgroundColor: getStatusColor(status),
        display: 'block',
        textColor: "#FFFFFF",
        extendedProps: {
            status,
            time,
            location,
            employee,
            details,
        }
    };

    newEvents.push(event);
  });

  return newEvents;
}

function filterEventsArray(events: EventInput[], showSelectedFilter: CalendarFilter | AdminCalendarFilter) {
  return events.filter(e => {
    const { status, location, employee } = e.extendedProps || {};
    const matchStatus = showSelectedFilter.status.includes("All shifts") ||
      showSelectedFilter.status.includes(status);
    const matchLocation = showSelectedFilter.location.includes("All locations") ||
      showSelectedFilter.location.includes(location);

    if (((showSelectedFilter as AdminCalendarFilter).employee)){
        const filter = (showSelectedFilter as AdminCalendarFilter);
        const matchEmployee = filter.employee.includes("All employees") ||
        filter.employee.includes(employee);
        return matchStatus && matchLocation && matchEmployee;
    }
    return matchStatus && matchLocation;
  });
}

export function Calendar({initialView = "dayGridMonth", selectable = true, events, showSelectedFilter, modalContainer, hideHeader=false, ...props} : CalendarProps){
    const role = useRole();
    const initialEvents = useMemo(() => constructEventsArray(events, role), [events]);
    
    const [originalEvents, setOriginalEvents] = useState<EventInput[]>(initialEvents);
    const [newEvents, setEvents] = useState<EventInput[]>(initialEvents);

    function updateEvent(event: EventInput, mode:"create"|"update"|"delete"="update") {
        if (mode==='create'){
            setOriginalEvents(prev => [event, ...prev]);
            setEvents(prev => [event, ...prev]);
        
        }
        else if (mode==='delete'){
            setOriginalEvents(prev => prev.filter(e => e.id !== event.id ));
            setEvents(prev => prev.filter(e => e.id !== event.id ));
        }
        else{
            setOriginalEvents(prev =>
                prev.map(e => e.id === event.id ? event : e)
            );
            setEvents(prev =>
                prev.map(e => e.id === event.id ? event : e)
            );
        }
        
    }

    const [activeModal, setActiveModal] = useState<{
        isOpen: boolean;
        status: Status;
        details: DetailsPropsList;
        event?: EventInput;
    }>({ isOpen: false, status: Status.Accepted, details: null});

    const setOpen = (val:boolean) => setActiveModal(prev => ({...prev, isOpen: val}));
    const calendarRef = useRef<FullCalendar>(null);
 
    useEffect(()=>{
        if (showSelectedFilter) {
            calendarRef.current?.getApi().gotoDate(showSelectedFilter?.month.format('YYYY-MM-DD'));   

            
            setEvents(filterEventsArray(originalEvents, showSelectedFilter));
        }     
        else setEvents(originalEvents);
    }, [showSelectedFilter]);



    const [showToast, setToastShown] = useState(false);
    const [message, setMessage] = useState("");
    const [toastType, setToastType] = useState<"success"|"error">("success");

    const displayToast = (message: string, toastType: "success"|"error") => {
        setMessage(message);
        setToastType(toastType);
        setToastShown(true);
    }

    return (
    <>
    <Toast message={message} type={toastType} shown={showToast} setShown={setToastShown}/>

    <FullCalendar
        ref={calendarRef}
        height="100%"
        plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
        initialView={initialView}
        selectable={true}
        events={newEvents}
        headerToolbar={{
        left: '',     
        center: '',
        right: '' 
        }}
        allDayText="All day"
        eventContent={(arg) => {
            const lines = arg.event.title.split('\n');
            const parentDiv = document.createElement('div');
            parentDiv.className =  `w-full rounded md:size-full h-full flex items-stretch`;

            const statusColor = getStatusColor(arg.event.extendedProps.status, false);
            parentDiv.style.boxShadow = `0 4px 6px -1px rgba(${statusColor}, 0.2), 0 2px 4px -2px rgba(${statusColor}, 0.2)`;

            if (initialView === 'listMonth'){
                const statusIndicator = document.createElement('div');
                statusIndicator.className = "w-4 rounded-l";
                statusIndicator.style.backgroundColor = getStatusColor(arg.event.extendedProps.status);

                parentDiv.appendChild(statusIndicator);
            }
            

            const eventContainer = document.createElement('div');
            eventContainer.className = "pl-4 md:pl-2 p-2"

            lines.forEach(line => {
                const lineDiv = document.createElement('div');

                lineDiv.textContent = line;
                lineDiv.className = "text-xs text-wrap first:font-bold"
                eventContainer.appendChild(lineDiv);
            });

            
            parentDiv.appendChild(eventContainer);

    
            if (arg.event.extendedProps.details){
                parentDiv.addEventListener('click', function(){

    
                    // onClicks?.at(index);
                    const activeEvent = newEvents.find((event)=> event.id === arg.event.id)
                    const {status, details} = arg.event.extendedProps;
                    setActiveModal({
                        isOpen: true,
                        status,
                        details,
                        event: activeEvent,
                    });
                });
            }
            
            return { domNodes: [parentDiv] };
          }}

        eventDidMount={(info) => {
            info.el.classList.add('mb-2');

            const dot = document.querySelector('.fc-list-event-dot');
            if (dot) {
                dot.className= "hidden";
            }        
        }}

        // Hides the fullcalendar header toolbar
        viewDidMount={() => {
            if (hideHeader){
                const calendarEl = document.querySelector('.fc-header-toolbar');
                if (calendarEl) {
                    calendarEl.className= "hidden";
                }
            }}
        }
            
        />

        {activeModal.isOpen && modalContainer.current && createModal(getModalTypesByStatus(activeModal.status),true,modalContainer.current,activeModal.details, setOpen, updateEvent, activeModal.event, displayToast)}

    </>
    );
}