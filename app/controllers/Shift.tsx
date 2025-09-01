import { EventInput } from '@fullcalendar/core'
import getStatusColor, { Status, stringToStatus } from '../components/utils/getStatusColor';

export type ShiftStatus = 'Pending' | 'Unassigned' | 'Accepted' | 'Open' | 'Request' | 'Declined';

export type Shift = {
  id: string;
  user_id?: string;
  status: ShiftStatus
  date: string;
  start: string;
  end: string;
  notes: string;
  location_id: number;
  location: string;
  address: string;
  employee: string;
}

export function getEventInputShifts(isAdmin: boolean, user_id: number){
  const shifts = fetchShifts(isAdmin, user_id).then((shifts) => {
    return shifts.map((shift) => ({
      id: shift.id,
      user_id: shift.user_id,
      start: shift.date,
      extendedProps: {
        status: shift.status,
        date: shift.date.split('T')[0],
        start: shift.start.slice(0, 5),
        end: shift.end.slice(0, 5),
        time: `${shift.start.slice(0, 5)}–${shift.end.slice(0, 5)}`,
        location_id: shift.location_id,
        location: shift.location,
        address: shift.address,
        notes: shift.notes,
        employee: shift.employee
      },
      color: getStatusColor(stringToStatus(shift.status)),
    } as EventInput));
  });
  return shifts;
}


export async function fetchShifts(all:boolean, user_id: number) {
  let id = user_id;
  if (all) id = -1;
  const res = await fetch(`/api/shifts/${id}`);

  if (!res.ok) {
    throw new Error('Failed to fetch shifts');
  }
  const data = await res.json();
  return data as Shift[];
}

async function createShift(shift: Shift) {
  const res = await fetch('/api/shifts', {
    method: 'POST',
    body: JSON.stringify(shift),
  });
  if (!res.ok) {
    throw new Error('Failed to create shift');
  }
  const data = await res.json();
  return data
}

export async function updateShift(shift: Shift) {
  try {
    const res = await fetch(`/api/shifts/${shift.id}`, {
      method: 'PUT',
      body: JSON.stringify(shift),
    });

    return res.ok;
  } catch (err) {
    console.error("Failed to update shift", err);
    return false;
  }
}

export async function updateShiftStatus(shiftId: string, user_id: string, status: ShiftStatus) {
  try {
    const res = await fetch(`/api/shifts/${shiftId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ user_id, status }),
    });

    return res.ok;
  } catch (err) {
    console.error("Failed to update shift status:", err);
    return false;
  }
}

export async function deleteShift(shiftId: string, userUID: string) {
  try{
    const res = await fetch(`/api/shifts/${shiftId}-${userUID}`, {
      method: 'DELETE',
    });

    return res.ok;
  }
  catch (err) {
    console.error("Failed to delete shift", err);
    return false;
  }
  
}

export function buildShiftEvent(date: string, timeRange: string, otherProps: Partial<EventInput> = {}) {
  const [startTime, endTime] = timeRange.split('–');
  const start = new Date(`${date}T${startTime}`);
  const end = new Date(`${date}T${endTime}`);

   return {
    start,
    end,
    ...otherProps,
  };
}

export function buildShiftEventTitle(status: string, time: string, location: string, employee?: string){
  return `${status} ${(status==="Leave") || (status==="Unavailable") ? "" : "shift"}${employee ? `\n${employee}` : ''}${time ? `\n${time}` : ''}${location ? `\n${location}` : ''}` 
}