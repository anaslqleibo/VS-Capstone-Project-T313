import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";

export async function generateUniqueShiftId(userUID: string) {
    try{
        const generatedId = await executeQuery("SELECT COALESCE(MAX(id),0)+1 as id FROM shifts WHERE user_id = ?", [userUID]) as Array<{id: number}>;

        return generatedId[0].id;
    }
    catch (error) {
        console.error("Error fetching generated id:", error);
        return NextResponse.json({ error: "Failed to fetch generated id" }, { status: 500 });
    }
}