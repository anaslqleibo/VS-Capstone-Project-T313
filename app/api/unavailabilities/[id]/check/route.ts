import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { RowDataPacket } from "mysql2";
import { Route } from "next";



export async function POST(request : NextRequest, context: RouteContext<'/api/unavailabilities/[id]/check'>) {
    try{
        const p = await context.params;
        const {date, start_time, end_time} = await request.json();
        const user_id = p.id;
        const rows: { shift: RowDataPacket[]; leave: RowDataPacket[]; unavailability: RowDataPacket[] } = {
            shift: [],
            leave: [],
            unavailability: [],
        };

        // Check for shifts
        let query = `SELECT s.status as status, DATE_FORMAT(s.start_time, '%H:%i') as start_time, DATE_FORMAT(s.end_time, '%H:%i') as end_time, l.name as location_name, l.address as address FROM shifts s INNER JOIN locations l ON s.location_id = l.id WHERE s.assignee_id = ? AND s.type = "shift" AND date = ? AND status != "Declined"`;
        let paramsQuery = [user_id, date];
        if (start_time && end_time)
        {
            query += ' AND ((start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?) OR (start_time > ? AND end_time < ?))';
            paramsQuery.push(start_time, start_time, end_time, end_time, start_time, end_time)
        }
        const rowsShifts = await executeQuery(query, paramsQuery);
        rows.shift = rowsShifts as RowDataPacket[];

        // Check for leaves
        query = 'SELECT DATE_FORMAT(date, "%d-%m-%Y") as date, DATE_FORMAT(end_date, "%d-%m-%Y") as end_date, status, recurrence, DATE_FORMAT(start_time, "%H:%i") as start_time, DATE_FORMAT(end_time, "%H:%i") as end_time FROM shifts WHERE assignee_id = ? AND type = "leave" AND date <= ? AND end_date >= ?';
        paramsQuery = [user_id, date, date];
        if (start_time && end_time)
        {
            query += ' AND ((start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?) OR (start_time > ? AND end_time < ?))';
            paramsQuery.push(start_time, start_time, end_time, end_time, start_time, end_time)
        }
        const rowsLeaves  = await executeQuery(query, paramsQuery);
        rows.leave = rowsLeaves as RowDataPacket[];


        // Check for unavailabilities
        if (start_time && end_time){
            query = 'SELECT DATE_FORMAT(date, "%d-%m-%Y") as date, status, day_of_week, DATE_FORMAT(start_time, "%H:%i") as start_time, DATE_FORMAT(end_time, "%H:%i") as end_time FROM shifts WHERE assignee_id = ? AND day_of_week IS NOT NULL AND DAYNAME(?) = day_of_week AND type = "unavailability" AND ((start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?) OR (start_time > ? AND end_time < ?))';
            paramsQuery = [user_id, date, start_time, start_time, end_time, end_time, start_time, end_time]
            const rowsUnavail  = await executeQuery(query, paramsQuery);
            rows.unavailability = rowsUnavail as RowDataPacket[];;
        }
        
    
        if (rows.shift.length > 0 || rows.leave.length > 0 || rows.unavailability.length > 0) {
            return NextResponse.json({ shift:rows.shift[0], leave: rows.leave[0],  unavailability: rows.unavailability[0]} );
        } else {
            return NextResponse.json({ status: "available" });
        }
    }
    catch (error) {
        console.error("Error checking unavailablities:", error);
        return NextResponse.json({ error: "Failed to check unavailabilities" }, { status: 500 });
    }
}
