import { EventInput } from '@fullcalendar/core';
import getStatusColor, { stringToStatus } from '../components/utils/getStatusColor';

export type ShiftStatus = 'Pending' | 'Unassigned' | 'Accepted' | 'Open' | 'Request' | 'Declined';

export type Shift = {
  id?: string; // Optional since it's probably auto-increment in DB
  assignee_id: string; // Changed from user_id to match your database
  status: ShiftStatus;
  date: string;
  start_time: string; // Changed from start to match your database
  end_time: string;   // Changed from end to match your database
  notes: string;
  location: string;   // Changed from location_id to match your database
  address: string;
  // Remove employee field if it's not in your database table
  // employee: string;
};

export async function fetchShifts(all: boolean, user_id: number) {
  const id = all ? -1 : user_id;
  const res = await fetch(`/api/shifts/${id}`);

  if (!res.ok) {
    throw new Error('Failed to fetch shifts');
  }

  return (await res.json()) as Shift[];
}

export async function createShift(shift: Shift) {
  const res = await fetch('/api/shifts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(shift),
  });

  if (!res.ok) {
    throw new Error('Failed to create shift');
  }

  return await res.json();
}

export async function updateShift(shift: Shift) {
  try {
    const res = await fetch(`/api/shifts/${shift.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shift),
    });

    return res.ok;
  } catch (err) {
    console.error('Failed to update shift', err);
    return false;
  }
}

export async function updateShiftStatus(shiftId: string, user_id: string, status: ShiftStatus) {
  try {
    const res = await fetch(`/api/shifts/${shiftId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, status }),
    });

    return res.ok;
  } catch (err) {
    console.error('Failed to update shift status:', err);
    return false;
  }
}

export async function deleteShift(shiftId: string, userUID: string) {
  try {
    const res = await fetch(`/api/shifts/${shiftId}-${userUID}`, {
      method: 'DELETE',
    });

    return res.ok;
  } catch (err) {
    console.error('Failed to delete shift', err);
    return false;
  }
}

export function getEventInputShifts(isAdmin: boolean, user_id: number) {
  return fetchShifts(isAdmin, user_id).then((shifts) =>
    shifts.map((shift) => ({
      id: shift.id,
      user_id: shift.assignee_id, // Updated to use assignee_id
      start: shift.date,
      extendedProps: {
        status: shift.status,
        date: shift.date.split('T')[0],
        start: shift.start_time.slice(0, 5), // Updated to use start_time
        end: shift.end_time.slice(0, 5),     // Updated to use end_time
        time: `${shift.start_time.slice(0, 5)}–${shift.end_time.slice(0, 5)}`,
        location: shift.location,           // Updated to use location
        address: shift.address,
        notes: shift.notes,
        // employee field removed since it's not in the database
      },
      color: getStatusColor(stringToStatus(shift.status)),
    } as EventInput))
  );
}

export function buildShiftEvent(date: string, timeRange: string, otherProps: Partial<EventInput> = {}) {
  const [startTime, endTime] = timeRange.split('–');
  return {
    start: new Date(`${date}T${startTime}`),
    end: new Date(`${date}T${endTime}`),
    ...otherProps,
  };
}

export function buildShiftEventTitle(status: string, time: string, location: string, employee?: string) {
  return `${status} ${(status === 'Leave' || status === 'Unavailable') ? '' : 'shift'}${employee ? `\n${employee}` : ''}${time ? `\n${time}` : ''}${location ? `\n${location}` : ''}`;
}