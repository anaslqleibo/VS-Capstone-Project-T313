import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { queueEmail, buildShiftEmail } from "@/app/lib/crm-email"; // ⬅️ NEW

export async function PATCH(req: NextRequest, context: RouteContext<'/api/shifts/shift/[id]/status'>) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }
    
    const result = await executeQuery(
      `UPDATE shifts SET status = ? WHERE id = ?`,
      [status, id]
    ) as any;

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Shift not found or not owned by user" },
        { status: 404 }
      );
    }

    // NEW: Queue CRM email when shift is canceled or updated
    const [shift] = await executeQuery(
      `SELECT s.date, s.start_time, s.end_time, s.address, s.notes, s.status,
              CONCAT(u.first_name, " ", u.last_name) as name, u.email
       FROM shifts s JOIN users u ON s.assignee_id = u.id WHERE s.id = ? LIMIT 1`,
      [id]
    ) as any[];

    if (shift?.email) {
      const event =
        status.toLowerCase() === "canceled"
          ? "canceled"
          : "updated";

      const { subject, html } = buildShiftEmail({
        event,
        userName: shift.name,
        date: shift.date,
        start: shift.start_time,
        end: shift.end_time,
        address: shift.address,
        notes: shift.notes,
      });

      await queueEmail({
        to: shift.email,
        subject,
        html,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating shift status:", error);
    return NextResponse.json(
      { error: "Failed to update shift status" },
      { status: 500 }
    );
  }
};
