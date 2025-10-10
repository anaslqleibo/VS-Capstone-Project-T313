import nodemailer from "nodemailer";
import { executeQuery } from "@/app/lib/db";

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
