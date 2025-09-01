import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await executeQuery(`SELECT id, first_name, last_name, email, role FROM users WHERE id = ?`, [params.id]);

    if (!user || (Array.isArray(user) && user.length === 0)) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const contactData = Array.isArray(user) ? user[0] : user;
    return NextResponse.json(contactData);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}