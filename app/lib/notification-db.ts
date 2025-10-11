import { NotificationType } from "../controllers/Notification";
import { ShiftStatus } from "../controllers/Shifts";
import { executeQuery } from "./db";

/**
 * Store notification to notifications table
 */

export async function insertNotification(shift_id:string, status:ShiftStatus){
  if (status !== 'Unpublished'){
    const res = storeNotification(shift_id, (status==="Pending" ? "Assigned" : status));
    if (!res) console.warn('Failed to store notification to database.');
  }
}

export async function storeNotification(shift_id:string, type:NotificationType, is_read_by_admin=false, is_read_by_assignee=false) {
  try {
    const [existingNotif] = await executeQuery(`SELECT shift_id FROM notifications WHERE shift_id = ?`, [shift_id]) as any[];

    let affectedRows = 0;
    if (existingNotif){
        console.log("update notification db");
        affectedRows = (await executeQuery(
            `UPDATE notifications SET type = ?, is_read_by_admin = ?, is_read_by_assignee = ? WHERE shift_id = ?`, 
            [type, is_read_by_admin, is_read_by_assignee, shift_id]
        ) as any).affectedRows;
    }
    else{
        console.log("insert notification db");

        affectedRows = (await  executeQuery(
            `INSERT INTO notifications 
            (shift_id, type, is_read_by_admin, is_read_by_assignee)
            VALUES (?, ?, ?, ?)`, 
            [shift_id, type, is_read_by_admin, is_read_by_assignee]
        ) as any).affectedRows;

    }
    
    return (affectedRows!==0);

  } catch (err) {
    console.error("❌ Failed to store notification:", err);
  }
}
