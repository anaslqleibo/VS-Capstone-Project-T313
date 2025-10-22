import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { sendShiftEmail } from "@/app/lib/email";
import { insertNotification } from "@/app/lib/notification-db";
import { Shift } from "@/app/controllers/Shifts";
import { verifyAPIToken } from "@/app/lib/auth";

export async function PATCH(request: NextRequest, context: RouteContext<'/api/shifts/shift/[id]/publish'>) {
  try {
    const tokenRes = await verifyAPIToken(request);
    if (!tokenRes.ok) return tokenRes;
        
    const { id } = await context.params;
    if ( !id) {
      return NextResponse.json(
        { error: "Shift id not provided" },
        { status: 400 }
      );
    }
    
    const result = await executeQuery(
      `UPDATE shifts SET published = 1 WHERE id = ?`,
      [id]
    ) as any;

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Shift not found" },
        { status: 404 }
      );
    }


    const [shift] = await executeQuery(
      `SELECT s.id as id, s.assignee_id as assignee_id, s.status as status, DATE_FORMAT(s.date, '%Y-%m-%d') as date, s.start_time as start_time, s.end_time as end_time, l.address as address, s.notes as notes FROM shifts s INNER JOIN locations l ON s.location_id = l.id WHERE s.id = ?`, [id]
    ) as any[]; 
    
    const {
        assignee_id,
        address,
        status,
        date,
        start_time,
        end_time,
        notes,
    } = shift;
    if (assignee_id) sendShiftEmail({assignee_id,address,date,start_time,end_time,notes} as Shift);
    insertNotification(id, status, assignee_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating shift status:", error);
    return NextResponse.json(
      { error: "Failed to update shift status" },
      { status: 500 }
    );
  }
};
