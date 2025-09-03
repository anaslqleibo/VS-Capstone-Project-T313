import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";

export async function POST(req: NextRequest) {
  try {
    const {
      assignee_id,    
      status,         
      location,
      address,
      date,
      start_time,     
      end_time,       
      notes
    } = await req.json();

    console.log("Received shift data:", {
      assignee_id,
      status,
      location,
      address,
      date,
      start_time,
      end_time,
      notes
    });

    await executeQuery(
      `INSERT INTO shifts (assignee_id, status, location, address, date, start_time, end_time, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, // added status field
      [assignee_id, status, location, address, date, start_time, end_time, notes]
    );

    return NextResponse.json({ message: "Shift created successfully" });
  } catch (error) {
    console.error("Error creating shift:", error);
    return NextResponse.json({ error: "Failed to create shift" }, { status: 500 });
  }
}