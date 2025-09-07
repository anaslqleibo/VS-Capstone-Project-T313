import { executeQuery } from "@/app/lib/db";
import { RowDataPacket } from "mysql2";

export async function isAdmin(user_id: string){
    const result = await executeQuery(`SELECT role FROM users WHERE id = ?`, [user_id]) as RowDataPacket[];
    
    return result.length > 0 && result[0].role === "admin";
}