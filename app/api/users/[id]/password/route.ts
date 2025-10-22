import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import bcrypt from "bcryptjs";
import { verifyAPIToken } from "@/app/lib/auth";

export async function PATCH(request: NextRequest, context: RouteContext<'/api/users/[id]/password'>) {
  try {
    const tokenRes = await verifyAPIToken(request);
    if (!tokenRes.ok) return tokenRes;
        
    const { id } = await context.params;
    const { password } = await request.json();

    console.log("BRO", password);
    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }
    
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await executeQuery(
      `UPDATE users SET password = ? WHERE id = ?`,
      [hashedPassword, id]
    ) as any;

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user password:", error);
    return NextResponse.json(
      { error: "Failed to update user password" },
      { status: 500 }
    );
  }
};
