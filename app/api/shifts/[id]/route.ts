import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { Shift } from "@/app/controllers/Shifts";
import { User } from "@/app/controllers/User";
import { isAdmin } from "../../users/[id]/is_admin";


export async function GET(request : NextRequest, context: RouteContext<'/api/shifts/[id]'>) {
    try{
        const p = await context.params;
        const admin = await isAdmin(p.id);
        let shifts;
        
        if (admin) {
            shifts = await executeQuery(
                `SELECT s.id as id, s.assignee_id as assignee_id, s.status as status, DATE_FORMAT(s.date, '%Y-%m-%d') as date, s.start_time as start_time, s.end_time as end_time, s.notes as notes, l.id as location_id, l.name as location_name, l.address as address, CONCAT(u.first_name," ", u.last_name) as assignee_name FROM shifts s INNER JOIN locations l ON s.location_id = l.id LEFT JOIN users u ON s.assignee_id = u.id WHERE s.type = "shift"`
            );
        }
        else {
            shifts = await executeQuery(
            `SELECT s.id as id, s.assignee_id as assignee_id, s.status as status, DATE_FORMAT(s.date, '%Y-%m-%d') as date, s.start_time as start_time, s.end_time as end_time, s.notes as notes, l.id as location_id,  l.name as location_name, l.address as address, CONCAT(u.first_name," ", u.last_name) as assignee_name FROM shifts s INNER JOIN locations l ON s.location_id = l.id INNER JOIN users u ON s.assignee_id = u.id WHERE s.status != "Unassigned" AND s.status != "Declined" AND u.id = ? AND s.type = "shift"`,
            [p.id]
            );
        }

        const shiftsArray = Array.isArray(shifts) ? shifts : [];
        return NextResponse.json(shiftsArray);
    }
    catch (error) {
        console.error("Error fetching shifts:", error);
        return NextResponse.json({ error: "Failed to fetch shifts" }, { status: 500 });
    }
};

export async function DELETE(req: NextRequest, context: RouteContext<'/api/shifts/[id]'>) {
  try {
    const p = await context.params;

    const id = p.id;
    // const id = p.id.split('-')[0];
    // const assignee_id = p.id.split('-')[1];

    // If decided to use composite key between id and assignee id
    // const result = await executeQuery(`
    //   DELETE FROM shifts WHERE id = ? and assignee_id = ?
    // `, [id, assignee_id]) as any;

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


export async function PUT(req: NextRequest, _context: any) {
  try {
    const { id, assignee_id, status, date, start_time, end_time, notes, location_id} : Shift = await req.json();

    const updates = [];
    const vals = [];
    
    if (!assignee_id && !status && !date && !start_time && !end_time && !notes && !location_id){
      return NextResponse.json(
      { error: "Please provide atleast one field to update!" },
      { status: 401 }
      );
    }

    
    if (status) {
      updates.push('status = ?');
      vals.push(status);
    }
    if (assignee_id) {
      updates.push('assignee_id = ?');
      vals.push((status && (status==="Open"||status==="Unassigned")) ? null : assignee_id);
    }
    if (date) {
      updates.push('date = ?');
      vals.push(date);
    }
    if (start_time) {
      updates.push('start_time = ?');
      vals.push(start_time);
    }
    if (end_time) {
      updates.push('end_time = ?');
      vals.push(end_time);
    }
    if (notes) {
      updates.push('notes = ?');
      vals.push(notes);
    }
    if (location_id) {
      updates.push('location_id = ?');
      vals.push(location_id);
    }
    vals.push(id);

    const result = await executeQuery(`UPDATE shifts SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, vals) as any;

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Shift not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Shift updated successfully"
    });

  } catch (error) {
    console.error("Error updating shift:", error);
    return NextResponse.json(
      { error: "Failed to update shift" },
      { status: 500 }
    );
  }
}