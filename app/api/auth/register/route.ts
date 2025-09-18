import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import bcrypt from "bcryptjs";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  created_at: Date;
}

interface InsertResult {
  insertId: number;
}

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password } = await request.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
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
    ) as User[];

    if (Array.isArray(existingUser) && existingUser.length > 0) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await executeQuery(
      `INSERT INTO users (first_name, last_name, email, password, created_at, updated_at) 
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [firstName, lastName, email, hashedPassword]
    ) as InsertResult;

    // Get the inserted user (without password)
    const newUser = await executeQuery(
      "SELECT id, first_name, last_name, email, created_at FROM users WHERE id = ?",
      [result.insertId]
    ) as User[];

    return NextResponse.json(
      { 
        message: "User registered successfully",
        user: Array.isArray(newUser) ? newUser[0] : newUser
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 