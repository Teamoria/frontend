import AppShell from "../components/app/AppShell.jsx";
import UploadCenterWorkspace from "../components/uploads/UploadCenterWorkspace.jsx";
import { useAuth } from "../lib/AuthContext.jsx";
import "../styles/owner-upload-center.css";

export default function UploadCenterPage() {
  const { user, normalizedRole } = useAuth();
  const role = normalizedRole === "admin" ? "Admin" : normalizedRole === "company_member" ? "Employee" : "Project Manager";

  return (
    <AppShell active="Upload Center" role={role} roleId={normalizedRole} user={user?.name || role}>
      <UploadCenterWorkspace />
    </AppShell>
  );
}
