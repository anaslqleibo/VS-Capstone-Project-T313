import { executeQuery } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
// NEW: email helpers
import { queueEmail } from "@/app/lib/crm-email";
import { sendEmail } from "@/app/lib/email";

// 12-hour time + readable date, same style as shifts/leaves
function formatWhen(date: string, start: string, end: string) {
  const startDate = new Date(`${date}T${start}`);
  const endDate = new Date(`${date}T${end}`);

  const timeFmt = new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const dateFmt = new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const startStr = timeFmt.format(startDate);
  const endStr = timeFmt.format(endDate);
  const dateStr = dateFmt.format(startDate);

  return { dateStr, startStr, endStr };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { assignee_id, date, day, start_time, end_time } = body;

    const result = await executeQuery(
      `INSERT INTO shifts (assignee_id, date, day_of_week, start_time, end_time, type)
       VALUES (?, ?, ?, ?, ?, 'unavailability')`,
      [assignee_id, date, day, start_time, end_time]
    );

    // ===== EMAILS (Unavailability Submitted) — begin =====
    try {
      // Lookup requester (the staff who submitted)
      const [requester] = await executeQuery(
        `SELECT id, email, CONCAT(first_name,' ',last_name) AS full_name
           FROM users
          WHERE id = ?
          LIMIT 1`,
        [assignee_id]
      ) as any[];

      if (!requester?.email) {
        console.warn("[UNAVAIL SUBMIT] requester missing email", { assignee_id });
      } else {
        const { dateStr, startStr, endStr } = formatWhen(String(date), String(start_time), String(end_time));
        const subject = `[Unavailability] ${requester.full_name ?? "Staff"} submitted (${dateStr} ${startStr}–${endStr})`;

        // Build simple HTML for both requester + approver
        const htmlForUser = `
          <p>Hi ${requester.full_name ?? "there"},</p>
          <p>Your unavailability has been submitted.</p>
          <ul>
            <li><b>Date:</b> ${dateStr}</li>
            ${day ? `<li><b>Day:</b> ${day}</li>` : ""}
            <li><b>Time:</b> ${startStr} – ${endStr}</li>
          </ul>
        `;

        const htmlForApprover = `
          <p>${requester.full_name ?? "A staff member"} submitted an unavailability.</p>
          <ul>
            <li><b>Date:</b> ${dateStr}</li>
            ${day ? `<li><b>Day:</b> ${day}</li>` : ""}
            <li><b>Time:</b> ${startStr} – ${endStr}</li>
            <li><b>User ID:</b> ${assignee_id}</li>
          </ul>
        `;

        // 1) Queue + SMTP to requester (best-effort)
        try {
          await queueEmail({ to: requester.email, subject, html: htmlForUser });
          await sendEmail({ to: requester.email, subject, html: htmlForUser, text: "Unavailability submitted." });
          console.log("[UNAVAIL SUBMIT] queued + sent to requester");
        } catch (e) {
          console.warn("[UNAVAIL SUBMIT] requester email failed (non-fatal):", e);
        }

        // 2) Notify approver(s): env mailbox or all admins
        const approverEnv = process.env.LEAVE_APPROVER_EMAIL; // reuse same env as leave flow
        if (approverEnv) {
          try {
            await queueEmail({ to: approverEnv, subject, html: htmlForApprover });
            await sendEmail({ to: approverEnv, subject, html: htmlForApprover, text: "New unavailability submitted." });
            console.log("[UNAVAIL SUBMIT] queued + sent to approver (env)");
          } catch (e) {
            console.warn("[UNAVAIL SUBMIT] approver env email failed:", e);
          }
        } else {
          try {
            const admins = await executeQuery(
              `SELECT email FROM users WHERE role='admin' AND (is_active IS NULL OR is_active <> 0)`
            ) as Array<{ email: string }>;

            await Promise.all(
              admins
                .filter(a => !!a.email)
                .map(async a => {
                  await queueEmail({ to: a.email, subject, html: htmlForApprover });
                  await sendEmail({ to: a.email, subject, html: htmlForApprover, text: "New unavailability submitted." });
                })
            );
            console.log("[UNAVAIL SUBMIT] queued + sent to admins");
          } catch (e) {
            console.warn("[UNAVAIL SUBMIT] admin emails failed:", e);
          }
        }
      }
    } catch (e) {
      console.warn("[UNAVAIL SUBMIT] email step failed (non-fatal):", e);
    }
    // ===== EMAILS (Unavailability Submitted) — end =====

    return NextResponse.json({ message: "Unavailability created successfully" });
  } catch (error) {
    console.error("Error creating unavailability:", error);
    return NextResponse.json({ error: "Failed to create unavailability" }, { status: 500 });
  }
}
