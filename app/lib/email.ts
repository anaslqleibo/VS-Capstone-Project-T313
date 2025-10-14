import nodemailer from "nodemailer";
import { executeQuery } from "@/app/lib/db";
import { Shift } from "../controllers/Shifts";
import { formatWhen } from "../components/utils/formatDate";
import { buildShiftEmail } from "./shift-email";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: Number(process.env.SMTP_PORT || 465),
  secure: String(process.env.SMTP_SECURE) === "true", // true = TLS (465)
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
  tls: {
   
  },
  pool: true,
});

type EmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};


export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      html,
      text,
    });
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
  } catch (err) {
    console.error("❌ Email send failed:", err);
  }
}


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


export async function sendShiftEmail(shift: Shift){
  const {
      assignee_id,
      address,
      date,
      start_time,
      end_time,
      notes,
    } = shift;

  const users = await executeQuery(
    `SELECT CONCAT(first_name,' ',last_name) AS full_name, email
        FROM users
      WHERE id = ?
      LIMIT 1`,
    [assignee_id]
  ) as Array<{ full_name: string | null; email: string | null }>;

  const employee = users?.[0];
  console.log("[SHIFT CREATE] got user:", employee);

  // 4) Send the email (best-effort — don’t block the main response if it fails)
  if (employee?.email) {
    const when = formatWhen(String(date), String(start_time), String(end_time));
    const subject = `New shift assigned — ${when}`;
    const html = `
      <p>Hi ${employee.full_name ?? "there"},</p>
      <p>You’ve been assigned a new shift.</p>
      <ul>
        <li><b>When:</b> ${when}</li>
        ${address ? `<li><b>Address:</b> ${address}</li>` : ""}
        ${notes ? `<li><b>Notes:</b> ${notes}</li>` : ""}
      </ul>
      <p>Please check the portal for full details at https://www.rostering-system.2bentrods.com.au/</p>
    `;

    // --- Direct SMTP send (kept) ---
    console.log("[SHIFT CREATE] before SMTP");
    try {
      await sendEmail({
        to: employee.email,
        subject,
        html,
        text: `New shift assigned — ${when}`,
      });
      console.log("[SHIFT CREATE] SMTP sent");
    } catch (e) {
      console.warn("[EMAIL SMTP] Failed to send new-shift email:", e);
    }

    // --- CRM queue insert (new) ---
    console.log("[SHIFT CREATE] before CRM queue");
    try {
      const { subject: crmSubject, html: crmHtml } = buildShiftEmail({
        event: "created",
        userName: employee.full_name ?? "Staff",
        date: String(date),
        start: String(start_time),
        end: String(end_time),
        address,
        notes,
      });

      await queueEmail({
        to: employee.email,
        subject: crmSubject,
        html: crmHtml,
      });

      console.log("[SHIFT CREATE] queued in CRM");
    } catch (e) {
      console.warn("[CRM QUEUE] Failed to queue new-shift email:", e);
    }
  } else {
    console.log("[SHIFT CREATE] no email found for assignee_id:", assignee_id);
  }

  console.log("[SHIFT CREATE] done");
}