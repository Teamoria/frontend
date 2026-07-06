import AppShell, { AppPageLayout } from "../components/app/AppShell.jsx";
import UploadCenterWorkspace from "../components/uploads/UploadCenterWorkspace.jsx";
import { useAuth } from "../lib/AuthContext.jsx";
import "../styles/owner-upload-center.css";

export default function UploadCenterPage() {
  const { user, normalizedRole } = useAuth();
  const role = normalizedRole === "admin" ? "Admin" : normalizedRole === "company_member" ? "Employee" : "Project Manager";

  return (
    <AppShell active="Upload Center" role={role} roleId={normalizedRole} user={user?.name || role}>
      <AppPageLayout
        className="upload-center-page"
        title="Upload Center"
        subtitle="Upload files with scope, visibility, selected-user sharing, download, delete, and permission controls."
      >
        <UploadCenterWorkspace showHeader={false} />
      </AppPageLayout>
    </AppShell>
  );
}
