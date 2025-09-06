import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {assignee_id, date, end_date, start_time, end_time, recurrence} = body;

    const result =   await executeQuery(
      `INSERT INTO shifts (assignee_id, date, end_date, start_time, end_time, recurrence, type)
       VALUES (?, ?, ?, ?, ?, ?, 'leave')`,
      [assignee_id, date, end_date, start_time, end_time, recurrence]
    );

    return NextResponse.json({ message: "Leave created successfully" });
  } catch (error) {
    console.error("Error creating shift:", error);
    return NextResponse.json({ error: "Failed to create shift" }, { status: 500 });
  }
}