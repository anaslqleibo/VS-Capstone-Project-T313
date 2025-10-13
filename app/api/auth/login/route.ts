import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import bcrypt from "bcryptjs";
import { createToken } from "@/app/lib/auth";

type Role = "admin" | "user";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: Role;
}

// tiny helper to detect bcrypt hashes ($2a/$2b/$2y)
function isBcryptHash(value: unknown): value is string {
  return typeof value === "string" && /^\$2[aby]\$/.test(value);
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

    // Get user by email (CASE-INSENSITIVE)
    const users = await executeQuery(
      "SELECT id, first_name, last_name, email, password, role FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1",
      [email]
    ) as User[];

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const user = users[0];

    // Verify password: support BOTH bcrypt and plaintext
    let isPasswordValid = false;
    if (isBcryptHash(user.password)) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // plaintext stored in DB → compare directly
      isPasswordValid = user.password === password;

      // OPTIONAL: auto-upgrade plaintext to bcrypt on successful login
      if (isPasswordValid) {
        try {
          const newHash = await bcrypt.hash(password, 10);
          await executeQuery("UPDATE users SET password = ? WHERE id = ?", [newHash, user.id]);
        } catch (rehashErr) {
          // non-fatal; proceed even if rehash fails
          console.warn("[LOGIN] Rehash failed for user id:", user.id, rehashErr);
        }
      }
    }

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
      lastName: user.last_name,
      role: user.role,
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