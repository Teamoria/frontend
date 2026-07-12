import { useState } from "react";
import AuthLayout from "../components/AuthLayout.jsx";
import { FiMail } from "react-icons/fi";
import { PrimaryButton, TextInput } from "../components/FormControls.jsx";
import { forgotPasswordSendOtp } from "../lib/api.js";
import { getAuthPageCopy, getLocalizedRequestError } from "../lib/authPageCopy.js";
import { usePreferences } from "../lib/PreferencesContext.jsx";
import "../styles/reset-access.css";
import "../styles/auth-unified.css";

export default function ResetPasswordPage() {
  const { language } = usePreferences();
  const copy = getAuthPageCopy(language, "reset");
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailError = getEmailError(email, touched, submitted, copy);

  function updateEmail(value) {
    setEmail(value);
    setTouched(true);
    if (status.type === "error") {
      setStatus({ type: "", message: "" });
    }
  }

  async function handleSendOtp(event) {
    event.preventDefault();
    setSubmitted(true);
    setStatus({ type: "", message: "" });

    const nextError = getEmailError(email, true, true, copy);
    if (nextError) {
      setTouched(true);
      return;
    }

    setIsSubmitting(true);

    try {
      await forgotPasswordSendOtp({ email: email.trim() });
      setStatus({
        type: "success",
        message: copy.successMessage
      });
    } catch (error) {
      setStatus({ type: "error", message: getLocalizedRequestError(error, language, copy.error) });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      className="reset-access-shell"
      variant="analytics"
      eyebrow={copy.eyebrow}
      title={copy.heroTitle}
      text={copy.heroText}
    >
      <form className={`auth-form reset-password-form reset-access-form ${email ? "has-email" : ""}`} onSubmit={handleSendOtp} noValidate>
        <ResetMobileBrand />
        <header className="reset-access-header">
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </header>
        {status.type === "success" ? (
          <div className="success-card reset-success-card" role="status" aria-live="polite">
            <span aria-hidden="true" />
            <div>
              <h2>{copy.successTitle}</h2>
              <p>{status.message}</p>
            </div>
          </div>
        ) : null}
        {status.type === "error" && status.message ? (
          <p className={`auth-alert auth-alert--${status.type}`} role="alert" aria-live="polite">
            {status.message}
          </p>
        ) : null}
        <div className="form-stack">
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
            value={email}
            onBlur={() => setTouched(true)}
            onChange={(event) => updateEmail(event.target.value)}
          />
        </div>
        <PrimaryButton type="submit" isLoading={isSubmitting} loadingText={copy.submitting}>
          {copy.submit}
        </PrimaryButton>
        <p className="auth-switch">{copy.remember} <a href="#/signin">{copy.backToLogin}</a></p>
      </form>
    </AuthLayout>
  );
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getEmailError(value, isTouched, isSubmitted, copy) {
  const email = String(value || "").trim();
  if (!email && isSubmitted) return copy.emailRequired;
  if (email && isTouched && !emailPattern.test(email)) return copy.emailInvalid;
  return "";
}

function ResetMobileBrand() {
  return (
    <div className="reset-access-mobile-brand">
      <span>Teamoria</span>
      <small>Team operating system</small>
    </div>
  );
}
