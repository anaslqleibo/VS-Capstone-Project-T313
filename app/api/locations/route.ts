import { executeQuery } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try{
        const locations = await executeQuery(
            `SELECT id, name, address, notes FROM locations ORDER BY name` 
        );

        const locationsArray = Array.isArray(locations) ? locations : [];
        return NextResponse.json(locationsArray);
    }
    catch (error) {
        console.error("Error fetching locations:", error);
        return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 });
    }
};