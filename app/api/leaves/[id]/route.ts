import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { isAdmin } from "@/app/api/users/[id]/is_admin";
import { verifyAPIToken } from "@/app/lib/auth";

export async function GET(request : NextRequest, context: RouteContext<'/api/leaves/[id]'>) {
    try{
        const tokenRes = await verifyAPIToken(request);
        if (!tokenRes.ok) return tokenRes;
        
        const p = await context.params;
        const admin = await isAdmin(p.id);

        let leaves;
        if (admin) {
            leaves = await executeQuery(
                `SELECT s.id as id, s.assignee_id as assignee_id, s.status as status, s.type as type, DATE_FORMAT(s.date, '%Y-%m-%d') as date, DATE_FORMAT(s.end_date, '%Y-%m-%d') as end_date, s.start_time as start_time, s.end_time as end_time, CONCAT(u.first_name," ", u.last_name) as employee, s.recurrence as recurrence FROM shifts s INNER JOIN users u ON s.assignee_id = u.id WHERE s.type = "leave" AND status != "Declined"`
            );
        }
        else {
            leaves = await executeQuery(
            `SELECT s.id as id, s.assignee_id as assignee_id, s.status as status, s.type as type, DATE_FORMAT(s.date, '%Y-%m-%d') as date, DATE_FORMAT(s.end_date, '%Y-%m-%d') as end_date, s.start_time as start_time, s.end_time as end_time, CONCAT(u.first_name," ", u.last_name) as employee, s.recurrence as recurrence FROM shifts s INNER JOIN users u ON s.assignee_id = u.id WHERE u.id = ? AND s.type = "leave"`,
            [p.id]
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
