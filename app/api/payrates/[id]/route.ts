import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import RouteContext from "next";


export async function GET(request: NextRequest, context: RouteContext<'/api/payrates/[id]'>) {
  try {
    const { id } = await context.params;

    const payrates = await executeQuery(`SELECT id, job_title, age_group, level, specialty, day_type, amount FROM pay_rates WHERE id = ?`, [id]);

    if (!payrates || (Array.isArray(payrates) && payrates.length === 0)) {
      return NextResponse.json(
        { error: "Pay rate not found" },
        { status: 404 }
      );
    }

    const data = payrates;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching pay rate:", error);
    return NextResponse.json(
      { error: "Failed to fetch pay rate" },
      { status: 500 }
    );
  }
}