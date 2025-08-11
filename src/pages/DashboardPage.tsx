import { PageProps } from "../App";
import { Role } from "../classes/User";
import { useRole } from "../components/RoleContext";
import AdminDashboardPage from "./admin/AdminDashboardPage";
import EmployeeDashboardPage from "./employee/EmployeeDashboardPage";

export default function DashboardPage({modalContainer}: PageProps) {
    const role = useRole();

    if (role === Role.Admin)
        return <AdminDashboardPage modalContainer={modalContainer}/>;
    else return <EmployeeDashboardPage modalContainer={modalContainer}/>;
}