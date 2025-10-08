// app/lib/shift-email.ts
import { sendEmail } from "@/app/lib/email";

export type ShiftEvent = "created" | "updated" | "canceled";

function formatWhen(start: Date, end: Date) {
  const fmt = new Intl.DateTimeFormat("en-AU", {
    weekday: "short", day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
  return `${fmt.format(start)} → ${fmt.format(end)}`;
}

export async function sendShiftNotification(args: {
  event: ShiftEvent;
  employeeEmail: string;
  employeeName?: string;
  start: Date;
  end: Date;
  location?: string | null;
  notes?: string | null;
}) {
  const when = formatWhen(args.start, args.end);
  const title =
    args.event === "created" ? `New shift assigned`
    : args.event === "updated" ? `Your shift was updated`
    : `Your shift was canceled`;

  const subject = `${title} — ${when}`;
  const html = `
    <p>Hi ${args.employeeName ?? "there"},</p>
    <p>${title.toLowerCase()}.</p>
    <ul>
      <li><b>When:</b> ${when}</li>
      ${args.location ? `<li><b>Location:</b> ${args.location}</li>` : ""}
      ${args.notes ? `<li><b>Notes:</b> ${args.notes}</li>` : ""}
    </ul>
    <p>Please check the portal for details.</p>
  `;

  await sendEmail({ to: args.employeeEmail, subject, html, text: `${title} — ${when}` });
}
