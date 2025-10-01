import { executeQuery } from "@/app/lib/db";
import bcrypt from "bcryptjs";
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

// POST: Add a new user with other details
export async function PUT(request: Request) {
  try {
    const { first_name, last_name, email, password, role, with_other_fields, assign_position, preferred_name, gender, date_of_birth, address, emergency_person, emergency_contact, pay_rate_id} = await request.json();
    if (!first_name || !last_name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

        // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await executeQuery(
      "SELECT id FROM users WHERE email = ?",
      [email]
    ) as any[];

    if (Array.isArray(existingUser) && existingUser.length > 0) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

   
    const result = await executeQuery(
      "INSERT INTO users (first_name, last_name, email, password, is_active, role) VALUES (?, ?, ?, ?, 1, ?)",
      [first_name, last_name, email, hashedPassword, (role!=='user'&&role!=='admin')?'user':role]
    ) as any;

    if (with_other_fields){
      const fields=[];
      const vals=[];

      fields.push('user_id');
      vals.push(result.insertId);

      if (preferred_name){
        fields.push('preferred_name');
        vals.push(preferred_name);
      }
      if (gender){
        fields.push('gender');
        vals.push(gender);
      }
      if (date_of_birth){
        fields.push('date_of_birth');
        vals.push(date_of_birth);
      }
      if (address){
        fields.push('address');
        vals.push(address);
      }
      if (emergency_person){
        fields.push('emergency_person');
        vals.push(emergency_person);
      }
      if (emergency_contact){
        fields.push('emergency_contact');
        vals.push(emergency_contact);
      }
      if (pay_rate_id){
        fields.push('pay_rate_id');
        vals.push(pay_rate_id);
      }

      await executeQuery(`INSERT INTO employee_details (${fields.join(',')}) VALUES (${fields.map(_e=>'?').join(',')})`, vals);
    }
    else if (assign_position && pay_rate_id){
      await executeQuery(`INSERT INTO employee_details (user_id, pay_rate_id) VALUE (?,?)`, [result.insertId, pay_rate_id])
    }
    
    return NextResponse.json({ success: true , new_id: result.insertId});
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