import { NotificationType } from "../controllers/Notification";
import { ShiftStatus } from "../controllers/Shifts";
import { executeQuery } from "./db";

/**
 * Store notification to notifications table
 */

export async function insertNotification(shift_id:string, status:ShiftStatus, assignee_id?:string, is_leave=false){
  if (is_leave){
    if (status === 'Pending' || status === 'Accepted' || status === 'Declined'){
      const modifiedStatus = status === 'Pending' ? 'Request' : status;
      
      const res = storeNotification(shift_id, ("Leave " + modifiedStatus) as NotificationType, assignee_id);
      if (!res) console.warn('Failed to store notification to database.'); 
    }
    else {
      console.warn('Invalid status type');
    }
  }
  else{
    if (status !== 'Unpublished'){
      const res = storeNotification(shift_id, (status==="Pending" ? "Assigned" : status), assignee_id);
      if (!res) console.warn('Failed to store notification to database.');
    }
  }
  
}

export async function storeNotification(shift_id:string, type:NotificationType, assignee_id?:string) {
  try {
    const [existingNotif] = await executeQuery(`SELECT shift_id FROM notifications WHERE shift_id = ?`, [shift_id]) as any[];

    let affectedRows = 0;
    if (existingNotif){
        console.log("update notification db");
        affectedRows = (await executeQuery(
            `UPDATE notifications SET type = ? WHERE shift_id = ?`, 
            [type, shift_id]
        ) as any).affectedRows;

        const [notif] = await executeQuery(`SELECT id FROM notifications WHERE shift_id = ?`, 
            [shift_id]) as any[];

        notif && notif.id && assignee_id && await executeQuery(`UPDATE user_notifications SET is_read = ? WHERE notification_id = ? AND user_id = ?`, 
            [0, notif.id, assignee_id]);
    }
    else{
        console.log("insert notification db");

        affectedRows = (await  executeQuery(
            `INSERT INTO notifications 
            (shift_id, type) VALUES (?, ?)`, 
            [shift_id, type]
        ) as any).affectedRows;

    }
    
    return (affectedRows!==0);

  } catch (err) {
    console.error("❌ Failed to store notification:", err);
  }
}
