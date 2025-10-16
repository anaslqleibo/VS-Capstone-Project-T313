import { isAdmin } from "@/app/api/users/[id]/is_admin";
import { executeQuery } from "@/app/lib/db";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request : NextRequest, context: RouteContext<'/api/unavailabilities/leaves/[id]/[month]'>) {
    try{
        const {id, month} = await context.params;
        const admin = await isAdmin(id);
        
        const targetMonth = month;
        const targetYear = 2025;

        const startOfMonth = dayjs(`${targetYear}-${targetMonth}-01`).startOf("month");
        const endOfMonth = dayjs(`${targetYear}-${targetMonth}-01`).endOf("month");

        const start = startOfMonth.subtract(14, "day");
        const end = endOfMonth.add(14, "day");

        const format = (d: dayjs.Dayjs) => d.format("YYYY-MM-DD");

        let leaves;
        if (admin) {
            leaves = await executeQuery(
                `SELECT s.id as id, s.assignee_id as assignee_id, s.status as status, s.type as type, DATE_FORMAT(s.date, '%Y-%m-%d') as date, DATE_FORMAT(s.end_date, '%Y-%m-%d') as end_date, s.start_time as start_time, s.end_time as end_time, s.day_of_week as day_of_week, CONCAT(u.first_name," ", u.last_name) as employee, s.recurrence as recurrence FROM shifts s INNER JOIN users u ON s.assignee_id = u.id WHERE day_of_week IS NULL AND s.type = "leave" AND status != "Declined" AND s.date BETWEEN ? AND ?`, [format(start), format(end)]
            );
        }
        else {
            leaves = await executeQuery(
            `SELECT s.id as id, s.assignee_id as assignee_id, s.status as status, s.type as type, DATE_FORMAT(s.date, '%Y-%m-%d') as date, DATE_FORMAT(s.end_date, '%Y-%m-%d') as end_date, s.start_time as start_time, s.end_time as end_time, s.day_of_week as day_of_week, CONCAT(u.first_name," ", u.last_name) as employee, s.recurrence as recurrence FROM shifts s INNER JOIN users u ON s.assignee_id = u.id WHERE u.id = ? AND day_of_week IS NULL AND s.type = "leave" AND s.date BETWEEN ? AND ?`,
            [id, format(start), format(end)]
            );
        }

        const leavesArray = Array.isArray(leaves) ? leaves : [];
        return NextResponse.json(leavesArray);
    }
    catch (error) {
        console.error("Error fetching leaves:", error);
        return NextResponse.json({ error: "Failed to fetch leaves" }, { status: 500 });
    }
};

