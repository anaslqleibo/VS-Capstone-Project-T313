import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";

import { queueEmail, sendEmail } from "@/app/lib/email";
import { buildLeaveEmail } from "@/app/lib/leave-email";

export async function PATCH(
  req: Request,
  context: RouteContext<"/api/unavailabilities/leaves/[id]/status">
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { user_id, is_accepted } = body;

    if (is_accepted === undefined) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    console.log(user_id, id, is_accepted);

    const result = (await executeQuery(
      `UPDATE shifts SET status = ? WHERE id = ? AND assignee_id = ?`,
      [is_accepted ? "Accepted" : "Declined", id, user_id]
    )) as any;

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Leave not found" }, { status: 404 });
    }

    // ===== EMAIL (Leave Status Change) — begin =====
    try {
      console.log("[LEAVE STATUS] updated");

      // Load the leave + requester info for the email
      const [row] = (await executeQuery(
        `SELECT s.id,
                s.assignee_id,
                s.status,
                s.date        AS start_date,
                s.end_date    AS end_date,
                s.start_time,
                s.end_time,
                s.recurrence,
                CONCAT(u.first_name,' ',u.last_name) AS full_name,
                u.email       AS user_email
           FROM shifts s
           JOIN users u ON u.id = s.assignee_id
          WHERE s.id = ?
          LIMIT 1`,
        [id]
      )) as any[];

      if (!row?.user_email) {
        console.warn("[LEAVE STATUS] requester missing email for leave id:", id);
      } else {
        const statusLower = String(
          row.status ?? (is_accepted ? "Accepted" : "Declined")
        ).toLowerCase();

        // Map DB status -> your helper's event names (note: "cancelled" with two Ls)
        const event =
          statusLower === "accepted"
            ? "approved"
            : statusLower === "declined"
            ? "declined"
            : statusLower === "canceled" || statusLower === "cancelled"
            ? "cancelled"
            : "submitted"; // fallback

        const { subject, htmlForUser, htmlForApprover } = buildLeaveEmail({
          event: event as any,
          userName: row.full_name ?? "Staff",
          startDate: row.start_date,
          endDate: row.end_date,
          // reason: row.reason, // uncomment if present in your table
          // notes: row.notes,
        });

        // 👉 Notify requester (employee): queue + immediate SMTP
        await queueEmail({ to: row.user_email, subject, html: htmlForUser });
        try {
          await sendEmail({
            to: row.user_email,
            subject,
            html: htmlForUser,
            text: "Leave status updated.",
          });
          console.log("[LEAVE STATUS] SMTP sent to requester:", row.user_email);
        } catch (e) {
          console.warn("[LEAVE STATUS] SMTP to requester failed:", e);
        }

        // 👉 Also notify all admins about the decision
        if (event === "approved" || event === "declined" || event === "cancelled") {
          const admins = (await executeQuery(
            `SELECT email
               FROM users
              WHERE role = 'admin'
                AND (is_active IS NULL OR is_active <> 0)`
          )) as Array<{ email: string }>;

          await Promise.all(
            admins
              .filter((a) => !!a.email)
              .map(async (a) => {
                await queueEmail({ to: a.email, subject, html: htmlForApprover });
                try {
                  await sendEmail({
                    to: a.email,
                    subject,
                    html: htmlForApprover,
                    text: "Leave decision notification.",
                  });
                  console.log("[LEAVE STATUS] SMTP sent to admin:", a.email);
                } catch (e) {
                  console.warn("[LEAVE STATUS] SMTP to admin failed:", a.email, e);
                }
              })
          );
        }
      }
    } catch (e) {
      console.warn("[LEAVE STATUS] email step failed (non-fatal):", e);
    }
    // ===== EMAIL — end =====

    return NextResponse.json({ success: true, status: 200 });
  } catch (error) {
    console.error("Error updating leave status:", error);
    return NextResponse.json(
      { error: "Failed to update leave status" },
      { status: 500 }
    );
  }
}
