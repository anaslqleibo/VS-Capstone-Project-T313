import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await executeQuery(`SELECT id, first_name, last_name, email, phone, role FROM users WHERE id = ?`, [params.id]);

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

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { first_name, last_name, email, phone } = body;

    const updates = [];
    const vals = [];

    if (!first_name && !last_name && !email && !phone){
      return NextResponse.json(
      { error: "Please provide atleast one field to update!" },
      { status: 401 }
      );
    }

    if (first_name) {
      updates.push('first_name = ?');
      vals.push(first_name);
    }
    if (last_name) {
      updates.push('last_name = ?');
      vals.push(last_name);
    }
    if (email) {
      updates.push('email = ?');
      vals.push(email);
    }
    if (phone) {
      updates.push('phone = ?');
      vals.push(phone);
    }
    vals.push(id);

    const result = await executeQuery(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, vals) as any;

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating user details:", error);
    return NextResponse.json(
      { error: "Failed to update user details" },
      { status: 500 }
    );
  }
}