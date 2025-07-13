import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

export interface EventProps{
    status: string;
    time: string;
    employee: string;
    date: string;
    color: string;
}

interface CalendarProps{
    initialView ?: string; // TODO: should specify enum
    selectable ?: boolean;
    events: EventProps[];
}

function constructEventsArray(events: EventProps[]){
    const newEvents:any = [];
    events.forEach(e => {
        const event = {title: e.status+"\n"+e.time+"\n"+e.employee, date: e.date, color: e.color};
        newEvents.push(event);
    });
   return newEvents;
}

export function Calendar({initialView = "dayGridMonth", selectable = true, events} : CalendarProps){
    const newEvents = constructEventsArray(events);
    return (
    <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
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