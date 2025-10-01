import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { RowDataPacket } from "mysql2";

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
    const result = await executeQuery(`
    DELETE FROM shifts WHERE id = ?`, [id]) as any;

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Shift not found" },
        { status: 404 }
      );
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