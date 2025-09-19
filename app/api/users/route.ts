import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";

// GET: Return all users
export async function GET() {
  try {
    const users = await executeQuery(`SELECT DISTINCT u.id as id, u.first_name as first_name, u.last_name as last_name, u.email as email, u.phone as phone, u.role as role, e.preferred_name as preferred_name, e.gender as gender, DATE_FORMAT(e.date_of_birth, '%d/%m/%Y') as date_of_birth, e.address as address, e.emergency_person as emergency_person, e.emergency_contact as emergency_contact, p.job_title as job_title, p.id as pay_rate_id FROM users u LEFT JOIN employee_details e ON e.user_id=u.id LEFT JOIN pay_rates p ON e.pay_rate_id = p.id`);

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