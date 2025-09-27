import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { isAdmin } from "../../users/[id]/is_admin";

export async function GET (request : NextRequest, context: RouteContext<'/api/unavailabilities/[id]'>) {
    try{
        const p = await context.params;
        const admin = await isAdmin(p.id);
        let unavailabilities;
        
        if (admin) {
            unavailabilities = await executeQuery(
                `SELECT s.id as id, s.assignee_id as assignee_id, s.status as status, s.type as type,  DATE_FORMAT(s.date, '%Y-%m-%d') as date, s.end_date as end_date, s.start_time as start_time, s.end_time as end_time, s.day_of_week as day_of_week, CONCAT(u.first_name," ", u.last_name) as employee FROM shifts s INNER JOIN users u ON s.assignee_id = u.id WHERE day_of_week IS NOT NULL AND s.type = "unavailability"`
            );
        }
        else {
            unavailabilities = await executeQuery(
            `SELECT s.id as id, s.assignee_id as assignee_id, s.status as status, s.type as type,  DATE_FORMAT(s.date, '%Y-%m-%d') as date, s.end_date as end_date, s.start_time as start_time, s.end_time as end_time, s.day_of_week as day_of_week, CONCAT(u.first_name," ", u.last_name) as employee FROM shifts s INNER JOIN users u ON s.assignee_id = u.id WHERE u.id = ? AND day_of_week IS NOT NULL AND s.type = "unavailability"`,
            [p.id]
            );
        }

        const unavailabilitiesArray = Array.isArray(unavailabilities) ? unavailabilities : [];
        return NextResponse.json(unavailabilitiesArray);
    }
    catch (error) {
        console.error("Error fetching unavailablities:", error);
        return NextResponse.json({ error: "Failed to fetch unavailabilities" }, { status: 500 });
    }
}
