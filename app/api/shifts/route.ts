// app/api/shifts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { sendShiftEmail } from "@/app/lib/email";
import { insertNotification } from "@/app/lib/notification-db";
import { Shift } from "@/app/controllers/Shifts";
import { verifyAPIToken } from "@/app/lib/auth";

/** Fetch a single shift row + joins in the shape our emails/UI expect */
async function fetchShiftRow(id: number) {
  const rows = (await executeQuery(
    `SELECT s.id, s.assignee_id, s.status, DATE_FORMAT(s.date, '%Y-%m-%d') as date,
            s.start_time, s.end_time, s.notes, s.type, s.published,
            l.id AS location_id, l.name AS location_name, l.address,
            u.email AS assignee_email, CONCAT(u.first_name,' ',u.last_name) AS assignee_name
       FROM shifts s
       LEFT JOIN locations l ON l.id = s.location_id
       LEFT JOIN users u      ON u.id = s.assignee_id
      WHERE s.id = ? LIMIT 1`,
    [id]
  )) as any[];
  return rows?.[0];
}

// POST /api/shifts  (Create a shift; supports published/unpublished and duplicate flows)
export async function POST(request: NextRequest) {
  try {
    const tokenRes = await verifyAPIToken(request);
    if (!tokenRes.ok) return tokenRes;
        
    const body = await request.json();
    const {
      assignee_id,
      status = "Pending",
      date,
      start_time,
      end_time,
      notes,
      location_id,
      type = "shift",
      published = false,          // if a duplicate was created as published
      email_reason,               // optional, not used for logic
    } = body ?? {};

    if (!location_id || !date || !start_time || !end_time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Insert the new shift
    await executeQuery(
      `INSERT INTO shifts
         (assignee_id, status, location_id, date, start_time, end_time, notes, type, published, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        assignee_id || null,
        status,
        location_id,
        date,
        start_time,
        end_time,
        notes || "",
        type,
        published ? 1 : 0,
      ]
    );

    // Get the new id
    const lastIdRows = (await executeQuery(`SELECT LAST_INSERT_ID() AS insertId`, [])) as any[];
    const insertId = Number(lastIdRows?.[0]?.insertId);
    if (!insertId) {
      return NextResponse.json({ error: "Failed to create shift (no id)" }, { status: 500 });
    }

    // Load the inserted row (with joins) for response + email/notifications
    const row = await fetchShiftRow(insertId);

    // Email only if created as published and has an assignee email
    if (row?.published && row?.assignee_id) {
      try {
        await sendShiftEmail({
          id: row.id,
          assignee_id: row.assignee_id,
          address: row.address,
          status: row.status,
          date: row.date,
          start_time: row.start_time,
          end_time: row.end_time,
          notes: row.notes,
        } as Shift);
      } catch (e) {
        console.warn("[CREATE SHIFT] publish email failed (non-fatal):", e);
      }
    }

    // Bell/web notification + DB record (insertNotification ignores "Unpublished")
    try {
      await insertNotification(row.id, row.status, row.assignee_id || undefined);
    } catch (e) {
      console.warn("[CREATE SHIFT] web notification failed (non-fatal):", e);
    }

    return NextResponse.json(
      {
        success: true,
        ...row,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("[CREATE SHIFT] error:", e);
    return NextResponse.json({ error: "Failed to create shift" }, { status: 500 });
  }
}

// PATCH /api/shifts  (Bulk publish; optional month/year filters)
// Only flips unpublished→published and only emails those that changed.
export async function PATCH(request: NextRequest) {
  try {
    const tokenRes = await verifyAPIToken(request);
    if (!tokenRes.ok) return tokenRes;
        
    const { month, year } = await request.json();

    const conditions: string[] = [];
    const vals: any[] = [];

    if (month) {
      conditions.push("MONTH(date) = ?");
      vals.push(month);
    }
    if (year) {
      conditions.push("YEAR(date) = ?");
      vals.push(year);
    }

    // Select the set of rows that are currently unpublished and match filters
    const toPublish = (await executeQuery(
      `SELECT s.id, s.assignee_id, s.status, DATE_FORMAT(s.date, '%Y-%m-%d') as date,
              s.start_time, s.end_time, s.notes,
              l.address
         FROM shifts s
         INNER JOIN locations l ON s.location_id = l.id
        WHERE s.published = 0 ${conditions.length ? "AND " + conditions.join(" AND ") : ""}`,
      vals
    )) as any[];

    if (!toPublish?.length) {
      return NextResponse.json({ success: true, publishedCount: 0 });
    }

    // Perform the update
    await executeQuery(
      `UPDATE shifts SET published = 1
        WHERE published = 0 ${conditions.length ? "AND " + conditions.join(" AND ") : ""}`,
      vals
    );

    // Send emails + notifications only for those that actually changed
    for (const shift of toPublish) {
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

      try {
        if (assignee_id) {
          await sendShiftEmail({ id, assignee_id, address, status, date, start_time, end_time, notes } as Shift);
        }

        await insertNotification(id, status, assignee_id || undefined);
      } catch (err) {
        console.warn("[BULK PUBLISH] email/notification failed for shift", id, err);
        // continue with others
      }
    }

    return NextResponse.json({ success: true, publishedCount: toPublish.length });
  } catch (error) {
    console.error("Error publishing bulk shifts", error);
    return NextResponse.json({ error: "Failed to publish bulk shifts" }, { status: 500 });
  }
}
