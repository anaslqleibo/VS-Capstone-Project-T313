import { NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";

export async function GET(request : Request, {params}: { params: {id: string }}) {
    try{
        const p = await params;
        const isAdmin = p.id === "-1";

        let leaves;
        
        if (isAdmin) {
            leaves = await executeQuery(
                `SELECT s.id as id, s.user_id as user_id, s.start_date as start_date, s.end_date as end_date, s.start_time as start, s.end_time as end, s.day_of_week as day_of_week, CONCAT(u.first_name," ", u.last_name) as employee FROM unavailabilities s INNER JOIN users u ON s.user_id = u.id WHERE day_of_week IS NULL`
            );
        }
        else {
            leaves = await executeQuery(
            `SELECT s.id as id, s.user_id as user_id, s.start_date as start_date, s.end_date as end_date, s.start_time as start, s.end_time as end, s.day_of_week as day_of_week, CONCAT(u.first_name," ", u.last_name) as employee FROM unavailabilities s INNER JOIN users u ON s.user_id = u.id WHERE u.id = ? AND day_of_week IS NULL`,
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
