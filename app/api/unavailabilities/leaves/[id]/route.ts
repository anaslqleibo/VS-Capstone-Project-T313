import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";

export async function GET(request : Request, {params}: { params: {id: string }}) {
    try{
        const p = await params;
        const isAdmin = p.id === "-1";

        let leaves;
        
        if (isAdmin) {
            leaves = await executeQuery(
                `SELECT s.id as id, s.assignee_id as assignee_id, s.status as status, s.type as type, DATE_FORMAT(s.date, '%Y-%m-%d') as date, DATE_FORMAT(s.end_date, '%Y-%m-%d') as end_date, s.start_time as start_time, s.end_time as end_time, s.day_of_week as day_of_week, CONCAT(u.first_name," ", u.last_name) as employee, s.recurrence as recurrence FROM shifts s INNER JOIN users u ON s.assignee_id = u.id WHERE day_of_week IS NULL AND s.type = "leave"`
            );
        }
        else {
            leaves = await executeQuery(
            `SELECT s.id as id, s.assignee_id as assignee_id, s.status as status, s.type as type, DATE_FORMAT(s.date, '%Y-%m-%d') as date, DATE_FORMAT(s.end_date, '%Y-%m-%d') as end_date, s.start_time as start_time, s.end_time as end_time, s.day_of_week as day_of_week, CONCAT(u.first_name," ", u.last_name) as employee, s.recurrence as recurrence FROM shifts s INNER JOIN users u ON s.assignee_id = u.id WHERE u.id = ? AND day_of_week IS NULL AND s.type = "leave"`,
            [p.id]
            );
        }

        const leaversArray = Array.isArray(leaves) ? leaves : [];
        return NextResponse.json(leaversArray);
    }
    catch (error) {
        console.error("Error fetching leaves:", error);
        return NextResponse.json({ error: "Failed to fetch leaves" }, { status: 500 });
    }
};

