// app/api/shifts/user/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { isAdmin } from "../../users/[id]/is_admin"; // note the relative path (3x ..)
import { buildShiftEmail } from "@/app/lib/shift-email";
import { sendEmail } from "@/app/lib/email";
import { formatWhen } from "@/app/components/utils/formatDate";
import { insertNotification } from "@/app/lib/notification-db";

type ShiftUpdateBody = {
  id: string;               // shift id to update
  assignee_id?: string;
  status?: string;
  date?: string;            // YYYY-MM-DD
  start_time?: string;      // HH:mm:ss
  end_time?: string;        // HH:mm:ss
  notes?: string;
  location_id?: string;
};

// ========== GET /api/shifts/user/[id] ==========
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const admin = await isAdmin(userId);

    let shifts;
    if (admin) {
      shifts = await executeQuery(
        `SELECT 
            s.id AS id,
            s.assignee_id AS assignee_id,
            s.status AS status,
            DATE_FORMAT(s.date, '%Y-%m-%d') AS date,
            s.start_time AS start_time,
            s.end_time AS end_time,
            s.notes AS notes,
            l.id AS location_id,
            l.name AS location_name,
            l.address AS address,
            CONCAT(u.first_name, " ", u.last_name) AS assignee_name,
            s.type AS type
         FROM shifts s
         INNER JOIN locations l ON s.location_id = l.id
         LEFT JOIN users u ON s.assignee_id = u.id
         WHERE s.type = "shift"`
      );
    } else {
      shifts = await executeQuery(
        `SELECT 
            s.id AS id,
            s.assignee_id AS assignee_id,
            s.status AS status,
            DATE_FORMAT(s.date, '%Y-%m-%d') AS date,
            s.start_time AS start_time,
            s.end_time AS end_time,
            s.notes AS notes,
            l.id AS location_id,
            l.name AS location_name,
            l.address AS address,
            CONCAT(u.first_name," ", u.last_name) AS assignee_name,
            s.type AS type
         FROM shifts s
         INNER JOIN locations l ON s.location_id = l.id
         INNER JOIN users u ON s.assignee_id = u.id
         WHERE s.status != "Unassigned"
           AND s.status != "Declined"
           AND u.id = ?
           AND s.type = "shift"`,
        [userId]
      );
    }

    const shiftsArray = Array.isArray(shifts) ? shifts : [];
    return NextResponse.json(shiftsArray);
  } catch (error) {
    console.error("Error fetching shifts:", error);
    return NextResponse.json({ error: "Failed to fetch shifts" }, { status: 500 });
  }
}

