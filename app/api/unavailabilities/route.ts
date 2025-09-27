import { executeQuery } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {assignee_id, date, day, start_time, end_time} = body;

    const result =   await executeQuery(
      `INSERT INTO shifts (assignee_id, date, day_of_week, start_time, end_time, type)
       VALUES (?, ?, ?, ?, ?, 'unavailability')`,
      [assignee_id, date, day, start_time, end_time]
    );

    return NextResponse.json({ message: "Unavailability created successfully" });
  } catch (error) {
    console.error("Error creating unavailability:", error);
    return NextResponse.json({ error: "Failed to create unavailability" }, { status: 500 });
  }
}