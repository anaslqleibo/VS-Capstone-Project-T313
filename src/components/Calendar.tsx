import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import getStatusColor, { Status } from "./utils/getStatusColor";
import Modal, { createModal, DetailsPropsList, getModalTypesByStatus, ModalDetailsProps, ModalLeaveDetailsProps, ModalPortal, ModalTypes, ModalUnavailDetailsProps } from "./Modal";
import { createRoot } from "react-dom/client";
import { RefObject, useState } from "react";
// import listPlugin from '@fullcalendar/list';

export interface EventProps{
    status: Status;
    time: string;
    location?: string;
    date: string;
    details?: ModalUnavailDetailsProps|ModalLeaveDetailsProps|ModalDetailsProps; 
}

interface CalendarProps{
    initialView ?: string; // TODO: should specify enum
    selectable ?: boolean;
    events: EventProps[];
    showStatus?: string[];
    modalContainer: React.RefObject<HTMLDivElement|null>;
    rootRef ?: RefObject<ReturnType<typeof createRoot> | null>;
    // onClicks ?: ((...e:any) => void)[];
}

function constructEventsArray(events: EventProps[]){
    const newEvents:any = [];
    events.forEach(e => {
        const event = {title: e.status+" shift"+"\n"+e.time+(e.location===undefined?"":"\n"+e.location), date: e.date, color: getStatusColor(e.status), status:e.status, details: e.details};
        newEvents.push(event);
    });
   return newEvents;
}

function filterEventsArray(events: EventProps[], showStatus : string[]){
    if (showStatus.includes("All")) return events;
    else return events.filter(e => showStatus.includes(e.status));
}

export function Calendar({initialView = "dayGridMonth", selectable = true, events, showStatus, modalContainer, ...props} : CalendarProps){
    const newEvents = constructEventsArray(showStatus ? filterEventsArray(events, showStatus) : events);

    const [activeModal, setActiveModal] = useState<{
        isOpen: boolean;
        status: Status;
        details: DetailsPropsList;
    }>({ isOpen: false, status: Status.Accepted, details: null });

    const setOpen = (val:boolean) => setActiveModal(prev => ({...prev, isOpen: val}));

    return (
    <>
    <FullCalendar
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