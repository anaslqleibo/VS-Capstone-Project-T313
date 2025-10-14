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
                `SELECT n.id as id, n.type as type, DATE_FORMAT(n.updated_at, '%Y-%m-%d') as date, s.id as shift_id, DATE_FORMAT(s.date, '%Y-%m-%d') as shift_date, DATEDIFF(s.date, NOW()) as days_left, CONCAT(u.first_name, ' ', u.last_name) AS assignee_name, s.start_time as start_time, s.end_time as end_time, l.name as location_name FROM notifications n INNER JOIN shifts s ON n.shift_id = s.id LEFT JOIN users u ON s.assignee_id = u.id LEFT JOIN locations l ON s.location_id = l.id LEFT JOIN user_notifications un ON un.notification_id = n.id AND un.user_id = ? WHERE (un.is_read = 0 OR un.is_read IS NULL) AND n.type NOT IN ("Assigned", "Leave Accepted", "Leave Declined") AND ((n.type != "Unassigned" AND n.type != "Open") OR ((n.type = "Unassigned" OR n.type = "Open") AND DATEDIFF(s.date, CURRENT_DATE()) <= 7 AND DATEDIFF(s.date, CURRENT_DATE()) >= 0)) AND s.published = 1 ORDER BY n.updated_at DESC LIMIT 10`, [p.id]
            );
        }
        else {
            notifications = await executeQuery(
                `SELECT n.id as id, n.type as type, DATE_FORMAT(n.updated_at, '%Y-%m-%d') as date, s.id as shift_id, DATE_FORMAT(s.date, '%Y-%m-%d') as shift_date, DATEDIFF(s.date, NOW()) as days_left, CONCAT(u.first_name, ' ', u.last_name) AS assignee_name, s.start_time as start_time, s.end_time as end_time, l.name as location_name FROM notifications n INNER JOIN shifts s ON n.shift_id = s.id LEFT JOIN users u ON s.assignee_id = u.id LEFT JOIN locations l ON s.location_id = l.id LEFT JOIN user_notifications un ON un.notification_id = n.id AND un.user_id = ? WHERE (un.is_read = 0 OR un.is_read IS NULL) AND n.type NOT IN ("Request","Accepted","Declined","Leave Request","Unassigned") AND (u.id = ? OR n.type = "Open") AND s.published = 1 ORDER BY n.updated_at DESC LIMIT 10`,
                [p.id, p.id]
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

export async function POST(request : NextRequest, context: RouteContext<'/api/notifications/[id]'>) {
    try{
        const p = await context.params;
        const [res] = await executeQuery(
                `SELECT EXISTS(
                SELECT 1 FROM notifications n INNER JOIN shifts s ON n.shift_id = s.id LEFT JOIN users u ON s.assignee_id = u.id LEFT JOIN locations l ON s.location_id = l.id WHERE n.is_read_by_admin = 0 AND n.type NOT IN ('Assigned', 'Leave Accepted', 'Leave Declined') AND ((n.type != 'Unassigned' AND n.type != 'Open') OR ((n.type = 'Unassigned' OR n.type = 'Open') AND DATEDIFF(s.date, CURRENT_DATE()) <= 7 AND DATEDIFF(s.date, CURRENT_DATE()) >= 0)
                )) AS found;`,
            ) as any[];

        
        return NextResponse.json({found: res.found});
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
    const { user_id } = body; 
    if (!user_id) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    }

    // Check if record already exists
    const existing = await executeQuery(
      `SELECT * FROM user_notifications WHERE notification_id = ? AND user_id = ?`,
      [id, user_id]
    ) as any[];

    if (existing.length > 0) {
      // Update existing record
      await executeQuery(
        `UPDATE user_notifications SET is_read = 1 WHERE notification_id = ? AND user_id = ?`,
        [id, user_id]
      );
    } else {
      // Insert new record
      await executeQuery(
        `INSERT INTO user_notifications (notification_id, user_id, is_read) VALUES (?, ?, 1)`,
        [id, user_id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating notification read status", error);
    return NextResponse.json(
      { error: "Failed to update notification read status" },
      { status: 500 }
    );
  }
}

