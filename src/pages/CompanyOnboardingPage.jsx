import { useState } from "react";
import { FiBriefcase, FiGlobe, FiMapPin, FiTag } from "react-icons/fi";
import AuthLayout from "../components/AuthLayout.jsx";
import { PrimaryButton, TextInput } from "../components/FormControls.jsx";
import { registerCompany } from "../lib/api.js";
import { useAuth } from "../lib/AuthContext.jsx";
import { clearPendingSignup, getPendingCompanyName } from "../lib/pendingRegistration.js";
import { getAuthPageCopy, getLocalizedRequestError } from "../lib/authPageCopy.js";
import { usePreferences } from "../lib/PreferencesContext.jsx";
import "../styles/sign-up.css";
import "../styles/auth-unified.css";

export default function CompanyOnboardingPage() {
  const { login, refreshUser, user } = useAuth();
  const { language } = usePreferences();
  const copy = getAuthPageCopy(language, "onboarding");
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
      setStatus({ type: "error", message: copy.nameRequired });
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
      setStatus({ type: "error", message: getLocalizedRequestError(error, language, copy.error) });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      className="sign-up-shell company-onboarding-shell"
      variant="analytics"
      eyebrow={copy.eyebrow}
      title={copy.heroTitle}
      text={copy.heroText}
    >
      <form className="auth-form sign-up-form" onSubmit={handleSubmit} noValidate>
        <div className="sign-up-mobile-brand">
          <span>Teamoria</span>
          <small>{copy.eyebrow}</small>
        </div>
        <header className="sign-up-header">
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </header>

        {status.message ? (
          <p className={`auth-alert auth-alert--${status.type}`} role={status.type === "error" ? "alert" : "status"} aria-live="polite">
            {status.message}
          </p>
        ) : null}

        <div className="form-stack">
          <span className="label">{copy.companyName}</span>
          <TextInput
            autoComplete="organization"
            disabled={isSubmitting}
            icon={<FiBriefcase />}
            name="company-name"
            placeholder={copy.companyPlaceholder}
            required
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
          />

          <span className="label">{copy.industry}</span>
          <TextInput
            autoComplete="organization-title"
            disabled={isSubmitting}
            icon={<FiTag />}
            name="company-industry"
            placeholder={copy.industryPlaceholder}
            value={form.industry}
            onChange={(event) => updateField("industry", event.target.value)}
          />

          <span className="label">{copy.website}</span>
          <TextInput
            autoComplete="url"
            disabled={isSubmitting}
            icon={<FiGlobe />}
            name="company-website"
            placeholder={copy.websitePlaceholder}
            type="url"
            value={form.website}
            onChange={(event) => updateField("website", event.target.value)}
          />

          <span className="label">{copy.address}</span>
          <TextInput
            autoComplete="street-address"
            disabled={isSubmitting}
            icon={<FiMapPin />}
            name="company-address"
            placeholder={copy.addressPlaceholder}
            value={form.address}
            onChange={(event) => updateField("address", event.target.value)}
          />
        </div>

        <PrimaryButton type="submit" isLoading={isSubmitting} loadingText={copy.submitting}>
          {copy.submit}
        </PrimaryButton>
      </form>
    </AuthLayout>
  );
}
