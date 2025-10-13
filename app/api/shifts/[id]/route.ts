// app/api/shifts/shift/[id]/duplicate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 1) Read source shift
    const [src] = (await executeQuery(
      `SELECT id, assignee_id, status, location_id, date, start_time, end_time, notes, type
         FROM shifts
        WHERE id = ? LIMIT 1`,
      [id]
    )) as any[];

    if (!src) {
      return NextResponse.json({ error: "Source shift not found" }, { status: 404 });
    }

    // If you prefer duplicates to start as 'Pending', set: const newStatus = 'Pending';
    const newStatus = src.status;

    // 2) Insert duplicate
    await executeQuery(
      `INSERT INTO shifts (assignee_id, status, location_id, date, start_time, end_time, notes, type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        src.assignee_id,
        newStatus,
        src.location_id,
        src.date,
        src.start_time,
        src.end_time,
        src.notes,
        src.type ?? "shift",
      ]
    );

    // 3) New id
    const [{ insertId }] = (await executeQuery(
      "SELECT LAST_INSERT_ID() AS insertId",
      []
    )) as any[];

    // 4) Return full new row (with location fields)
    const [dup] = (await executeQuery(
      `SELECT s.id, s.assignee_id, s.status, s.location_id, s.date, s.start_time, s.end_time, s.notes, s.type,
              l.name AS location_name, l.address
         FROM shifts s
         LEFT JOIN locations l ON l.id = s.location_id
        WHERE s.id = ? LIMIT 1`,
      [insertId]
    )) as any[];

    return NextResponse.json({ success: true, newShift: dup }, { status: 200 });
  } catch (e) {
    console.error("[DUPLICATE SHIFT] error:", e);
    return NextResponse.json({ error: "Failed to duplicate shift" }, { status: 500 });
  }
}
