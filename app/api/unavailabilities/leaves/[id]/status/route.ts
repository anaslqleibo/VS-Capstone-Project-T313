import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";

export async function PATCH(req: Request, context: RouteContext<'/api/unavailabilities/leaves/[id]/status'>) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { user_id, is_accepted } = body;

    if (is_accepted === undefined) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }
    
    console.log(user_id, id, is_accepted);
    const result = await executeQuery(
      `UPDATE shifts SET status = ? WHERE id = ? AND assignee_id = ?`,
      [is_accepted ? "Accepted" : "Declined", id, user_id]
    ) as any;

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Leave not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, status: 200 });
  } catch (error) {
    console.error("Error updating leave status:", error);
    return NextResponse.json(
      { error: "Failed to update leave status" },
      { status: 500 }
    );
  }
};
