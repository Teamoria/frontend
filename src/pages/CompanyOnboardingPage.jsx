import { useState } from "react";
import { FiBriefcase, FiGlobe, FiMapPin, FiTag } from "react-icons/fi";
import AuthLayout from "../components/AuthLayout.jsx";
import AuthLegacyVisual from "../components/AuthLegacyVisual.jsx";
import { PrimaryButton, TextInput } from "../components/FormControls.jsx";
import { registerCompany } from "../lib/api.js";
import { useAuth } from "../lib/AuthContext.jsx";
import { clearPendingSignup, getPendingCompanyName } from "../lib/pendingRegistration.js";
import "../styles/sign-up.css";
import "../styles/auth-unified.css";

export default function CompanyOnboardingPage() {
  const { login, refreshUser, user } = useAuth();
  const [form, setForm] = useState({
    name: getPendingCompanyName() || user?.company?.name || "",
    industry: "",
    website: "",
    address: "",
    status: "active"
  });
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    if (status.type === "error") {
      setStatus({ type: "", message: "" });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      setStatus({ type: "error", message: "Company name is required." });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      await registerCompany(form);
      const nextUser = await refreshUser();
      login({ ...nextUser, requires_company: false });
      clearPendingSignup();
      window.location.hash = "/dashboard";
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Unable to create company." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      className="sign-up-shell company-onboarding-shell"
      variant="analytics"
      title="Create your Teamoria company workspace."
      text="Complete the company profile so projects, staff, uploads, billing, and AI permissions can attach to one tenant."
      visualContent={<AuthLegacyVisual className="sign-up-visual-content" />}
    >
      <form className="auth-form sign-up-form" onSubmit={handleSubmit} noValidate>
        <div className="sign-up-mobile-brand">
          <span>Teamoria</span>
          <small>Company Setup</small>
        </div>
        <header className="sign-up-header">
          <h1>Company setup</h1>
          <p>Create the company record linked to your owner account.</p>
        </header>

        {status.message ? (
          <p className={`auth-alert auth-alert--${status.type}`} role={status.type === "error" ? "alert" : "status"} aria-live="polite">
            {status.message}
          </p>
        ) : null}

        <div className="form-stack">
          <span className="label">Company Name</span>
          <TextInput
            autoComplete="organization"
            disabled={isSubmitting}
            icon={<FiBriefcase />}
            name="company-name"
            placeholder="Teamoria Demo"
            required
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
          />

          <span className="label">Industry</span>
          <TextInput
            autoComplete="organization-title"
            disabled={isSubmitting}
            icon={<FiTag />}
            name="company-industry"
            placeholder="Software"
            value={form.industry}
            onChange={(event) => updateField("industry", event.target.value)}
          />

          <span className="label">Website</span>
          <TextInput
            autoComplete="url"
            disabled={isSubmitting}
            icon={<FiGlobe />}
            name="company-website"
            placeholder="https://teamoria.online"
            type="url"
            value={form.website}
            onChange={(event) => updateField("website", event.target.value)}
          />

          <span className="label">Address</span>
          <TextInput
            autoComplete="street-address"
            disabled={isSubmitting}
            icon={<FiMapPin />}
            name="company-address"
            placeholder="Ramallah"
            value={form.address}
            onChange={(event) => updateField("address", event.target.value)}
          />
        </div>

        <PrimaryButton type="submit" isLoading={isSubmitting} loadingText="Creating Company...">
          Create Company
        </PrimaryButton>
      </form>
    </AuthLayout>
  );
}
