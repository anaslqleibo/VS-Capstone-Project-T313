// app/api/shifts/route.ts

import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { sendEmail } from "@/app/lib/email"; // existing
import { queueEmail } from "@/app/lib/email"; // NEW
import { buildShiftEmail } from "@/app/lib/shift-email";

// Tiny helper to format a nice "when" string without timezone headaches
function formatWhen(date: string, start: string, end: string) {
  // e.g., "2025-10-10", "07:00:00", "12:00:00"
  const startDate = new Date(`${date}T${start}`);
  const endDate = new Date(`${date}T${end}`);

  const fmt = new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const startStr = fmt.format(startDate);
  const endStr = fmt.format(endDate);

  // make the date look nicer
  const dateStr = new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(startDate);

  return `${dateStr} ${startStr} – ${endStr}`;
}


export async function POST(req: NextRequest) {
  try {
    const {
      assignee_id,
      status,
      location_id,
      address,
      date,
      start_time,
      end_time,
      notes,
    } = await req.json();

    console.log("[SHIFT CREATE] payload:", {
      assignee_id,
      status,
      location_id,
      address,
      date,
      start_time,
      end_time,
      notes,
    });

    // 1) Insert the shift (kept as close to your original as possible)
    await executeQuery(
      `INSERT INTO shifts (assignee_id, status, location_id, date, start_time, end_time, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        assignee_id,
        (status !== "Open" && status !== "Unassigned") ? (status || "Accepted") : status,
        location_id,
        date,
        start_time,
        end_time,
        notes,
      ]
    );
    console.log("[SHIFT CREATE] inserted");

    // 2) Get the newly created shift id if you need it (optional)
    // const [{ insertId }] = await executeQuery("SELECT LAST_INSERT_ID() as insertId", []);

    // 3) Look up the assignee’s contact details
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
    return NextResponse.json({ message: "Shift created successfully" }, { status: 200 });
  } catch (err) {
    console.error("Shift creation error:", err);
    return new Response("Failed to create shift", { status: 500 });
  }
}
