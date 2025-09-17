import { executeQuery } from "@/app/lib/db";
import { isAdmin } from "../users/[id]/is_admin";
import { NextRequest } from "next/server";

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
      [(status !== "Open" && status !== "Unassigned") ? assignee_id : null, (status !== "Open" && status !== "Unassigned" && admin) ? "Accepted" : status, location_id, date, start_time, end_time, notes]
    );

    return new Response(JSON.stringify({ message: "Shift created successfully" }), {
      status: 200,
    });

  } catch (err) {
    console.error("❌ Shift creation DB error:", err);
    return new Response("Failed to create shift", { status: 500 });
  }
}
