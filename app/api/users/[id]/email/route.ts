import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";

export async function GET(request: NextRequest, context: RouteContext<'/api/users/[id]/email'>) {
  try {

    const { id } = await context.params;

    const [user] = await executeQuery(`SELECT email FROM user WHERE id = ?`, [id]) as any[];

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({email: user.email});
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}