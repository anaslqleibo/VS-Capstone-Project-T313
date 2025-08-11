import { User } from "firebase/auth";

// Temporary utility class to detect account access, can be replaced later
export enum Role{
    Admin,
    Staff
}

export function getUserAccess(user: User){
    if (user.email === "admin@2bentrods.com"){
        return Role.Admin;
    }
    else return Role.Staff;
}