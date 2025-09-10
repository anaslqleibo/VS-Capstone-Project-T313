import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/auth";
import { executeQuery } from "@/app/lib/db";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    // Get user data from database
    const users = await executeQuery(
      "SELECT id, first_name, last_name, phone, email, role FROM users WHERE id = ?",
      [payload.userId]
    ) as any[];

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const user = users[0];

    return NextResponse.json({
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      }
    });

  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 