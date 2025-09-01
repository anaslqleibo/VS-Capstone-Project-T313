import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import bcrypt from "bcryptjs";
import { createToken } from "@/app/lib/auth";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
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

    // Get user by email
    const users = await executeQuery(
      "SELECT id, first_name, last_name, email, password FROM users WHERE email = ?",
      [email]
    ) as User[];

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const user = users[0];

    // Verify password
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    const isPasswordValid = password === user.password;

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate JWT token using the auth utility
    const token = await createToken({
      userId: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name
    });

    // Update last login
    await executeQuery(
      "UPDATE users SET last_login = NOW() WHERE id = ?",
      [user.id]
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: "Login successful",
      user: userWithoutPassword,
      token
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 