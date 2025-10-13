import { executeQuery } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { headers, cookies } from "next/headers";
import { queueEmail } from "@/app/lib/email";
import { sendEmail } from "@/app/lib/email";
import { verifyToken } from "@/app/lib/auth";
import { buildLeaveEmail } from "@/app/lib/leave-email";

function getBearerTokenFromHeaders(h: Headers) {
  const auth = h.get("authorization") || h.get("Authorization");
  if (!auth) return null;
  const [scheme, token] = auth.split(" ");
  return scheme?.toLowerCase() === "bearer" ? token : null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, end_date, start_time, end_time, recurrence } = body ?? {};

    //Resolve user id from JWT or fallback to body.assignee_id
    let effectiveUserId: number | null = null;
    try {
      const hdrs = await headers();
      const bearer = getBearerTokenFromHeaders(hdrs);
      const cookieToken = (await cookies()).get("token")?.value;
      const token = bearer || cookieToken || null;

      if (token) {
        const payload: any = await verifyToken(token); // -> { userId, email, ... }
        if (payload?.userId) effectiveUserId = Number(payload.userId);
      }
    } catch (e) {
      console.warn("[LEAVE SUBMIT] token decode failed (non-fatal):", e);
    }

    if (!effectiveUserId && body?.assignee_id) {
      effectiveUserId = Number(body.assignee_id);
    }

    if (!effectiveUserId) {
      console.warn("[LEAVE SUBMIT] no active user id");
      return NextResponse.json({ error: "Cannot retrieve active user id." }, { status: 401 });
    }

    // Original insert (unchanged)
    await executeQuery(
      `INSERT INTO shifts (assignee_id, date, end_date, start_time, end_time, recurrence, type)
       VALUES (?, ?, ?, ?, ?, ?, 'leave')`,
      [effectiveUserId, date, end_date, start_time, end_time, recurrence]
    );

    //Emails (best-effort)
    try {
      console.log("[LEAVE SUBMIT] after insert");

      // Requester
      const [requester] = await executeQuery(
        `SELECT id, email, CONCAT(first_name,' ',last_name) AS full_name
           FROM users
          WHERE id = ?
          LIMIT 1`,
        [effectiveUserId]
      ) as any[];

      if (!requester?.email) {
        console.warn("[LEAVE SUBMIT] requester missing email", { effectiveUserId });
      } else {
        const { subject, htmlForUser, htmlForApprover } = buildLeaveEmail({
          event: "submitted",
          userName: requester.full_name ?? "Staff",
          startDate: date,
          endDate: end_date,
          // reason: body.reason,
          // notes: body.notes,
        });

        // 1) Requester: queue + immediate SMTP
        try {
          await queueEmail({ to: requester.email, subject, html: htmlForUser });
          await sendEmail({ to: requester.email, subject, html: htmlForUser, text: "Leave request submitted." });
          console.log("[LEAVE SUBMIT] queued + sent to requester");
        } catch (e) {
          console.warn("[LEAVE SUBMIT] requester email failed:", e);
        }

        // 2) Approvers = all admins (as you asked)
        try {
          const admins = await executeQuery(
            `SELECT email FROM users WHERE role='admin' AND (is_active IS NULL OR is_active <> 0)`
          ) as Array<{ email: string }>;

          await Promise.all(
            admins
              .filter(a => !!a.email)
              .map(async a => {
                await queueEmail({ to: a.email, subject, html: htmlForApprover });
                await sendEmail({ to: a.email, subject, html: htmlForApprover, text: "New leave request submitted." });
                console.log("[LEAVE SUBMIT] queued + sent to admin:", a.email);
              })
          );
        } catch (e) {
          console.warn("[LEAVE SUBMIT] admin emails failed:", e);
        }
      }
    } catch (e) {
      console.warn("[LEAVE SUBMIT] email step failed (non-fatal):", e);
    }

    return NextResponse.json({ message: "Leave created successfully" });
  } catch (error) {
    console.error("Error creating shift (leave):", error);
    return NextResponse.json({ error: "Failed to create leave" }, { status: 500 });
  }
}
