import { useEffect, useState } from "react";
import { FiCheckCircle, FiFileText, FiLock, FiMail, FiSave, FiShield, FiUser } from "react-icons/fi";
import AppShell from "../components/app/AppShell.jsx";
import { resetPassword, updateProfile } from "../lib/api.js";
import { useAuth } from "../lib/AuthContext.jsx";
import "../styles/profile.css";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <AppShell active="Profile" user={user?.name || "Admin User"} role={user?.role || "User"}>
      <ProfileContent />
    </AppShell>
  );
}

export function ProfileContent() {
  const { refreshUser, user } = useAuth();
  const [form, setForm] = useState(() => userToForm(user));
  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    new_password_confirmation: ""
  });
  const [status, setStatus] = useState({ type: "", message: "", loading: false });
  const [passwordStatus, setPasswordStatus] = useState({ type: "", message: "", loading: false });

  useEffect(() => {
    setForm(userToForm(user));
  }, [user]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updatePasswordField(field, value) {
    setPasswordForm((current) => ({ ...current, [field]: value }));
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setStatus({ type: "", message: "", loading: true });

    try {
      await updateProfile(form);
      await refreshUser();
      setStatus({ type: "success", message: "Profile updated successfully.", loading: false });
    } catch (error) {
      setStatus({ type: "error", message: error.message, loading: false });
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setPasswordStatus({ type: "", message: "", loading: true });

    try {
      await resetPassword(passwordForm);
      setPasswordForm({ old_password: "", new_password: "", new_password_confirmation: "" });
      setPasswordStatus({ type: "success", message: "Password updated successfully.", loading: false });
    } catch (error) {
      setPasswordStatus({ type: "error", message: error.message, loading: false });
    }
  }

  return (
    <main className="profile-command-page">
      <section className="profile-command-main">
        <section className="profile-identity-panel">
          <div className="profile-identity-main">
            <div className="profile-photo">{getInitials(user?.name || user?.email)}</div>
            <div>
              <span className="profile-eyebrow">Account Profile</span>
              <h1>{user?.name || "User Profile"}</h1>
              <p>{user?.email || "No email"}</p>
              <div className="profile-chip-row">
                <span>{formatLabel(user?.role || "user")}</span>
                <span>{formatLabel(user?.status || "active")}</span>
                <span>{user?.timezone || "Asia/Hebron"}</span>
              </div>
            </div>
          </div>
          <div className="profile-status-card">
            <FiShield aria-hidden="true" />
            <div>
              <small>Permission Level</small>
              <strong>{user?.role === "admin" ? "Platform Admin" : formatLabel(user?.role || "User")}</strong>
            </div>
          </div>
        </section>

        <section className="profile-overview-grid">
          <article>
            <FiUser aria-hidden="true" />
            <div>
              <b>Identity</b>
              <span>Loaded from the authenticated backend profile.</span>
            </div>
          </article>
          <article>
            <FiMail aria-hidden="true" />
            <div>
              <b>Email</b>
              <span>{user?.email || "No email available"}</span>
            </div>
          </article>
          <article>
            <FiCheckCircle aria-hidden="true" />
            <div>
              <b>Admin visibility</b>
              <span>{user?.role === "admin" ? "Admin pages enabled" : "Admin pages hidden"}</span>
            </div>
          </article>
        </section>

        <section className="profile-info-panel">
          <header>
            <h2>Profile Source</h2>
            <p>Current profile details are synced from the API and refreshed after changes.</p>
          </header>
          <div className="profile-access-grid">
            <article>
              <div><i aria-hidden="true" /><b>Current Profile</b></div>
              <strong>GET /api/v1/profile</strong>
              <p>Identity, status, timezone, and role are loaded after login.</p>
            </article>
            <article>
              <div><i aria-hidden="true" /><b>Protected Fields</b></div>
              <strong>Role protected</strong>
              <p>Profile updates do not send company_id, role, or status.</p>
            </article>
          </div>
        </section>
      </section>

      <aside className="profile-control-panel">
        <form onSubmit={handleProfileSubmit}>
          <div className="profile-control-head">
            <div>
              <h2>Account Details</h2>
              <p>Update personal contact and locale information.</p>
            </div>
            <button disabled={status.loading} type="submit">
              <FiSave aria-hidden="true" />
              {status.loading ? "Saving..." : "Save"}
            </button>
          </div>

          {status.message ? <p className={`auth-alert auth-alert--${status.type}`}>{status.message}</p> : null}

          <div className="profile-form-stack">
            <label><span>Full name</span><input value={form.name} onChange={(event) => updateField("name", event.target.value)} /></label>
            <label><span>Work email</span><input value={form.email} onChange={(event) => updateField("email", event.target.value)} type="email" /></label>
            <label><span>Phone</span><input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} placeholder="Optional" /></label>
            <label><span>Timezone</span><input value={form.timezone} onChange={(event) => updateField("timezone", event.target.value)} /></label>
          </div>
        </form>

        <form onSubmit={handlePasswordSubmit}>
          <section className="profile-password-section">
            <div className="profile-section-title">
              <FiLock aria-hidden="true" />
              <div>
                <h3>Password</h3>
                <p>Change the password for this signed-in account.</p>
              </div>
            </div>
            {passwordStatus.message ? <p className={`auth-alert auth-alert--${passwordStatus.type}`}>{passwordStatus.message}</p> : null}
            <div className="profile-form-stack">
              <label><span>Current password</span><input value={passwordForm.old_password} onChange={(event) => updatePasswordField("old_password", event.target.value)} type="password" /></label>
              <label><span>New password</span><input value={passwordForm.new_password} onChange={(event) => updatePasswordField("new_password", event.target.value)} type="password" /></label>
              <label><span>Confirm password</span><input value={passwordForm.new_password_confirmation} onChange={(event) => updatePasswordField("new_password_confirmation", event.target.value)} type="password" /></label>
            </div>
            <button className="profile-save-password" disabled={passwordStatus.loading} type="submit">
              {passwordStatus.loading ? "Updating..." : "Update Password"}
            </button>
          </section>
        </form>

        <section className="profile-source-card">
          <FiFileText aria-hidden="true" />
          <div>
            <b>Permission source</b>
            <span>Synced from backend profile role</span>
          </div>
        </section>
      </aside>
    </main>
  );
}

function userToForm(user) {
  return {
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    timezone: user?.timezone || "Asia/Hebron"
  };
}

function getInitials(value) {
  return String(value || "User")
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
}

function formatLabel(value) {
  return String(value).replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
