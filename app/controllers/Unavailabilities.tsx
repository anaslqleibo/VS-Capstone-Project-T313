import getStatusColor, { Status, stringToStatus } from "../components/utils/getStatusColor";
import { EventInput } from "@fullcalendar/core/index.js";
import dayjs from "dayjs";

export type Unavailability = {
    id: string;
    uid: string;
    start_date: string;
    end_date: string;
    start: string;
    end: string;
    day_of_week: string | null;
    employee: string;
}

export async function fetchUnavailabilities(all: boolean, user_id: number) {
  let id = user_id;
  if (all) id = -1;
  const res = await fetch(`/api/unavailabilities/${id}`);

  if (!res.ok) {
    throw new Error('Failed to fetch unavailabilities');
  }
  const data = await res.json();
  return data as Unavailability[];
}

export async function fetchLeaves(all: boolean, user_id: number) {
  let id = user_id;
  if (all) id = -1;
  const res = await fetch(`/api/unavailabilities/leaves/${id}`);

  if (!res.ok) {
    throw new Error('Failed to fetch leaves');
  }
  const data = await res.json();
  return data as Unavailability[];
}


export function getEventInputLeaves(all: boolean, user_id: number){
  const shifts = fetchLeaves(all, user_id).then((unavailabilities) => {
    return unavailabilities.map((unavailability) => ({
      id: unavailability.id,
      start: unavailability.start_date,
      allDay: true,
      extendedProps: {
        status: Status.Leave,
        date: unavailability.start_date.split('T')[0],
        start: unavailability.start.slice(0, 5),
        end: unavailability.end.slice(0, 5),
        time: `${unavailability.start.slice(0, 5)}–${unavailability.end.slice(0, 5)}`,
        employee: unavailability.employee
      },
      color: getStatusColor(Status.Leave),
    } as EventInput));
  });
  return shifts;
}

export async function getEventInputUnavailabilities(all: boolean, user_id: number) {
  const unavailabilities = await fetchUnavailabilities(all, user_id);

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
      start: unavailability.start.slice(0, 5),
      end: unavailability.end.slice(0, 5),
      startRecur: unavailability.start_date,                     
      endRecur,       
      textColor: "#000000",            
      extendedProps: {
        status: Status.Unavailable,
        employee: unavailability.employee,
        repeat: unavailability.day_of_week,
        time: `${unavailability.start.slice(0, 5)}–${unavailability.end.slice(0, 5)}`
      },
      color: getStatusColor(Status.Unavailable),
    } as EventInput;
  });
}