import { executeQuery } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const payrates = await executeQuery(`SELECT id, job_title, age_group, level, specialty, weekday, saturday, sunday, public_holiday FROM pay_rates`);

    return NextResponse.json(Array.isArray(payrates) ? payrates : []);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch pay rates" }, { status: 500 });
  }
}

// export async function POST(request: NextRequest, _context: any) {
//   try {
//     const { job_title, age_group, level, specialty } = await request.json();

//     const payrates = await executeQuery(`SELECT id, job_title, age_group, level, specialty, day_type, amount FROM pay_rates`);

//     return NextResponse.json(Array.isArray(payrates) ? payrates : []);
//   } catch (error) {
//     return NextResponse.json({ error: "Failed to fetch pay rates" }, { status: 500 });
//   }
// }
