import { useState } from "react";
import AuthLayout from "../components/AuthLayout.jsx";
import { FiBriefcase, FiEye, FiEyeOff, FiLock, FiMail, FiUser } from "react-icons/fi";
import GoogleAuthButton from "../components/GoogleAuthButton.jsx";
import { PrimaryButton, TextInput } from "../components/FormControls.jsx";
import { registerWithEmail } from "../lib/api.js";
import { formatAuthErrorMessage } from "../lib/authErrors.js";
import { setPendingSignup } from "../lib/pendingRegistration.js";
import { getAuthPageCopy } from "../lib/authPageCopy.js";
import { usePreferences } from "../lib/PreferencesContext.jsx";
import "../styles/sign-up.css";
import "../styles/auth-unified.css";

export default function SignUpPage() {
  const { language } = usePreferences();
  const copy = getAuthPageCopy(language, "signUp");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", companyName: "", password: "" });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const fullNameError = getRequiredError(form.fullName, copy.fullNameRequired, submitted);
  const emailError = getEmailError(form.email, touched.email, submitted, copy);
  const companyNameError = getRequiredError(form.companyName, copy.companyRequired, submitted);
  const passwordError = getPasswordError(form.password, touched.password, submitted, copy);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setTouched((current) => ({ ...current, [field]: true }));
    if (status.type === "error") {
      setStatus({ type: "", message: "" });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
    setStatus({ type: "", message: "" });

    const nextErrors = [
      getRequiredError(form.fullName, copy.fullNameRequired, true),
      getEmailError(form.email, true, true, copy),
      getRequiredError(form.companyName, copy.companyRequired, true),
      getPasswordError(form.password, true, true, copy)
    ];
    if (nextErrors.some(Boolean)) {
      setTouched({ fullName: true, email: true, companyName: true, password: true });
      return;
    }

    setIsSubmitting(true);

    const name = form.fullName;
    const email = form.email;
    const companyName = form.companyName;
    const password = form.password;

    try {
      await registerWithEmail({ name, email, password });
      setPendingSignup({
        email,
        companyName,
        password
      });
      window.location.hash = "/verify-otp";
    } catch (error) {
      setStatus({ type: "error", message: language === "ar" ? copy.signUpError : formatAuthErrorMessage(error, "signup") });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      className="sign-up-shell"
      variant="analytics"
      eyebrow={copy.eyebrow}
      title={copy.heroTitle}
      text={copy.heroText}
    >
      <form className={`auth-form sign-up-form ${form.email ? "has-email" : ""}`} onSubmit={handleSubmit} noValidate>
        <div className="sign-up-mobile-brand">
          <span>Teamoria</span>
          <small>{copy.eyebrow}</small>
        </div>
        <header className="sign-up-header">
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </header>

        {status.message && (
          <p className={`auth-alert auth-alert--${status.type}`} role="alert" aria-live="polite">
            {status.message}
          </p>
        )}

        <div className="form-stack">
          <span className="label">{copy.fullName}</span>
          <TextInput
            autoComplete="name"
            error={fullNameError}
            icon={<FiUser />}
            name="fullName"
            placeholder={copy.fullNamePlaceholder}
            required
            disabled={isSubmitting}
            value={form.fullName}
            onBlur={() => setTouched((current) => ({ ...current, fullName: true }))}
            onChange={(event) => updateField("fullName", event.target.value)}
          />

          <span className="label">{copy.email}</span>
          <TextInput
            autoComplete="email"
            error={emailError}
            icon={<FiMail />}
            inputMode="email"
            name="email"
            type="email"
            placeholder={copy.emailPlaceholder}
            required
            disabled={isSubmitting}
            value={form.email}
            onBlur={() => setTouched((current) => ({ ...current, email: true }))}
            onChange={(event) => updateField("email", event.target.value)}
          />

          <span className="label">{copy.companyName}</span>
          <TextInput
            autoComplete="organization"
            error={companyNameError}
            icon={<FiBriefcase />}
            name="companyName"
            placeholder={copy.companyPlaceholder}
            required
            disabled={isSubmitting}
            value={form.companyName}
            onBlur={() => setTouched((current) => ({ ...current, companyName: true }))}
            onChange={(event) => updateField("companyName", event.target.value)}
          />

          <div className="sign-up-owner-notice" aria-label={copy.ownerTitle}>
            <FiBriefcase aria-hidden="true" />
            <span>
              <b>{copy.ownerTitle}</b>
              <small>{copy.ownerText}</small>
            </span>
          </div>

          <span className="label">{copy.password}</span>
          <label className={`field input-wrapper sign-up-password-field ${passwordError ? "field--invalid" : ""}`}>
            <span className="field-icon icon" aria-hidden="true"><FiLock /></span>
            <input
              aria-describedby={passwordError ? "signup-password-error" : undefined}
              aria-invalid={passwordError ? "true" : "false"}
              aria-required="true"
              name="password"
              autoComplete="new-password"
              type={showPassword ? "text" : "password"}
              placeholder={copy.passwordPlaceholder}
              disabled={isSubmitting}
              value={form.password}
              onBlur={() => setTouched((current) => ({ ...current, password: true }))}
              onChange={(event) => updateField("password", event.target.value)}
            />
            <button
              className="password-toggle"
              type="button"
              aria-label={showPassword ? copy.hidePassword : copy.showPassword}
              onClick={() => setShowPassword((current) => !current)}
              disabled={isSubmitting}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
            {passwordError ? <small className="field-error" id="signup-password-error">{passwordError}</small> : null}
          </label>
        </div>

        <PrimaryButton type="submit" isLoading={isSubmitting} loadingText={copy.submitting}>{copy.submit}</PrimaryButton>
        <div className="divider"><span>{copy.orContinueWith}</span></div>
        <div className="social-row">
          <GoogleAuthButton
            disabled={isSubmitting}
            loadingText={copy.googleLoading}
            onError={(message) => setStatus({ type: "error", message: language === "ar" ? copy.googleError : message })}
            onStart={() => setStatus({ type: "", message: "" })}
          >
            {copy.google}
          </GoogleAuthButton>
        </div>
        <p className="auth-switch">{copy.haveAccount} <a href="#/signin">{copy.login}</a></p>
      </form>
    </AuthLayout>
  );
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getRequiredError(value, message, isSubmitted) {
  if (isSubmitted && !String(value || "").trim()) return message;
  return "";
}

function getEmailError(value, isTouched, isSubmitted, copy) {
  const email = String(value || "").trim();
  if (!email && isSubmitted) return copy.emailRequired;
  if (email && isTouched && !emailPattern.test(email)) return copy.emailInvalid;
  return "";
}

function getPasswordError(value, isTouched, isSubmitted, copy) {
  const password = String(value || "");
  if (!password && isSubmitted) return copy.passwordRequired;
  if (password && isTouched && password.length < 8) return copy.passwordShort;
  return "";
}
