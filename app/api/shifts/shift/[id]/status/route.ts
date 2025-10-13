import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { sendEmail } from "@/app/lib/email"; // ⬅️ NEW
import { buildShiftEmail } from "@/app/lib/shift-email";
import { formatWhen } from "@/app/components/utils/formatDate";
import { insertNotification } from "@/app/lib/notification-db";

export async function PATCH(req: NextRequest, context: RouteContext<'/api/shifts/shift/[id]/status'>) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { status, assignee_id } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }
    
   
    let result:any;

    if (assignee_id){
    // Picking up an open shift
      const [shift] = await executeQuery(
        `SELECT assignee_id FROM shifts WHERE id = ?`,
        [id]
      ) as any[];
  
      if (shift && shift.assignee_id !== null){
        return NextResponse.json(
          { error: "Shift has been picked up by other staff" },
          { status: 403 }
        );
      }

      result = await executeQuery(
        `UPDATE shifts SET status = ?, assignee_id = ? WHERE id = ?`,
        [status??'Accepted', assignee_id, id]
      ) as any;
    }
    else
      // Accepting or declining
      result = await executeQuery(
        `UPDATE shifts SET status = ? WHERE id = ?`,
        [status, id]
      ) as any;

    if (result && result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Shift not found or not owned by user" },
        { status: 404 }
      );
    }

    const [shift] = await executeQuery(
      `SELECT DATE_FORMAT(s.date, '%Y-%m-%d') as date, s.start_time as start_time, s.end_time as end_time, l.address as address, s.notes as notes, CONCAT(u.first_name, ' ', u.last_name) AS name FROM shifts s LEFT JOIN users u ON u.id = s.assignee_id INNER JOIN locations l ON l.id = s.location_id WHERE s.id = ?`,
      [id]
    ) as any[];

    const { subject, html } = buildShiftEmail({
        event: assignee_id ? 'pickedup' : status.toLowerCase(),
        userName: shift.name,
        date: shift.date,
        start: shift.start_time,
        end: shift.end_time,
        address: shift.address,
        notes: shift.notes,
      });

    try {
      const admins = await executeQuery(
        `SELECT email FROM users WHERE role='admin' AND (is_active IS NULL OR is_active <> 0)`
      ) as Array<{ email: string }>;

      await Promise.all(
        admins
          .filter(a => !!a.email)
          .map(async a => {
            // await queueEmail({ to: a.email, subject, html: html });
            await sendEmail({ to: a.email, subject, html: html, text: `${assignee_id ? 'Shift picked-up' :( status==='Accepted'?'Shift accepted':'Shift declined')} — ${formatWhen(shift.date, shift.start_time, shift.end_time)}` });
          })
      );
    } catch (e) {
      console.warn("[SMTP ERROR] admin emails failed:", e);
    }

    insertNotification(id??'', status);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating shift status:", error);
    return NextResponse.json(
      { error: "Failed to update shift status" },
      { status: 500 }
    );
  }
};
