import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/db";
import { isAdmin } from "@/app/api/users/[id]/is_admin";


export async function GET(request : NextRequest, context: RouteContext<'/api/notifications/[id]'>) {
    try{
        const p = await context.params;
        const admin = await isAdmin(p.id);
        let notifications;  
        
        if (admin) {
            notifications = await executeQuery(
                `SELECT n.id as id, n.type as type, DATE_FORMAT(n.updated_at, '%d-%m-%Y') as date, s.id as shift_id, DATE_FORMAT(s.date, '%d-%m-%Y') as shift_date, DATEDIFF(s.date, NOW()) as days_left, CONCAT(u.first_name, ' ', u.last_name) AS assignee_name, s.start_time as start_time, s.end_time as end_time, l.name as location_name FROM notifications n INNER JOIN shifts s ON n.shift_id = s.id LEFT JOIN users u ON s.assignee_id = u.id LEFT JOIN locations l ON s.location_id = l.id WHERE n.is_read_by_admin = 0 AND n.type != "Assigned" AND n.type != "Leave Accepted" AND n.type != "Leave Declined" ORDER BY n.updated_at DESC LIMIT 10`,
            );
        }
        else {
            notifications = await executeQuery(
                `SELECT n.id as id, n.type as type, DATE_FORMAT(n.updated_at, '%d-%m-%Y') as date, s.id as shift_id, DATE_FORMAT(s.date, '%d-%m-%Y') as shift_date, DATEDIFF(s.date, NOW()) as days_left, CONCAT(u.first_name, ' ', u.last_name) AS assignee_name, s.start_time as start_time, s.end_time as end_time, l.name as location_name FROM notifications n INNER JOIN shifts s ON n.shift_id = s.id LEFT JOIN users u ON s.assignee_id = u.id LEFT JOIN locations l ON s.location_id = l.id WHERE n.is_read_by_assignee = 0 AND n.type != "Request" AND n.type != "Accepted" AND n.type != "Declined" AND n.type != "Leave Request" AND u.id = ? ORDER BY n.updated_at DESC LIMIT 10`,
                [p.id]
            );
        }

        const result = Array.isArray(notifications) ? notifications : [];
        return NextResponse.json(result);
    }
    catch (error) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
    }
};


export async function PATCH(req: NextRequest, context: RouteContext<'/api/notifications/[id]'>) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { is_admin } = body;

    const update = is_admin ? 'is_read_by_admin' : 'is_read_by_assignee';
    const result = await executeQuery(
      `UPDATE notifications SET ${update} = 1 WHERE id = ?`,
      [id]
    ) as any;

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true});
  } catch (error) {
    console.error("Error updating notification read status", error);
    return NextResponse.json(
      { error: "Failed to update notification read status" },
      { status: 500 }
    );
  }
};
