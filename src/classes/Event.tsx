import { EventInput } from '@fullcalendar/core'


export function buildEvent(date: string, timeRange: string, otherProps: Partial<EventInput> = {}) {
  const [startTime, endTime] = timeRange.split('–');
  const start = new Date(`${date}T${startTime}`);
  const end = new Date(`${date}T${endTime}`);

   return {
    start,
    end,
    ...otherProps,
  };
}

export function buildEventTitle(status: string, time: string, location: string, employee?: string){
  return `${status} ${status==="Leave" ? "" : "shift"}${employee ? `\n${employee}` : ''}${time ? `\n${time}` : ''}${location ? `\n${location}` : ''}` 
}