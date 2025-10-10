// app/lib/shift-email.ts
import dayjs from "dayjs";
import { formatDateToHour12, formatWhen } from "../components/utils/formatDate";
import { ShiftStatus } from "../controllers/Shifts";


export type ShiftEvent = "created" | "updated" | "cancelled";

/**
 * Build subject + HTML for shift notification
 */
export function buildShiftEmail({
  event,
  userName,
  date,
  start,
  end,
  address,
  notes,
  status,
}: {
  event: "created" | "updated" | "cancelled";
  userName: string;
  date: string;
  start: string;
  end: string;
  address?: string | null;
  notes?: string | null;
  status?: ShiftStatus;
}) {
  const title =
    event === "created"
      ? "New shift assigned"
      : event === "updated"
      ? "New shift updates"
      : "Shift cancelled";

  const contentTitle =
    event === "created"
      ? (status==='Pending'?"You have a new pending shift":"You have been assigned a new shift")
      : event === "updated"
      ? "Your assigned shift has been updated. See details below."
      : "Your shift listed below has been cancelled";


  const fmt = new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const {startStr, endStr} = formatDateToHour12(date, start, end);

  const subject = `${title} — ${formatWhen(date,start,end)}`;
  const html = `
    <p>Hi ${userName ?? "there"},</p>
    <p>${contentTitle}.</p>
    <ul>
      <li><b>Date:</b> ${dayjs(date).format('dddd, D MMM YYYY')}</li>
      <li><b>Time:</b> ${startStr} – ${endStr}</li>
      ${(event!=='cancelled' && address) ? `<li><b>Address:</b> ${address}</li>` : ""}
      ${(event!=='cancelled' && notes) ? `<li><b>Notes:</b> ${notes}</li>` : ""}
    </ul>
    <p>Please check the staff portal for full details.</p>
  `;
  return { subject, html };
}
