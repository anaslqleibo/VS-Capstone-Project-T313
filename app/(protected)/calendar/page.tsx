"use client";

import { useAuth } from "@/app/contexts/AuthContext";
import AdminCalendarPage from "@/app/pages/admin/AdminCalendarPage";
import EmployeeDashboardPage from "@/app/pages/employee/EmployeeDashboardPage";

export default function CalendarPage() {
    const role = useAuth().user?.role;

    if (role === "admin")
        return <AdminCalendarPage/>;
    else if (role === "user")
        return <EmployeeDashboardPage/>;
    else return;
}