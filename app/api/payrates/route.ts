import { verifyAPIToken } from "@/app/lib/auth";
import { executeQuery } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const tokenRes = await verifyAPIToken(request);
    if (!tokenRes.ok) return tokenRes;
        
    const payrates = await executeQuery(`SELECT id, job_title, age_group, level, specialty, weekday, saturday, sunday, public_holiday FROM pay_rates`);

    return NextResponse.json(Array.isArray(payrates) ? payrates : []);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch pay rates" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, _context: any) {
  try {
    const tokenRes = await verifyAPIToken(request);
    if (!tokenRes.ok) return tokenRes;
        
    const { job_title, age_group, level, specialty, weekday, saturday, sunday, public_holiday } = await request.json();

    const payrate = await executeQuery(`INSERT INTO pay_rates (job_title, age_group, level, weekday, saturday, sunday, public_holiday, specialty) VALUES (?,?,?,?,?,?,?,?)`, [job_title, age_group,level,weekday,saturday,sunday,public_holiday?public_holiday:sunday,specialty?specialty:null]);

    return NextResponse.json({ success: true , new_id: (payrate as any).insertId});
  } catch (error) {
    return NextResponse.json({ error: "Failed to add pay rate" }, { status: 500 });
  }
}
