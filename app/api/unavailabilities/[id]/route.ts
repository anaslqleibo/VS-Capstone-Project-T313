import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";

export async function GET (request : Request, {params}: { params: {id: string }}){
    try{
        const p = await params;
        const isAdmin = await p.id === "-1";
        let unavailabilities;
        
        if (isAdmin) {
            unavailabilities = await executeQuery(
                `SELECT s.id as id, s.assignee_id as assignee_id, s.status as status, s.type as type,  DATE_FORMAT(s.date, '%Y-%m-%d') as date, s.end_date as end_date, s.start_time as start_time, s.end_time as end_time, s.day_of_week as day_of_week, CONCAT(u.first_name," ", u.last_name) as employee FROM shifts s INNER JOIN users u ON s.assignee_id = u.id WHERE day_of_week IS NOT NULL AND s.type = "unavailability"`
            );
        }
        else {
            unavailabilities = await executeQuery(
            `SELECT s.id as id, s.assignee_id as assignee_id, s.status as status, s.type as type,  DATE_FORMAT(s.date, '%Y-%m-%d') as date, s.end_date as end_date, s.start_time as start_time, s.end_time as end_time, s.day_of_week as day_of_week, CONCAT(u.first_name," ", u.last_name) as employee FROM shifts s INNER JOIN users u ON s.assignee_id = u.id WHERE u.id = ? AND day_of_week IS NOT NULL AND s.type = "unavailability"`,
            [params.id]
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
