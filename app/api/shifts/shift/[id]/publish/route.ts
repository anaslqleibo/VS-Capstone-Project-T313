import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";

export async function PATCH(req: Request, context: RouteContext<'/api/shifts/shift/[id]/publish'>) {
  try {
    const { id } = await context.params;
    if ( !id) {
      return NextResponse.json(
        { error: "Shift id not provided" },
        { status: 400 }
      );
    }
    
    const result = await executeQuery(
      `UPDATE shifts SET published = 1 WHERE id = ?`,
      [id]
    ) as any;

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Shift not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating shift status:", error);
    return NextResponse.json(
      { error: "Failed to update shift status" },
      { status: 500 }
    );
  }
};
