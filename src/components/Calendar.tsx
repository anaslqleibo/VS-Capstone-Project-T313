import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import getStatusColor, { Status } from "./utils/getStatusColor";
import Modal, { createModal, DetailsPropsList, getModalTypesByStatus, ModalDetailsProps, ModalLeaveDetailsProps, ModalPortal, ModalTypes, ModalUnavailDetailsProps } from "./Modal";
import { createRoot } from "react-dom/client";
import { RefObject, useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
// import listPlugin from '@fullcalendar/list';

export interface EventProps{
    status: Status;
    time: string;
    location: string;
    date: string;
    details?: ModalUnavailDetailsProps|ModalLeaveDetailsProps|ModalDetailsProps; 
}

export interface CalendarFilter{
    location: string[];
    status: string[];
    month: dayjs.Dayjs;
}

interface CalendarProps{
    initialView ?: string; // TODO: should specify enum
    selectable ?: boolean;
    events: EventProps[];
    showSelectedFilter?: CalendarFilter;
    modalContainer: React.RefObject<HTMLDivElement|null>;
    rootRef ?: RefObject<ReturnType<typeof createRoot> | null>;
    // onClicks ?: ((...e:any) => void)[];
}

function constructEventsArray(events: EventProps[]){
    const newEvents:any = [];
    events.forEach(e => {
        const event = {title: e.status+" shift"+"\n"+e.time+(e.location?"\n"+e.location:""), date: e.date, color: getStatusColor(e.status), status:e.status, details: e.details};
        newEvents.push(event);
    });
   return newEvents;
}

function filterEventsArray(events: EventProps[], showSelectedFilter : CalendarFilter){
    if (showSelectedFilter.status.includes("All shifts") && showSelectedFilter.location.includes('All locations')) return events;
    else {
        return events.filter(e => ((showSelectedFilter.status.includes(e.status) || showSelectedFilter.status.includes("All shifts")) && (showSelectedFilter.location.includes(e.location) || showSelectedFilter.location.includes("All locations"))))};
}

export function Calendar({initialView = "dayGridMonth", selectable = true, events, showSelectedFilter, modalContainer, ...props} : CalendarProps){
    const newEvents = constructEventsArray(showSelectedFilter ? filterEventsArray(events, showSelectedFilter) : events);

    const [activeModal, setActiveModal] = useState<{
        isOpen: boolean;
        status: Status;
        details: DetailsPropsList;
    }>({ isOpen: false, status: Status.Accepted, details: null });

    const setOpen = (val:boolean) => setActiveModal(prev => ({...prev, isOpen: val}));
    const calendarRef = useRef<FullCalendar>(null);

    
    useEffect(()=>{
        if (showSelectedFilter) calendarRef.current?.getApi().gotoDate(showSelectedFilter?.month.format('YYYY-MM-DD'));        
    }, [showSelectedFilter?.month]);

    return (
    <>
    <FullCalendar
        ref={calendarRef}
        height="100%"
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView={initialView}
        selectable={true}
        events={newEvents}
        headerToolbar={{
        left: '',     
        center: '',
        right: '' 
        }}
        eventContent={(arg) => {
            const lines = arg.event.title.split('\n');
            const parentDiv = document.createElement('div');
            parentDiv.className = 'rounded-full w-full h-5 shadow-md/20 md:p-2 md:rounded md:size-full';

            lines.forEach(line => {
                const lineDiv = document.createElement('div');

                lineDiv.textContent = line;
                lineDiv.className = "text-xs font-semibold font-[Inter] hidden md:block" // TODO: Change font to use global font
                parentDiv.appendChild(lineDiv);
            });

    
            if (arg.event.extendedProps.details){
                parentDiv.addEventListener('click', function(){
                    // onClicks?.at(index);
                    const {status, details} = arg.event.extendedProps;
                    setActiveModal({
                        isOpen: true,
                        status,
                        details
                    });
                });
            }
            
            return { domNodes: [parentDiv] };
          }}

        eventDidMount={(info) => {info.el.classList.add('mb-2'); }}
        />

        {activeModal.isOpen && modalContainer.current && createModal(getModalTypesByStatus(activeModal.status),true,modalContainer.current,activeModal.details, setOpen)}

    </>
    );
}