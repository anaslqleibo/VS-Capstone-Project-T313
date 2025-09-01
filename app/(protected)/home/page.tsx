"use client";
import { useAuth } from "@/app/contexts/AuthContext";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import EmployeeDashboardPage from "@/pages/employee/EmployeeDashboardPage";

export default function DashboardPage() {
    const role = useAuth().user?.role;

    if (role === "admin")
        return <AdminDashboardPage/>;
    else return <EmployeeDashboardPage/>;
}