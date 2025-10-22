import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { verifyAPIToken } from "@/app/lib/auth";

export async function GET(request: NextRequest, context: RouteContext<'/api/users/[id]/email'>) {
  try {
    const tokenRes = await verifyAPIToken(request);
    if (!tokenRes.ok) return tokenRes;
        
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