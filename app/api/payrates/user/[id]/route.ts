import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";

export async function GET(request: NextRequest, context: RouteContext<'/api/payrates/user/[id]'>) {
  try {
    const { id } = await context.params;

    const payrates = await executeQuery(`SELECT p.weekday as weekday, p.saturday as saturday, p.sunday as sunday, p.public_holiday as holiday FROM pay_rates p INNER JOIN employee_details e ON e.pay_rate_id = p.id INNER JOIN users u ON u.id = e.user_id WHERE u.id = ?`, [id]);

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

