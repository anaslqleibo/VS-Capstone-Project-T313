import getStatusColor, { Status, stringToStatus } from "../components/utils/getStatusColor";
import { EventInput } from "@fullcalendar/core/index.js";
import { getAuthorizationHeader } from "../lib/auth";
import { fetchApi } from "../lib/api";
import { LeaveExtendedProps } from "../components/Modal";

export type Leave = {
    id?: string;
    assignee_id: string;
    status: string;
    type: string;
    date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    employee?: string;
    recurrence: string;
}

export async function fetchLeaves(user_id: number, month='') {
  const authHeader = getAuthorizationHeader();
  if (!authHeader) throw new Error('No auth token found');

  const res = await fetchApi(month?`/leaves/${user_id}/${month}`:`/leaves/${user_id}`,{
    headers: authHeader
  });

  if (!res.ok) {
    throw new Error('Failed to fetch leaves');
  }
  const data = await res.json();

  return data as Leave[];
}

export async function checkAvailability(user_id: number, date: string, start_time?: string, end_time?:string) {
  const authHeader = getAuthorizationHeader();
  if (!authHeader) throw new Error('No auth token found');

  const res = await fetchApi(`/leaves/${user_id}/check`,{
    method: "POST",
    headers: { ...authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, start_time, end_time })
  });

  if (!res.ok) {
    throw new Error('Failed to fetch leaves');
  }
  const data = await res.json();
  return data;
}

export function getEventInputLeaves(user_id: number, month=''){
  const shifts = fetchLeaves(user_id, month).then((leaves) => {
    return leaves.map((leave) => {
      const recurrence = leave.recurrence?.toLowerCase() || "never";
      let rrule: any = null;

      switch (recurrence) {
        case "daily":
          rrule = {
            freq: "daily",
            dtstart: leave.date,  
            until: leave.end_date, 
          };
          break;

        case "weekly":
          rrule = {
            freq: "weekly",
            dtstart: leave.date,
            until: leave.end_date,
          };
          break;

        case "monthly":
          rrule = {
            freq: "monthly",
            dtstart: leave.date,
            until: leave.end_date,
          };
          break;

        case "never":
        default:
          break;
      }

      
      return {
      id: leave.id,
      start: leave.date,
      end: leave.end_date,
      rrule,
      allDay: true,
      extendedProps: leaveToLeaveExtProps(leave),
      color: getStatusColor(stringToStatus(leave.status)),
    } as EventInput});
  });
  return shifts;
}


export async function fetchLeave(id: string) {
  const authHeader = getAuthorizationHeader();
  if (!authHeader) throw new Error('No auth token found');

  const res = await fetchApi(`/leaves/${id}/leave`, {
    method: "GET",
    headers: authHeader
  });

  if (!res.ok) {
    throw new Error('Failed to fetch the leave');
  }
  return (await res.json()) as Leave;
}


export async function fetchLeaveExtProps(id: string) : Promise<LeaveExtendedProps> {
  return leaveToLeaveExtProps(await fetchLeave(id));
}

function leaveToLeaveExtProps(leave: Leave) : LeaveExtendedProps{
  const recurrence = leave.recurrence || "Never";

  const extProps = {
    id: leave.id,
    assignee_id: leave.assignee_id,
    status: leave.status === "Accepted" ? Status.Leave : stringToStatus(leave.status),
    type: leave.type,
    date: leave.date.split('T')[0],
    end_date: leave.end_date.split('T')[0],
    start_time: leave.start_time.slice(0, 5),
    end_time: leave.end_time.slice(0, 5),
    time: `${leave.start_time.slice(0, 5)}–${leave.end_time.slice(0, 5)}`,
    assignee_name: leave.employee,
    recurrence: recurrence.charAt(0).toUpperCase() + recurrence.slice(1).toLowerCase()
  }
  return extProps;
}


export async function createLeave(unavail: Leave) {
  const authHeader = getAuthorizationHeader();
  if (!authHeader) throw new Error('No auth token found');

  const res = await fetchApi(`/leaves`, {
    method: 'POST',
    headers: { ...authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify(unavail),
  });

  if (!res.ok) {
    throw new Error('Failed to create leave');
  }
  else return res.ok;
}


export async function updateLeaveStatus(leave_id: string, user_id: string, is_accepted: boolean, decided_by: string) {
  try {
    const authHeader = getAuthorizationHeader();
    if (!authHeader) throw new Error('No auth token found');

    const res = await fetchApi(`/leaves/${leave_id}/status`, {
      method: 'PATCH',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, is_accepted, decided_by}),
    });

    return res.ok;
  } catch (err) {
    console.error('Failed to update leave status:', err);
    return false;
  }
}

export async function deleteLeave(shift_id: string) {
  try {
    const authHeader = getAuthorizationHeader();
    if (!authHeader) throw new Error('No auth token found');

    const res = await fetchApi(`/shifts/shift/${shift_id}`, {
      method: 'DELETE',
      headers: authHeader
    });

    return res.ok;
  } catch (err) {
    console.error('Failed to delete leave', err);
    return false;
  }
}