import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import getStatusColor, { Status } from "./utils/getStatusColor";
// import listPlugin from '@fullcalendar/list';

export interface EventProps{
    status: Status;
    time: string;
    employee: string;
    date: string;
}

interface CalendarProps{
    initialView ?: string; // TODO: should specify enum
    selectable ?: boolean;
    events: EventProps[];
    showStatus?: string;
}

function constructEventsArray(events: EventProps[]){
    const newEvents:any = [];
    events.forEach(e => {
        const event = {title: e.status+" shift"+"\n"+e.time+"\n"+e.employee, date: e.date, color: getStatusColor(e.status)};
        newEvents.push(event);
    });
   return newEvents;
}

function filterEventsArray(events: EventProps[], showStatus : string){
    if (showStatus === "All") return events;
    else return events.filter(e => e.status === showStatus);
}

export function Calendar({initialView = "dayGridMonth", selectable = true, events, showStatus, ...props} : CalendarProps){
    const newEvents = constructEventsArray(showStatus ? filterEventsArray(events, showStatus) : events);
    return (
    <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView={initialView}
          selectable={true}
          events={newEvents}
          eventContent={(arg) => {
            const lines = arg.event.title.split('\n');
            const parentDiv = document.createElement('div');
            parentDiv.className = 'p-2 rounded shadow-md/20';

            lines.forEach(line => {
                const lineDiv = document.createElement('div');
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
    );
}