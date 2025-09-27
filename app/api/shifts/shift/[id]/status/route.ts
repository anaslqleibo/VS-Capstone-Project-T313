import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";

export async function PATCH(req: NextRequest, context: RouteContext<'/api/shifts/shift/[id]/status'>) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }
    
    const result = await executeQuery(
      `UPDATE shifts SET status = ? WHERE id = ?`,
      [status, id]
    ) as any;

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Shift not found or not owned by user" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true});
  } catch (error) {
    console.error("Error updating shift status:", error);
    return NextResponse.json(
      { error: "Failed to update shift status" },
      { status: 500 }
    );
  }
};
