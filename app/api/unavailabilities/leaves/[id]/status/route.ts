import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { queueEmail, buildLeaveEmail } from "@/app/lib/crm-email";

export async function PATCH(req: Request, context: RouteContext<'/api/unavailabilities/leaves/[id]/status'>) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { user_id, is_accepted } = body;

    if (is_accepted === undefined) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }
    
    console.log(user_id, id, is_accepted);
    const result = await executeQuery(
      `UPDATE shifts SET status = ? WHERE id = ? AND assignee_id = ?`,
      [is_accepted ? "Accepted" : "Declined", id, user_id]
    ) as any;

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Leave not found" },
        { status: 404 }
      );
    }

    // ===== EMAIL (Leave Status Change) — begin =====
    try {
      console.log("[LEAVE STATUS] updated");

      // Load the leave + requester info for the email
      const [row] = await executeQuery(
        `SELECT s.id, s.assignee_id, s.status, s.date AS start_date, s.end_date, s.start_time, s.end_time, s.recurrence,
                CONCAT(u.first_name,' ',u.last_name) AS full_name, u.email AS user_email
           FROM shifts s
           JOIN users u ON u.id = s.assignee_id
          WHERE s.id = ?
          LIMIT 1`,
        [id]
      ) as any[];

      if (!row?.user_email) {
        console.warn("[LEAVE STATUS] requester missing email for leave id:", id);
      } else {
        const statusLower = String(row.status ?? (is_accepted ? "Accepted" : "Declined")).toLowerCase();
        const event =
          statusLower === "accepted" ? "approved" :
          statusLower === "declined" ? "declined" :
          statusLower === "canceled" ? "canceled" :
          "updated";

        const { subject, htmlForUser, htmlForApprover } = buildLeaveEmail({
          event: event as any,
          userName: row.full_name ?? "Staff",
          startDate: row.start_date,
          endDate: row.end_date,
          // reason: row.reason, // add if you have it in your table
          // notes: row.notes,   // add if you have it in your table
        });

        // Notify requester
        await queueEmail({ to: row.user_email, subject, html: htmlForUser });
        console.log("[LEAVE STATUS] queued user email");

        // Optional: notify approvers on decision
        if (event === "approved" || event === "declined" || event === "canceled") {
          const approverEnv = process.env.LEAVE_APPROVER_EMAIL;
          if (approverEnv) {
            await queueEmail({ to: approverEnv, subject, html: htmlForApprover });
            console.log("[LEAVE STATUS] queued approver email (env)");
          } else {
            const admins = await executeQuery(
              `SELECT email FROM users WHERE role='admin' AND (is_active IS NULL OR is_active <> 0)`
            ) as Array<{ email: string }>;
            await Promise.all(
              admins
                .filter(a => !!a.email)
                .map(a => queueEmail({ to: a.email, subject, html: htmlForApprover }))
            );
            console.log("[LEAVE STATUS] queued approver emails (admins)");
          }
        }
      }
    } catch (e) {
      console.warn("[LEAVE STATUS] email step failed (non-fatal):", e);
    }
    // ===== EMAIL (Leave Status Change) — end =====

    return NextResponse.json({ success: true, status: 200 });
  } catch (error) {
    console.error("Error updating leave status:", error);
    return NextResponse.json(
      { error: "Failed to update leave status" },
      { status: 500 }
    );
  }
};
