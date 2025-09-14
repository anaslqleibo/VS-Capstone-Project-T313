import { executeQuery } from "@/app/lib/db";
import { isAdmin } from "../users/[id]/is_admin";
import { NextRequest, NextResponse } from "next/server";

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
      notes
    } = await req.json();

    console.log("Received shift data:", {
      assignee_id,
      status,
      location_id,
      address,
      date,
      start_time,
      end_time,
      notes
    });

    if (!date || !start_time || !end_time || !status || !location_id) {
    return new Response("Missing required fields", { status: 400 });
  }

    const admin = await isAdmin(assignee_id);

    await executeQuery(
      `INSERT INTO shifts (assignee_id, status, location_id, date, start_time, end_time, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`, // added status field
      [status !== "Open" ? assignee_id : null, (status !== "Open" && admin) ? "Accepted" : status, location_id, date, start_time, end_time, notes]
    );

    return new Response(JSON.stringify({ message: "Shift created successfully" }), {
      status: 200,
    });

  } catch (err) {
    console.error("❌ Shift creation DB error:", err);
    return new Response("Failed to create shift", { status: 500 });
  }
}

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
    console.log(month,year);
    const result = await executeQuery(
      `UPDATE shifts SET published = 1 ${conditions.length>0?'WHERE':''} ${conditions.join(' AND ')}`, vals
    ) as any;

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Shifts not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error publishing bulk shifts", error);
    return NextResponse.json(
      { error: "Failed to publish bulk shifts" },
      { status: 500 }
    );
  }
};
