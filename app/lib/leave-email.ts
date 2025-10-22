// ---- Leave email helpers ----

export type LeaveEvent = "submitted" | "approved" | "declined" | "cancelled";

function fmtDate(d: string | Date) {
  const dt = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(dt);
}

export function buildLeaveEmail({
  event,
  userName,
  startDate,
  endDate,
  reason,
  notes,
  decidedBy,
}: {
  event: LeaveEvent;
  userName: string;
  startDate: string | Date;
  endDate: string | Date;
  reason?: string | null;
  notes?: string | null;
  decidedBy?: string | null; // approver name if available
}) {
  const title =
    event === "submitted" ? "Leave request submitted" :
    event === "approved"  ? "Leave request approved"  :
    event === "declined"  ? "Leave request declined"  :
                             "Leave request canceled";

  const start = fmtDate(startDate);
  const end = fmtDate(endDate);
  const dates = start === end ? 'Date' : 'Dates';
  const dateRange = start === end ? start : `${start} – ${end}`;

  const subject =
    event === "submitted"
      ? `[Leave] ${userName} submitted a request (${dateRange})`
      : `[Leave] ${title} (${dateRange})`;

  const details = `
    <ul>
      <li><b>${dates}:</b> ${dateRange}</li>
      ${reason ? `<li><b>Reason:</b> ${reason}</li>` : ""}
      ${notes ? `<li><b>Notes:</b> ${notes}</li>` : ""}
      ${(event!=="submitted" && event!=="cancelled" && decidedBy) ? `<li><b>${event.substring(0,1).toUpperCase()+event.substring(1)} By:</b> ${decidedBy}</li>` : ""}
    </ul>
  `;

  const htmlForUser = `
    <p>Hi ${userName},</p>
    <p>${title}.</p>
    ${details}
  `;

  const htmlForApprover = `
    <p>${userName} has ${event === "submitted" ? "submitted a new leave request" : `a leave request: ${title.toLowerCase()}` }.</p>
    ${details}
  `;

  return { subject, htmlForUser, htmlForApprover };
}
