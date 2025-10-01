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
import { v4 as uuidv4 } from 'uuid';


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
    show_unpublished: boolean;
}

interface CalendarProps{
    initialView ?: 'dayGridMonth' | 'listMonth'; // TODO: should specify enum
    selectable ?: boolean;
    events: EventInput[];
    showSelectedFilter?: CalendarFilter | AdminCalendarFilter;
    modalContainer: React.RefObject<HTMLDivElement|null>;
    rootRef ?: RefObject<ReturnType<typeof createRoot> | null>;
    hideHeader?: boolean;
    updateEventData?:(event:EventInput, mode:string)=>void;
    setColHeights?: (e:number[])=>void;
    setWeeklyPay?: (e:weeklyPayType[])=>void;
    // onClicks ?: ((...e:any) => void)[];
}

export type weeklyPayType = {total: number, assignees: {name?: string, total_pay?:number, duration?:number}[]};

function constructEventsArray(events: EventInput[], role: Role) {
  const newEvents: EventInput[] = [];
  
  events.forEach(e => {
    const {id, status, original_status, type, assignee_id, assignee_name, date, start_time, end_time, time, location_id, location_name, address, notes, repeat, published, total_payment} = e.extendedProps || {};

    const shiftExtProps : ShiftExtendedProps = {
        id: id,
        assignee_id,
        assignee_name,
        status,
        original_status,
        type,
        date,
        start_time,
        end_time,
        time,
        location_id,
        location_name,
        address,
        notes,
        published,
        total_payment,
        day:repeat,
        recurrence:repeat
    }
    
    const event: EventInput = {
        id: uuidv4(),
        title: role==="admin" ? buildShiftEventTitle(status, time, location_name, assignee_name, type) : buildShiftEventTitle(status, time, location_name, undefined, type),
        start: date + 'T' + start_time,
        end: e.end ? e.end : date + 'T' + end_time,
        allDay: e.allDay ?? false,
        daysOfWeek: e.daysOfWeek ?? undefined,
        startRecur: e.startRecur ?? undefined,
        endRecur: e.endRecur ?? undefined,
        rrule: e.rrule ?? undefined,
        backgroundColor: getStatusColor(type === "leave" && status === Status.Accepted ? Status.Leave : (!published && type=="shift" ?  Status.Unpublished :  status)),
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
        const { type, location_name, assignee_name, published, original_status} = e.extendedProps || {};
        
        const matchStatus = showSelectedFilter.status.includes("All shifts") ||
        showSelectedFilter.status.includes(type==='leave'?'Leave':original_status);

        const matchLocation = showSelectedFilter.location.includes("All locations") || showSelectedFilter.location.includes(location_name);

        if (((showSelectedFilter as AdminCalendarFilter).employee)){
            const filter = (showSelectedFilter as AdminCalendarFilter);
            const matchEmployee = filter.employee.includes("All employees") ||
            filter.employee.includes(assignee_name);

            const matchUnpublished = !filter.show_unpublished ? published === 1 : true;
            return matchStatus && matchLocation && matchEmployee && matchUnpublished;
        }
        
        return matchStatus && matchLocation;
    });
}

export function Calendar({initialView = "dayGridMonth", selectable = true, events, showSelectedFilter, modalContainer, hideHeader=false, updateEventData, setWeeklyPay, ...props} : CalendarProps){
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
        let updatedEvent = event;

        if (mode==='create'){
            setOriginalEvents(prev => [event, ...prev]);
            setEvents(prev => [event, ...prev]);
        }
        else if (mode==='delete'){
            setOriginalEvents(prev => prev.filter(e => e.id !== event.id ));
            setEvents(prev => prev.filter(e => e.id !== event.id ));
        }
        else 
            if (event.extendedProps){
                const start = event.extendedProps.date+'T'+event.extendedProps.start_time;
                const end = event.extendedProps.date+'T'+event.extendedProps.end_time;
                
                updatedEvent = {...event, start: start?start:event.start, end: end?end:event.end};

                setOriginalEvents(prev =>
                    prev.map(e => e.id === event.id ? {...event, start: start?start:event.start, end: end?end:event.end} : e)
                );
                setEvents(prev =>
                    prev.map(e => e.id === event.id ? {...event, start: start?start:event.start, end: end?end:event.end} : e)
                );
            }
            
        
        updateEventData?.(updatedEvent, mode);
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

        props.setColHeights&&syncHeights();
    }, [showSelectedFilter]);


    const [showToast, setToastShown] = useState(false);
    const [message, setMessage] = useState("");
    const [toastType, setToastType] = useState<"success"|"error">("success");

    const displayToast = (message: string, toastType: "success"|"error") => {
        setMessage(message);
        setToastType(toastType);
        setToastShown(true);
    }

    const syncHeights = () => {
        setTimeout(()=>{
            requestAnimationFrame(() => {
                const tbody = document.querySelector('tbody[role="presentation"]');
                    const trows = Array.from(tbody?.children ?? []);
                    const res = trows.map(row => (row as HTMLElement).clientHeight);
                    props.setColHeights && props.setColHeights(res);
            });
        }, 200);   
    }

    const isAdmin = useAuth().user?.role==='admin';

    const [visibleRange, setVisibleRange] = useState<{start: string, end: string} | null>(null);
    useEffect(() => {
        if (!isAdmin || !visibleRange || !events?.length) return;

        const { start, end } = visibleRange;
        const diff = dayjs(end).diff(start, 'day');
        // console.log(start, end);


        let show_unpublished = false;
        if ((showSelectedFilter as AdminCalendarFilter).employee){
            show_unpublished = (showSelectedFilter as AdminCalendarFilter).show_unpublished;
        }

        const shifts = events.filter(e=>e.extendedProps?.type==='shift'&&(!show_unpublished?e.extendedProps?.published===1:true)).map((e) => {
            const { start_time, end_time, total_payment, assignee_name } = e.extendedProps as ShiftExtendedProps;

            let duration = 0;
            if (start_time && end_time) {
                const start = dayjs(start_time, "HH:mm");
                const end = dayjs(end_time, "HH:mm");
                duration = end.diff(start, "minute");
            }

            return {
                start: e.start,
                total_payment,
                assignee: assignee_name,
                duration,
            };
            }).toSorted((a, b) => {
                if (!a.start && !b.start) return 0;
                if (!a.start) return 1;
                if (!b.start) return -1;
                return a.start.toLocaleString().localeCompare(b.start.toLocaleString());
            });


        const weeks = [];
        let lastShiftIndex=0;

        for (let i=0; i<(diff/7); i++){
            const startFrom = dayjs(start).add(i*7,'day');

            const rangeStart = startFrom;
            const rangeEnd = startFrom.add(7, 'day');

            // console.log('start range:', rangeStart.format('YYYY-MM-DD'));
            // console.log('end range:', rangeEnd.format('YYYY-MM-DD'));
            const weeklyPayDetails:weeklyPayType = {total: 0, assignees: []};

            for (let j=lastShiftIndex; j < shifts.length; j++){
                // console.log(shifts[j].start);

                if ((dayjs(shifts[j].start?.toLocaleString()).isAfter(rangeStart, 'day') && dayjs(shifts[j].start?.toLocaleString()).isBefore(rangeEnd, 'day')) || dayjs(shifts[j].start?.toLocaleString()).isSame(rangeStart, 'day')){
                    const assigneeIdx = weeklyPayDetails.assignees.findIndex(u=>u.name===shifts[j].assignee)

                    const totalRounded = Math.round((shifts[j].total_payment??0)*100)/100;
                    if (assigneeIdx !== -1 && weeklyPayDetails.assignees[assigneeIdx].total_pay && weeklyPayDetails.assignees[assigneeIdx].duration)
                    {
                        weeklyPayDetails.assignees[assigneeIdx].total_pay += totalRounded;
                        weeklyPayDetails.assignees[assigneeIdx].duration += shifts[j].duration??0;
                    }
                    else {
                        weeklyPayDetails.assignees.push({name: shifts[j].assignee, total_pay: totalRounded, duration: shifts[j].duration});
                    }

                    weeklyPayDetails.total += totalRounded;
                }
                else if (dayjs(shifts[j].start?.toLocaleString()).isBefore(rangeStart, 'day')){
                    continue;
                }
                else{
                    lastShiftIndex=j;
                    break;
                }
            }
            weeks.push(weeklyPayDetails);
        }

        console.log(weeks);
        setWeeklyPay&&setWeeklyPay(weeks);

    },[isAdmin, events, visibleRange, showSelectedFilter]);

    return (
    <>
    <Toast message={message} type={toastType} shown={showToast} setShown={setToastShown}/>

    <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin, listPlugin, rrulePlugin]}
        initialView={initialView}
        displayEventTime={false}
        stickyHeaderDates={false}
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

            if (arg.event.extendedProps.status !== Status.Unpublished){
                const statusColor = getStatusColor(arg.event.extendedProps.status, false);
                parentDiv.style.boxShadow = `0 4px 6px 1px rgba(${statusColor}, 0.3)`;
            }
            

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
            
            if (props.setColHeights && info.view.calendar.getEvents().length === events.length) {
                syncHeights();
            }

        }}

        viewDidMount={() => {
            if (hideHeader){
                // Hides the fullcalendar header toolbar

                const calendarEl = document.querySelector('.fc-header-toolbar');
                if (calendarEl) {
                    calendarEl.className= "hidden";
                }
            }
            const calendarEl = document.querySelector('.fc-media-screen');
            if (calendarEl) calendarEl.classList.add("flex-1")

            const calendarEl2 = document.querySelector('.fc-view-harness');
            if (calendarEl2) calendarEl2.classList.add("flex-1")
        }}

        datesSet={(dateInfo)=>{
            setVisibleRange({
                start: dateInfo.startStr.split('T')[0],
                end: dateInfo.endStr.split('T')[0],
            });
        }}
        />

        {activeModal.isOpen && modalContainer.current && createModal(getModalTypesByStatus(activeModal.status, activeModal.details?.type as EventTypes),true,modalContainer.current,activeModal.details, setOpen, updateEvent, activeModal.event, displayToast)}

    </>
    );
}