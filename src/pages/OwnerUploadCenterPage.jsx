import AppShell, { AppPageLayout } from "../components/app/AppShell.jsx";
import UploadCenterWorkspace from "../components/uploads/UploadCenterWorkspace.jsx";
import { useAuth } from "../lib/AuthContext.jsx";
import "../styles/owner-upload-center.css";

export default function OwnerUploadCenterPage() {
  const { user } = useAuth();

  return (
    <AppShell active="Upload Center" role="Company Owner" roleId="owner" user={user?.name || "Company Owner"}>
      <AppPageLayout
        className="upload-center-page"
        title="Upload Center"
        subtitle="Upload files with scope, visibility, selected-user sharing, download, delete, and permission controls."
      >
        <UploadCenterWorkspace view="upload" showHeader={false} />
      </AppPageLayout>
    </AppShell>
  );
}
