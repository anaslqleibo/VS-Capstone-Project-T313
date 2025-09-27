import getStatusColor, { Status, stringToStatus } from "../components/utils/getStatusColor";
import { EventInput } from "@fullcalendar/core/index.js";
import dayjs from "dayjs";

export type Unavailability = {
    id?: string;
    assignee_id: string;
    status: string;
    type: string;
    date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    day_of_week: string | null;
    employee?: string;
    recurrence: string;
}

export async function fetchUnavailabilities(user_id: number) {
  const res = await fetch(`/api/unavailabilities/${user_id}`);

  if (!res.ok) {
    throw new Error('Failed to fetch unavailabilities');
  }
  const data = await res.json();
  return data as Unavailability[];
}

export async function fetchLeaves(user_id: number) {
  const res = await fetch(`/api/unavailabilities/leaves/${user_id}`);

  if (!res.ok) {
    throw new Error('Failed to fetch leaves');
  }
  const data = await res.json();
  return data as Unavailability[];
}

export async function checkAvailability(user_id: number, date: string, start_time?: string, end_time?:string) {
  const res = await fetch(`/api/unavailabilities/${user_id}/check`,{
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, start_time, end_time })
  });

  if (!res.ok) {
    throw new Error('Failed to fetch leaves');
  }
  const data = await res.json();
  return data;
}

export function getEventInputLeaves(user_id: number){
  const shifts = fetchLeaves(user_id).then((leaves) => {
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
      extendedProps: {
        assignee_id: leave.assignee_id,
        status: leave.status === "Accepted" ? Status.Leave : stringToStatus(leave.status),
        type: leave.type,
        date: leave.date.split('T')[0],
        start_time: leave.start_time.slice(0, 5),
        end_time: leave.end_time.slice(0, 5),
        time: `${leave.start_time.slice(0, 5)}–${leave.end_time.slice(0, 5)}`,
        assignee_name: leave.employee,
        repeat: recurrence.charAt(0).toUpperCase() + recurrence.slice(1).toLowerCase()
      },
      color: getStatusColor(stringToStatus(leave.status)),
    } as EventInput});
  });
  return shifts;
}

export async function getEventInputUnavailabilities(user_id: number) {
  const unavailabilities = await fetchUnavailabilities(user_id);

  const endRecur = dayjs().add(1, "month").endOf("month").format("YYYY-MM-DD");

  const dayMap: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  return unavailabilities.map((unavailability) => {
    const dayNumber = dayMap[unavailability.day_of_week ? unavailability.day_of_week : "Sunday"];

    return {
      id: unavailability.id,
      daysOfWeek: [dayNumber],       
      start: unavailability.start_time.slice(0, 5),
      end: unavailability.end_time.slice(0, 5),
      startRecur: unavailability.date,                     
      endRecur,       
      textColor: "#000000",            
      extendedProps: {
        status: Status.Unavailable,
        assignee_name: unavailability.employee,
        repeat: unavailability.day_of_week,
        time: `${unavailability.start_time.slice(0, 5)}–${unavailability.end_time.slice(0, 5)}`,
        type: unavailability.type,
      },
      color: getStatusColor(Status.Unavailable),
    } as EventInput;
  });
}


export async function createLeave(unavail: Unavailability, is_unavailability: boolean=false) {
  const endpoint = is_unavailability ? '/api/unavailabilities' : '/api/unavailabilities/leaves';
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(unavail),
  });

  if (!res.ok) {
    throw new Error('Failed to create leave/unavailability');
  }
  else return res.ok;
}


export async function updateLeaveStatus(leave_id: string, user_id: string, is_accepted: boolean) {
  try {
    const res = await fetch(`/api/unavailabilities/leaves/${leave_id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, is_accepted}),
    });

    return res.ok;
  } catch (err) {
    console.error('Failed to update leave status:', err);
    return false;
  }
}

export async function deleteLeave(shift_id: string) {
  try {
    const res = await fetch(`/api/shifts/shift/${shift_id}`, {
      method: 'DELETE',
    });

    return res.ok;
  } catch (err) {
    console.error('Failed to delete leave', err);
    return false;
  }
}