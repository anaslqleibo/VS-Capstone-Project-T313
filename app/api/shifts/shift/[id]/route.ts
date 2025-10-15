import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { RowDataPacket } from "mysql2";
import { queueEmail, sendEmail } from "@/app/lib/email";
import { buildShiftEmail } from "@/app/lib/shift-email";
import { formatWhen } from "@/app/components/utils/formatDate";

const notifyWeb = async (req: Request, payload: any) => {
  const url = new URL("/api/notifications/notify", req.url).toString();
  await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      channels: { web: true, email: false },
      ...payload,
    }),
  }).catch(() => {});
};


export async function GET(request : NextRequest, context: RouteContext<'/api/shifts/shift/[id]'>) {
    try{
        const p = await context.params;
        const id = p.id;
        const shift = await executeQuery(
            `SELECT s.id as id, s.assignee_id as assignee_id, s.status as status, DATE_FORMAT(s.date, '%Y-%m-%d') as date, s.start_time as start_time, s.end_time as end_time, s.notes as notes, s.published as published, l.id as location_id, l.name as location_name, l.address as address, CONCAT(u.first_name," ", u.last_name) as assignee_name, s.type as type, s.pay_rate as pay_rate, s.total_payment as total_payment FROM shifts s LEFT JOIN locations l ON s.location_id = l.id LEFT JOIN users u ON s.assignee_id = u.id WHERE s.id = ?`, [id]
        );
        if (!shift || (Array.isArray(shift) && shift.length === 0)) {
            return NextResponse.json(
                { error: "Shift not found" },
                { status: 404 }
            );
        }
            
        return NextResponse.json((shift as RowDataPacket[])[0]);
    }
    catch (error) {
        console.error("Error fetching shifts:", error);
        return NextResponse.json({ error: "Failed to fetch shifts" }, { status: 500 });
    }
};

export async function DELETE(req: NextRequest, context: RouteContext<'/api/shifts/shift/[id]'>) {
  try {
    const p = await context.params;
    const id = p.id;

   const [userShift] = await executeQuery(
  `SELECT 
     u.id as user_id,
     u.email as email,
     CONCAT(u.first_name, " ", u.last_name) as name,
     DATE_FORMAT(s.date, '%Y-%m-%d') as date,
     s.start_time as start_time,
     s.end_time as end_time,
     l.address as address,
     l.name as location_name,
     s.notes as notes
   FROM users u
   INNER JOIN shifts s ON u.id = s.assignee_id
   INNER JOIN locations l ON l.id = s.location_id
   WHERE s.id = ?`,
  [id]
) as any[];


    const result = await executeQuery(`
    DELETE FROM shifts WHERE id = ?`, [id]) as any;

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Shift not found" },
        { status: 404 }
      );
    }


 if (userShift?.email) {
  const startHHmm = String(userShift.start_time).slice(0, 5);
  const endHHmm   = String(userShift.end_time).slice(0, 5);

  const { subject, html } = buildShiftEmail({
    event: "cancelled",
    userName: userShift.name,
    date: userShift.date,
    start: startHHmm,
    end: endHHmm,
    address: userShift.address,
    notes: userShift.notes,
  });

  // --- Direct SMTP send (kept) ---
  console.log("[SHIFT DELETE] before SMTP");
  try {
    await sendEmail({
      to: userShift.email,
      subject,
      html,
      text: `Shift cancelled — ${formatWhen(userShift.date, startHHmm, endHHmm)}`,
    });
    console.log("[SHIFT DELETE] SMTP sent");
  } catch (e) {
    console.warn("[EMAIL SMTP] Failed to send email:", e);
    // await queueEmail({ to: userShift.email, subject, html });
  }

  // NEW: Bell notification for the assignee
  await notifyWeb(req, {
    template: "shift-cancelled",
    recipients: [String(userShift.user_id)],
    shift: {
      assignee_name: userShift.name,
      location_name: userShift.location_name,
      address: userShift.address,
      date: userShift.date,
      start: startHHmm,
      end: endHHmm,
    },
  });
}


    return NextResponse.json({ 
      success: true, 
      message: "Shift deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting shift:", error);
    return NextResponse.json(
      { error: "Failed to delete shift" },
      { status: 500 }
    );
  }
}
