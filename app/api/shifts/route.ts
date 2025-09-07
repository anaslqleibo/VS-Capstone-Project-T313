import { executeQuery } from "@/app/lib/db";
import { NextRequest } from "next/server";

// CREATE shift
export async function POST(req: NextRequest) {
  const {
    assignee_id,
    status,
    date,
    start_time,
    end_time,
    notes,
    location_id,
    type,
  } = await req.json();

  // ✅ Validate required fields
  if (!date || !start_time || !end_time || !status || !location_id || !type) {
    return new Response("Missing required fields", { status: 400 });
  }

  try {
    await executeQuery(
      `
      INSERT INTO shifts (
        assignee_id,
        status,
        date,
        start_time,
        end_time,
        notes,
        location_id,
        type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        assignee_id || null,
        status,
        date,
        start_time,
        end_time,
        notes || null,
        location_id,
        type,
      ]
    );

    return new Response(JSON.stringify({ message: "Shift created successfully" }), {
      status: 200,
    });

  } catch (err) {
    console.error("❌ Shift creation DB error:", err);
    return new Response("Failed to create shift", { status: 500 });
  }
}
