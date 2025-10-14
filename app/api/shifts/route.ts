// app/api/shifts/route.ts

import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { sendEmail, sendShiftEmail } from "@/app/lib/email"; // existing
import { queueEmail } from "@/app/lib/email"; // NEW
import { buildShiftEmail } from "@/app/lib/shift-email";
import { insertNotification } from "@/app/lib/notification-db";
import { isAdmin } from "../users/[id]/is_admin";
import { Shift } from "@/app/controllers/Shifts";

// Tiny helper to format a nice "when" string without timezone headaches
function formatWhen(date: string, start: string, end: string) {
  // e.g., "2025-10-10", "07:00:00", "12:00:00"
  const startDate = new Date(`${date}T${start}`);
  const endDate = new Date(`${date}T${end}`);

  const fmt = new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const startStr = fmt.format(startDate);
  const endStr = fmt.format(endDate);

  // make the date look nicer
  const dateStr = new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(startDate);

  return `${dateStr} ${startStr} – ${endStr}`;
}


export async function POST(req: NextRequest) {
  try {
    const {
      assignee_id,
      status,
      location_id,
      address,
      date,
      start_time,
      end_time,
      notes,
      published,
      pay_rate,
      total_payment
    } = await req.json();

    console.log("[SHIFT CREATE] payload:", {
      assignee_id,
      status,
      location_id,
      address,
      date,
      start_time,
      end_time,
      notes,
      pay_rate,
      total_payment
    });

    const admin = await isAdmin(assignee_id);

    // 1) Insert the shift
    const res = await executeQuery(
      `INSERT INTO shifts (assignee_id, status, location_id, date, start_time, end_time, notes, published, pay_rate, total_payment)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      [(status !== "Open" && status !== "Unassigned") ? assignee_id : null, (status !== "Open" && status !== "Unassigned" && admin) ? "Accepted" : status, location_id, date, start_time, end_time, notes, published??0, pay_rate??0, total_payment??0]
    ) as any;

    console.log("[SHIFT CREATE] inserted");

    if (published){
      sendShiftEmail({assignee_id,address,date,start_time,end_time,notes} as Shift);
      insertNotification(res.insertId, status);
    }

    return NextResponse.json({ message: "Shift created successfully" }, { status: 200 });
  } catch (err) {
    console.error("Shift creation error:", err);
    return new Response("Failed to create shift", { status: 500 });
  }
}


// Publish bulk shifts
export async function PATCH(req: Request) {
  try {
    const {month, year} = await req.json();
    
    const conditions = [];
    const vals = [];

    if (month) {
      conditions.push('MONTH(date) = ?');
      vals.push(month);
    }
    if (year) {
      conditions.push('YEAR(date) = ?');
      vals.push(year);
    }
   
    

    const result = await executeQuery(
      `UPDATE shifts SET published = 1 ${conditions.length>0?'WHERE':''} ${conditions.join(' AND ')}`, vals
    ) as any;

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Shifts not found" },
        { status: 404 }
      );
    }

    const shifts = await executeQuery(
      `SELECT s.id as id, s.assignee_id as assignee_id, s.status as status, DATE_FORMAT(s.date, '%Y-%m-%d') as date, s.start_time as start_time, s.end_time as end_time, l.address as address, s.notes as notes FROM shifts s INNER JOIN locations l ON s.location_id = l.id ${conditions.length>0?'WHERE':''} ${conditions.join(' AND ')}`, vals
    ) as any[]; 

    shifts.forEach((shift)=>{
      const {
        id,
        assignee_id,
        address,
        status,
        date,
        start_time,
        end_time,
        notes,
      } = shift;

      if (assignee_id) sendShiftEmail({assignee_id,address,date,start_time,end_time,notes} as Shift);
      if (id) insertNotification(id, status);
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error publishing bulk shifts", error);
    return NextResponse.json(
      { error: "Failed to publish bulk shifts" },
      { status: 500 }
    );
  }
};
