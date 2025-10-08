// app/lib/crm-email.ts
import { executeQuery } from "@/app/lib/db";


/**
 * Queue an email into the CRM email_queue table
 */
export async function queueEmail({
  to,
  subject,
  html,
  campaignId = 1,
}: {
  to: string;
  subject: string;
  html: string;
  campaignId?: number;
}) {
  try {
    // Insert email into CRM queue
    await executeQuery(
      `INSERT INTO email_queue
       (campaign_id, contact_id, email, status, attempts, max_attempts, created_at, updated_at)
       VALUES (?, NULL, ?, 'pending', 0, 3, NOW(), NOW())`,
      [campaignId, to]
    );

    // Get the queue_id (last inserted ID)
    const [{ insertId }] = await executeQuery("SELECT LAST_INSERT_ID() AS insertId", []) as any[];

    // Insert into CRM logs
    await executeQuery(
      `INSERT INTO email_logs (campaign_id, queue_id, email, action)
       VALUES (?, ?, ?, 'queued')`,
      [campaignId, insertId, to]
    );

    // Optionally log the HTML in templates for auditing (disabled by default)
    // await executeQuery(
    //   `INSERT INTO templates (name, subject, design) VALUES (?, ?, ?)`,
    //   ['Shift Notification', subject, html]
    // );
  } catch (err) {
    console.error("❌ Failed to queue CRM email:", err);
  }
}

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
}: {
  event: "created" | "updated" | "canceled";
  userName: string;
  date: string;
  start: string;
  end: string;
  address?: string | null;
  notes?: string | null;
}) {
  const title =
    event === "created"
      ? "New shift assigned"
      : event === "updated"
      ? "Shift updated"
      : "Shift canceled";

  const subject = `${title} — ${date} ${start}–${end}`;
  const html = `
    <p>Hi ${userName ?? "there"},</p>
    <p>${title}.</p>
    <ul>
      <li><b>Date:</b> ${date}</li>
      <li><b>Time:</b> ${start}–${end}</li>
      ${address ? `<li><b>Address:</b> ${address}</li>` : ""}
      ${notes ? `<li><b>Notes:</b> ${notes}</li>` : ""}
    </ul>
    <p>Please check the staff portal for full details.</p>
  `;
  return { subject, html };
}


// ---- Leave email helpers ----

export type LeaveEvent = "submitted" | "approved" | "declined" | "canceled";

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

  const dateRange = `${fmtDate(startDate)} – ${fmtDate(endDate)}`;

  const subject =
    event === "submitted"
      ? `[Leave] ${userName} submitted a request (${dateRange})`
      : `[Leave] ${title} (${dateRange})`;

  const details = `
    <ul>
      <li><b>Dates:</b> ${dateRange}</li>
      ${reason ? `<li><b>Reason:</b> ${reason}</li>` : ""}
      ${notes ? `<li><b>Notes:</b> ${notes}</li>` : ""}
      ${decidedBy ? `<li><b>By:</b> ${decidedBy}</li>` : ""}
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
