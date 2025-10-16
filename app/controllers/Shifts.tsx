import { EventInput } from '@fullcalendar/core';
import getStatusColor, { Status, stringToStatus } from '../components/utils/getStatusColor';
import { ShiftExtendedProps } from '../components/Modal';

export type ShiftStatus =
  | 'Pending'
  | 'Assigned'
  | 'Unassigned'
  | 'Accepted'
  | 'Open'
  | 'Request'
  | 'Declined'
  | 'Unpublished';

export type Shift = {
  id?: string;
  assignee_id: string;
  status: ShiftStatus;
  date: string;
  start_time: string;
  end_time: string;
  notes: string;
  location_id: string;
  location_name: string;
  address: string;
  assignee_name ?: string;
  published ?: boolean;
  type?:string;
  pay_rate?:number;
  total_payment?:number;
  email_reason?: string;
};

export type ShiftAssignee = {
  id?: string;
  assignee_id: string;
};

export async function fetchShift(id: string) {
  const res = await fetch(`/api/shifts/shift/${id}`);

  if (!res.ok) {
    throw new Error('Failed to fetch the shift');
  }
  return (await res.json()) as Shift;
}

export async function fetchShiftExtProps(id: string) {
  return shiftToShiftExtProps(await fetchShift(id));
}

export async function fetchShifts(user_id: number, month='') {
  const res = await fetch(month?`/api/shifts/${user_id}/${month}`:`/api/shifts/${user_id}`);

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

export async function updateShift(shift: Shift | ShiftAssignee, assignee_changed = false) {
  try {
    const res = await fetch(`/api/shifts/${assignee_changed ? '1' : '0'}`, {
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

export async function updateShiftStatus(shift_id: string, status: ShiftStatus, assignee_id?: string) {
  try {
    const res = await fetch(`/api/shifts/shift/${shift_id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, assignee_id }),
    });

    const data = await res.json();

    if (!res.ok) {
      const message = data.error || `Request failed with status ${res.status}`;
      return { success: false, err: message };
    }

    return { success: true };
  } catch (err) {
    console.error('Failed to update shift status:', err);
    const message = err instanceof Error ? err.message : typeof err === 'string' ? err : '';
    return { success: false, err: message };
  }
}

export async function publishShift(shift_id: string) {
  try {
    const res = await fetch(`/api/shifts/shift/${shift_id}/publish`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    });

    return res.ok;
  } catch (err) {
    console.error('Failed to publish shift:', err);
    return false;
  }
}

export async function publishBulkShift(month?: string, year?: string) {
  try {
    const res = await fetch(`/api/shifts/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month, year }),
    });

    return res.ok;
  } catch (err) {
    console.error('Failed to publish shifts in bulk:', err);
    return false;
  }
}

export async function deleteShift(shift_id: string) {
  try {
    const res = await fetch(`/api/shifts/shift/${shift_id}`, {
      method: 'DELETE',
    });

    return res.ok;
  } catch (err) {
    console.error('Failed to delete shift', err);
    return false;
  }
}

/**
 * 🔁 Duplicate a shift by ID.
 * Backend should be implemented at: POST /api/shifts/shift/:id/duplicate
 * Returns { success: boolean, newShift?: Shift, err?: string }
 */
export async function duplicateShift(shift_id: string): Promise<{ success: boolean; newShift?: Shift; err?: string }> {
  try {
    const res = await fetch(`/api/shifts/shift/${shift_id}/duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, err: data?.error || `HTTP ${res.status}` };
    }

    const data = (await res.json()) as { success: true; newShift: Shift };
    return { success: true, newShift: data.newShift };
  } catch (err) {
    console.error('Failed to duplicate shift', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, err: message };
  }
}

export function getEventInputShifts(user_id: number, month='') {
  return fetchShifts(user_id, month).then((shifts) =>
    shifts.map((shift) => {
      const shiftExtProps: ShiftExtendedProps = shiftToShiftExtProps(shift);

      return {
        id: shift.id,
        start: shift.date,
        extendedProps: shiftExtProps,
        color: getStatusColor(stringToStatus(shift.status)),
      } as EventInput;
    })
  );
}

/** Convert DB Shift row → the extendedProps calendar expects */
function shiftToShiftExtProps(shift: Shift) {
  const shiftExtProps: ShiftExtendedProps = {
    id: shift.id,
    status: shift.published ? stringToStatus(shift.status) : Status.Unpublished,
    original_status: stringToStatus(shift.status),
    type: shift.type??'shift',
    date: shift.date.split('T')[0],
    start_time: shift.start_time.slice(0, 5),
    end_time: shift.end_time.slice(0, 5),
    time: `${shift.start_time.slice(0, 5)}–${shift.end_time.slice(0, 5)}`,
    location_id: shift.location_id,
    location_name: shift.location_name,
    address: shift.address,
    notes: shift.notes,
    assignee_id: shift.assignee_id,
    assignee_name: shift.assignee_name,
    published: shift.published,
    pay_rate: shift.pay_rate,
    total_payment: shift.total_payment,
    // employee field removed since it's not in the database
  };
  return shiftExtProps;
}

/** Helper: build a calendar event object from a Shift row */
export function shiftToEventInput(shift: Shift): EventInput {
  const ext = shiftToShiftExtProps(shift);
  return {
    id: shift.id,
    start: shift.date,
    extendedProps: ext,
    color: getStatusColor(stringToStatus(shift.status)),
    title: buildShiftEventTitle(shift.status, ext.time, ext.location_name, shift.assignee_name, ext.type as 'shift' | 'leave' | 'unavailability'),
  };
}

export function buildShiftEvent(date: string, timeRange: string, otherProps: Partial<EventInput> = {}) {
  const [startTime, endTime] = timeRange.split('–');
  return {
    start: new Date(`${date}T${startTime}`),
    end: new Date(`${date}T${endTime}`),
    ...otherProps,
  };
}

export function buildShiftEventTitle(
  status: string,
  time: string,
  location: string,
  employee?: string,
  type: 'shift' | 'leave' | 'unavailability' = 'shift'
) {
  return `${status} ${(status === 'Leave' || status === 'Unavailable') ? '' : type}${employee ? `\n${employee}` : ''}${time ? `\n${time}` : ''}${location ? `\n${location}` : ''}`;
}
