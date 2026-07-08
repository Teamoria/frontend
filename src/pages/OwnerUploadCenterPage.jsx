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
        subtitle="Upload and manage Laravel-backed files, sharing, downloads, deletion, and AI processing status."
      >
        <UploadCenterWorkspace view="all" showHeader={false} />
      </AppPageLayout>
    </AppShell>
  );
}
