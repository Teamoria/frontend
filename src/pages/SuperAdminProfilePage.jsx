import { SuperAdminShell } from "./SuperAdminConsolePage.jsx";
import { ProfileContent } from "./ProfilePage.jsx";
import "../styles/profile.css";
import "../styles/super-admin-console.css";

export default function SuperAdminProfilePage() {
  return (
    <SuperAdminShell active="Profile">
      <ProfileContent />
    </SuperAdminShell>
  );
}
