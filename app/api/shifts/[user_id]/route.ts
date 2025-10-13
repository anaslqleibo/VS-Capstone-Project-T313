import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { Shift } from "@/app/controllers/Shifts";
import { User } from "@/app/controllers/User";
import { isAdmin } from "../../users/[id]/is_admin";
import { buildShiftEmail } from "@/app/lib/shift-email";
import { sendEmail } from "@/app/lib/email";
import { formatWhen } from "@/app/components/utils/formatDate";
import { insertNotification, storeNotification } from "@/app/lib/notification-db";


export async function GET(request : NextRequest, context: RouteContext<'/api/shifts/[user_id]'>) {
    try{
        const p = await context.params;
        const admin = await isAdmin(p.user_id);
        let shifts;
        
        if (admin) {
            shifts = await executeQuery(
                `SELECT s.id as id, s.assignee_id as assignee_id, s.status as status, DATE_FORMAT(s.date, '%Y-%m-%d') as date, s.start_time as start_time, s.end_time as end_time, s.notes as notes, l.id as location_id, l.name as location_name, l.address as address, CONCAT(u.first_name," ", u.last_name) as assignee_name FROM shifts s INNER JOIN locations l ON s.location_id = l.id LEFT JOIN users u ON s.assignee_id = u.id WHERE s.type = "shift"`
            );
        }
        else {
            shifts = await executeQuery(
            `SELECT s.id as id, s.assignee_id as assignee_id, s.status as status, DATE_FORMAT(s.date, '%Y-%m-%d') as date, s.start_time as start_time, s.end_time as end_time, s.notes as notes, l.id as location_id,  l.name as location_name, l.address as address, CONCAT(u.first_name," ", u.last_name) as assignee_name FROM shifts s INNER JOIN locations l ON s.location_id = l.id INNER JOIN users u ON s.assignee_id = u.id WHERE s.status != "Unassigned" AND s.status != "Declined" AND u.id = ? AND s.type = "shift"`,
            [p.user_id]
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




export async function PUT(req: NextRequest, context: RouteContext<'/api/shifts/[user_id]'>) {
  try {
    const { id, assignee_id, status, date, start_time, end_time, notes, location_id} : Shift = await req.json();
    const { user_id } = await context.params;
    const assignee_changed = user_id==='1'?true:false;

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


    // Retrieve assignee's initial email as well as shift details
    const [userShift] = await executeQuery(
      `SELECT DATE_FORMAT(s.date, '%Y-%m-%d') as date, s.start_time as start_time, s.end_time as end_time, l.address as address, s.notes as notes FROM shifts s LEFT JOIN users u ON u.id = s.assignee_id INNER JOIN locations l ON l.id = s.location_id WHERE s.id = ?`,
      [id]
    ) as any[];

    const result = await executeQuery(`UPDATE shifts SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, vals) as any;

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Shift not found" },
        { status: 404 }
      );
    }

    let newAssignee = null;
    if (assignee_id && assignee_changed){
      const [res] = await executeQuery(
        `SELECT email, CONCAT(first_name, " ", last_name) as name FROM users WHERE id = ?`,
        [assignee_id]
      ) as any[];

      newAssignee = res;
    }
    
    if (location_id){
        const [loc] = await executeQuery(
          `SELECT address FROM locations WHERE id = ?`,
          [location_id]
        ) as any[];
        
      if (newAssignee)
        newAssignee.location = loc.address;
      else newAssignee = {location: loc.address};
    }


    const assigneeReassigned = assignee_changed&&assignee_id&&newAssignee;

    const noAssignee = status === 'Open' || status === 'Unassigned';

    if (noAssignee && userShift === undefined)
      return NextResponse.json({ 
      success: true, 
      message: "Shift updated successfully"
    });

    const { subject, html } = buildShiftEmail({
      event: noAssignee ? 'cancelled' : (assignee_changed ? "created" : "updated"),
      userName: assigneeReassigned ? newAssignee.name : userShift.name,
      date: date ? date : userShift.date,
      start: start_time ? start_time.substring(0,5) : userShift.start_time.substring(0,5),
      end: end_time ? end_time.substring(0,5) : userShift.end_time.substring(0,5),
      address: location_id ? newAssignee.location : userShift.address,
      notes: notes? notes: userShift.notes,
      status: status?status: userShift.status,
    });

      // --- Direct SMTP send (kept) ---
    console.log("[SHIFT UPDATE] before SMTP");
    try {

      // Send to prevous/old assignee
      if (assignee_changed && userShift?.email && userShift?.email !== newAssignee.email){
        const { subject, html } = buildShiftEmail({
          event: "cancelled",
          userName: userShift.name,
          date: date ? date : userShift.date,
          start: start_time ? start_time.substring(0,5) : userShift.start_time.substring(0,5),
          end: end_time ? end_time.substring(0,5) : userShift.end_time.substring(0,5),
          address: location_id ? newAssignee.location : userShift.address,
          notes: notes? notes: userShift.notes,
        });
        await sendEmail({
          to: userShift.email,
          subject,
          html,
          text: `Shift cancelled — ${formatWhen(userShift.date, userShift.start_time, userShift.end_time)}`,
        });
      }

      if ((newAssignee && newAssignee.email) || userShift.email)
        await sendEmail({
          to: (assigneeReassigned ? newAssignee.email : userShift.email) ,
          subject,
          html,
          text: `${noAssignee ? 'Shift cancelled' :( assignee_changed?'New shift assigned':'Shift details updated')} — ${formatWhen(userShift.date, userShift.start_time, userShift.end_time)}`,
        });

      console.log("[SHIFT UPDATE] SMTP sent");
    } catch (e) {
      console.warn("[EMAIL SMTP] Failed to send email:", e);

    // await queueEmail({
    //   to: userShift.email,
    //   subject,
    //   html,
    // });
    }
    
    insertNotification(id??'', status);
    
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