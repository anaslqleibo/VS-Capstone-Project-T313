import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";

export async function GET(request: NextRequest, context: RouteContext<'/api/payrates/[id]'>) {
  try {
    const { id } = await context.params;

    const payrates = await executeQuery(`SELECT id, job_title, age_group, level, specialty, weekday, saturday, sunday, public_holiday FROM pay_rates WHERE id = ?`, [id]);

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


export async function PATCH(request: NextRequest, context: RouteContext<'/api/payrates/[id]'>) {
  try {
    const { id } = await context.params;
    const { job_title, age_group, level, specialty, weekday, saturday, sunday, public_holiday } = await request.json();

    const payrate = await executeQuery(`UPDATE pay_rates SET job_title = ?, age_group = ?, level = ?, weekday = ?, saturday = ?, sunday = ?, public_holiday = ?, specialty = ? WHERE id = ?`, [job_title, age_group,level,weekday,saturday,sunday,public_holiday?public_holiday:sunday,specialty?specialty:null, id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update pay-rate" }, { status: 500 });
  }
}


export async function DELETE(request: NextRequest, context: RouteContext<'/api/payrates/[id]'>) {
  try {
    const { id } = await context.params;
    const result = await executeQuery(`DELETE FROM pay_rates WHERE id = ?`, [id]) as any;


    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Pay rate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete pay rate" }, { status: 500 });
  }
}