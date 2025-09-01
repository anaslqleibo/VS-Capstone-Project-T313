"use client";

import { useAuth } from "@/app/contexts/AuthContext";
import AdminCalendarPage from "@/pages/admin/AdminCalendarPage";
import EmployeeDashboardPage from "@/pages/employee/EmployeeDashboardPage";

export default function CalendarPage() {
    const role = useAuth().user?.role;

    if (role === "admin")
        return <AdminCalendarPage/>;
    else if (role === "staff")
        return <EmployeeDashboardPage/>;
    else return;
}