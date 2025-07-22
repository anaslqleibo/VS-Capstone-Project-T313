import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import getStatusColor, { Status } from "./utils/getStatusColor";
import { createModal, getModalTypesByStatus, ModalDetailsProps, ModalLeaveDetailsProps, ModalTypes, ModalUnavailDetailsProps } from "./Modal";
import { createRoot } from "react-dom/client";
import { RefObject } from "react";
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
    showStatus?: string;
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

function filterEventsArray(events: EventProps[], showStatus : string){
    if (showStatus === "All") return events;
    else return events.filter(e => e.status === showStatus);
}

export function Calendar({initialView = "dayGridMonth", selectable = true, events, showStatus, modalContainer, ...props} : CalendarProps){
    const newEvents = constructEventsArray(showStatus ? filterEventsArray(events, showStatus) : events);
    return (
    <>
    
    
    <FullCalendar
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
            parentDiv.className = 'p-2 rounded shadow-md/20';

            lines.forEach(line => {
                const lineDiv = document.createElement('div');

                if (arg.event.extendedProps.details){
                    lineDiv.addEventListener('click', function(){
                        // onClicks?.at(index);

                        if (modalContainer.current) {
                            if (props.rootRef && !props.rootRef.current)
                                props.rootRef.current = createRoot(modalContainer.current);
                            
                            props.rootRef?.current?.render(createModal(getModalTypesByStatus(arg.event.extendedProps.status), true, modalContainer.current, arg.event.extendedProps.details));
                        }
                    
                    });
                }

                lineDiv.textContent = line;
                lineDiv.className = "text-xs font-semibold font-[Inter]" // TODO: Change font to use global font
                parentDiv.appendChild(lineDiv);
            });
            
            return { domNodes: [parentDiv] };
          }}

          eventDidMount={(info) => {
            info.el.classList.add('mb-2'); // adds gap between events
            }}
        />
    </>
    
    );
}