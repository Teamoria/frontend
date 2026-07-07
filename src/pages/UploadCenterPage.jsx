import AppShell, { AppPageLayout } from "../components/app/AppShell.jsx";
import UploadCenterWorkspace from "../components/uploads/UploadCenterWorkspace.jsx";
import { useAuth } from "../lib/AuthContext.jsx";
import "../styles/owner-upload-center.css";

export default function UploadCenterPage() {
  const { user, normalizedRole } = useAuth();
  const isMember = normalizedRole === "company_member";
  const role = normalizedRole === "admin" ? "Admin" : normalizedRole === "company_member" ? "Employee" : "Project Manager";

  return (
    <AppShell active={isMember ? "Shared Files" : "Upload Center"} role={role} roleId={normalizedRole} user={user?.name || role}>
      <AppPageLayout
        className="upload-center-page"
        title={isMember ? "Shared Files" : "Upload Center"}
        subtitle={isMember ? "View and download files available to your account." : "Upload files with scope, visibility, selected-user sharing, download, delete, and permission controls."}
      >
        <UploadCenterWorkspace showHeader={false} />
      </AppPageLayout>
    </AppShell>
  );
}