// ========== PUT /api/shifts/user/[id] ==========
export async function PUT(
  req: NextRequest,
  context: RouteContext<'/api/shifts/[id]'>
) {
  try {
    const params = await context.params; // "assignee_changed" flag in your old code used this
    const userId = params.id;
    
    const body: ShiftUpdateBody = await req.json();
    const { id, assignee_id, status, date, start_time, end_time, notes, location_id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Shift id is required" },
        { status: 400 }
      );
    }

    // Build dynamic update list
    const updates: string[] = [];
    const vals: any[] = [];

    if (!assignee_id && !status && !date && !start_time && !end_time && !notes && !location_id) {
      return NextResponse.json(
        { error: "Please provide at least one field to update!" },
        { status: 400 }
      );
    }

    if (status) {
      updates.push("status = ?");
      vals.push(status);
    }

    if (assignee_id) {
      // if status is Open or Unassigned, we null the assignee
      const toAssign = status && (status === "Open" || status === "Unassigned") ? null : assignee_id;
      updates.push("assignee_id = ?");
      vals.push(toAssign);
    }

    if (date) {
      updates.push("date = ?");
      vals.push(date);
    }
    if (start_time) {
      updates.push("start_time = ?");
      vals.push(start_time);
    }
    if (end_time) {
      updates.push("end_time = ?");
      vals.push(end_time);
    }
    if (notes) {
      updates.push("notes = ?");
      vals.push(notes);
    }
    if (location_id) {
      updates.push("location_id = ?");
      vals.push(location_id);
    }

    vals.push(id);

    // Load current (old) shift info BEFORE update — need email/name/address/status for notifications
    const [oldShift] = (await executeQuery(
      `SELECT 
          s.id,
          s.status,
          s.assignee_id,
          DATE_FORMAT(s.date, '%Y-%m-%d') AS date,
          s.start_time,
          s.end_time,
          s.notes,
          u.email AS assignee_email,
          CONCAT(u.first_name, " ", u.last_name) AS assignee_name,
          l.address
       FROM shifts s
       LEFT JOIN users u ON u.id = s.assignee_id
       LEFT JOIN locations l ON l.id = s.location_id
       WHERE s.id = ?
       LIMIT 1`,
      [id]
    )) as any[];

    const result = (await executeQuery(
      `UPDATE shifts SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      vals
    )) as any;

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Shift not found" }, { status: 404 });
    }

    // If assignee_id was provided and "assignee_changed" (your old code used user_id flag)
    const assignee_changed = userId === "1"; // <= you used this convention previously
    let newAssignee: any = null;

    if (assignee_id && assignee_changed) {
      const [res] = (await executeQuery(
        `SELECT 
            email,
            CONCAT(first_name, " ", last_name) AS name
         FROM users
         WHERE id = ?
         LIMIT 1`,
        [assignee_id]
      )) as any[];
      newAssignee = res || null;
    }

    // If location changed, fetch its address for email display
    if (location_id) {
      const [loc] = (await executeQuery(
        `SELECT address FROM locations WHERE id = ? LIMIT 1`,
        [location_id]
      )) as any[];
      if (newAssignee) newAssignee.location = loc?.address;
      else newAssignee = { location: loc?.address };
    }

    const becameOpenOrUnassigned = status === "Open" || status === "Unassigned";

    // If no emails relevant, short-circuit
    if (becameOpenOrUnassigned && !oldShift?.assignee_email) {
      insertNotification(id ?? "", status ?? oldShift?.status);
      return NextResponse.json({ success: true, message: "Shift updated successfully" });
    }

    // Prepare email content
    // Fallbacks: if a field not provided in PUT, keep old values
    const finalDate = date ?? oldShift?.date;
    const finalStart = (start_time ?? oldShift?.start_time)?.substring(0, 5);
    const finalEnd = (end_time ?? oldShift?.end_time)?.substring(0, 5);
    const finalAddress = location_id ? newAssignee?.location : oldShift?.address;
    const finalNotes = notes ?? oldShift?.notes;
    const finalStatus = status ?? oldShift?.status;

    // Who to notify?
    // - If assignee changed: cancel old assignee (if different), assign new assignee (if not Open/Unassigned)
    // - Else: notify current assignee about "updated"
    try {
      // Notify old assignee if reassigned to someone else
      if (assignee_changed && oldShift?.assignee_email && newAssignee?.email && oldShift.assignee_email !== newAssignee.email) {
        const cancelTpl = buildShiftEmail({
          event: "cancelled",
          userName: oldShift.assignee_name,
          date: finalDate,
          start: finalStart,
          end: finalEnd,
          address: finalAddress,
          notes: finalNotes,
          status: finalStatus,
        });
        await sendEmail({
          to: oldShift.assignee_email,
          subject: cancelTpl.subject,
          html: cancelTpl.html,
          text: `Shift cancelled — ${formatWhen(finalDate, finalStart, finalEnd)}`,
        });
      }

      // Notify new/current assignee (if not Open/Unassigned)
      if (!becameOpenOrUnassigned) {
        const targetEmail = assignee_changed && newAssignee?.email ? newAssignee.email : oldShift?.assignee_email;
        const targetName = assignee_changed && newAssignee?.name ? newAssignee.name : oldShift?.assignee_name;

        if (targetEmail) {
          const { subject, html } = buildShiftEmail({
            event: assignee_changed ? "created" : "updated",
            userName: targetName,
            date: finalDate,
            start: finalStart,
            end: finalEnd,
            address: finalAddress,
            notes: finalNotes,
            status: finalStatus,
          });

          await sendEmail({
            to: targetEmail,
            subject,
            html,
            text: `${assignee_changed ? "New shift assigned" : "Shift details updated"} — ${formatWhen(finalDate, finalStart, finalEnd)}`,
          });
        }
      }
    } catch (e) {
      console.warn("[EMAIL SMTP] Failed to send email:", e);
      // (Optional) queue in CRM here if desired
    }

    // Notifications table hook
    insertNotification(id ?? "", finalStatus);

    return NextResponse.json({
      success: true,
      message: "Shift updated successfully",
    });
  } catch (error) {
    console.error("Error updating shift:", error);
    return NextResponse.json(
      { error: "Failed to update shift" },
      { status: 500 }
    );
  }
}
