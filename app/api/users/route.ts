import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";

// GET: Return all users
export async function GET() {
  try {
    const users = await executeQuery(
      "SELECT id, first_name, last_name, email, role FROM users"
    );
    return NextResponse.json(Array.isArray(users) ? users : []);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST: Add a new user (without notes)
export async function POST(request: Request) {
  try {
    const { first_name, last_name, email, password, role } = await request.json();
    if (!first_name || !last_name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    await executeQuery(
      "INSERT INTO users (first_name, last_name, email, password, is_active, role) VALUES (?, ?, ?, ?, 1, ?)",
      [first_name, last_name, email, password, role]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add user" }, { status: 500 });
  }
}

// DELETE: Delete a user by email (expects { email } in request body)
export async function DELETE(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    await executeQuery("DELETE FROM users WHERE email = ?", [email]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}