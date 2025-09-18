import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request, {params}: { params: {id: string}}) {
  try {
    const { id } = await params;
    const { password } = await req.json();

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
