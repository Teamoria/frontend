import AppShell from "../components/app/AppShell.jsx";
import UploadCenterWorkspace from "../components/uploads/UploadCenterWorkspace.jsx";
import { useAuth } from "../lib/AuthContext.jsx";
import "../styles/owner-upload-center.css";

export default function OwnerUploadedFilesPage() {
  const { user } = useAuth();

  return (
    <AppShell active="Upload Center" role="Company Owner" roleId="owner" user={user?.name || "Company Owner"}>
      <UploadCenterWorkspace view="files" />
    </AppShell>
  );
}
