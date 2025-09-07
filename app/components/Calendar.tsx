"use client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import rrulePlugin from '@fullcalendar/rrule';
import getStatusColor, { Status } from "./utils/getStatusColor";
import { createModal, ShiftExtendedProps, getModalTypesByStatus, setEventType, LeaveExtendedProps, EventTypes} from "./Modal";
import { createRoot } from "react-dom/client";
import { RefObject, useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import listPlugin from '@fullcalendar/list';
import { EventInput } from "@fullcalendar/core";
import './Calendar.css'
import Toast from "./Toast";
import { buildShiftEventTitle } from "../controllers/Shifts";
import { Role } from "../controllers/User";
import { useAuth } from "@/app/contexts/AuthContext";


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
    const { status, type, assignee_id, assignee_name, date, start_time, end_time, time, location_id, location_name, address, notes, repeat} = e.extendedProps || {};

    const shiftExtProps : ShiftExtendedProps = {
        id: e.id,
        assignee_id,
        assignee_name,
        status,
        type,
        date,
        start_time,
        end_time,
        time,
        location_id,
        location_name,
        address,
        notes,
        day:repeat,
        recurrence:repeat
    }
    
    const event: EventInput = {
        id: crypto.randomUUID(),
        title: role==="admin" ? buildShiftEventTitle(status, time, location_name, assignee_name, type) : buildShiftEventTitle(status, time, location_name, undefined, type),
        start: date + 'T' + start_time,
        end: e.end ? e.end : date + 'T' + end_time,
        allDay: e.allDay ?? false,
        daysOfWeek: e.daysOfWeek ?? undefined,
        startRecur: e.startRecur ?? undefined,
        endRecur: e.endRecur ?? undefined,
        rrule: e.rrule ?? undefined,
        backgroundColor: getStatusColor(type === "leave" && status === Status.Accepted ? Status.Leave : status),
        display: 'block',
        textColor: e.textColor ?? "#FFFFFF",
        extendedProps: shiftExtProps
    };

    newEvents.push(event);
  });

  return newEvents;
}

function filterEventsArray(events: EventInput[], showSelectedFilter: CalendarFilter | AdminCalendarFilter) {
  return events.filter(e => {
    const { status, location_name, assignee_name } = e.extendedProps || {};
    
    const matchStatus = showSelectedFilter.status.includes("All shifts") ||
      showSelectedFilter.status.includes(status);
    const matchLocation = showSelectedFilter.location.includes("All locations") || showSelectedFilter.location.includes(location_name);

    if (((showSelectedFilter as AdminCalendarFilter).employee)){
        const filter = (showSelectedFilter as AdminCalendarFilter);
        const matchEmployee = filter.employee.includes("All employees") ||
        filter.employee.includes(assignee_name);
        return matchStatus && matchLocation && matchEmployee;
    }
    return matchStatus && matchLocation;
  });
}

export function Calendar({initialView = "dayGridMonth", selectable = true, events, showSelectedFilter, modalContainer, hideHeader=false, ...props} : CalendarProps){
    const role : Role = useAuth().user?.role || 'user';

    const initialEvents = useMemo(() => constructEventsArray(events, role), [events, role]);

    const [originalEvents, setOriginalEvents] = useState<EventInput[]>(initialEvents);
    
    const [newEvents, setEvents] = useState<EventInput[]>(initialEvents);

    useEffect(() => {
        if (events) {
            const constructed = constructEventsArray(events, role);
            setOriginalEvents(constructed);
            setEvents(constructed);
        }
    }, [events, role]);

    const updateEvent: setEventType = (event, mode="update") => {
        if (mode==='create'){
            setOriginalEvents(prev => [event, ...prev]);
            setEvents(prev => [event, ...prev]);
        
        }
        else if (mode==='delete'){
            setOriginalEvents(prev => prev.filter(e => e.id !== event.id ));
            setEvents(prev => prev.filter(e => e.id !== event.id ));
        }
        else if (mode==='updateDate'){
            if (event.extendedProps){
                const start = event.extendedProps.date+'T'+event.extendedProps.start_time;
                const end = event.extendedProps.date+'T'+event.extendedProps.end_time;

                setOriginalEvents(prev =>
                    prev.map(e => e.id === event.id ? {...event, start: start?start:event.start, end: end?end:event.end} : e)
                );
                setEvents(prev =>
                    prev.map(e => e.id === event.id ? {...event, start: start?start:event.start, end: end?end:event.end} : e)
                );
            }
            
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
        details?: ShiftExtendedProps | LeaveExtendedProps;
        event?: EventInput;
    }>({ isOpen: false, status: Status.Accepted, details: undefined});

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
        plugins={[dayGridPlugin, interactionPlugin, listPlugin, rrulePlugin]}
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
            parentDiv.addEventListener('click', function(){
                // onClicks?.at(index);
                const {id, status} = arg.event.extendedProps;
                const activeEvent = newEvents.find( event => String(event.extendedProps?.id) === String(id));
                
                setActiveModal({
                    isOpen: true,
                    status,
                    details: arg.event.extendedProps as ShiftExtendedProps,
                    event: activeEvent,
                });
            });
                
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
            }
            const calendarEl = document.querySelector('.fc-media-screen');
            if (calendarEl) calendarEl.classList.add("flex-1")

            const calendarEl2 = document.querySelector('.fc-view-harness');
            if (calendarEl2) calendarEl2.classList.add("flex-1")
            }
        }

            
        />

        {activeModal.isOpen && modalContainer.current && createModal(getModalTypesByStatus(activeModal.status, activeModal.details?.type as EventTypes),true,modalContainer.current,activeModal.details, setOpen, updateEvent, activeModal.event, displayToast)}

    </>
    );
}