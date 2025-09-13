import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";


export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;

    const payrates = await executeQuery(`SELECT id, job_title, day_type, amount FROM pay_rates WHERE id = ?`, [id]);

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