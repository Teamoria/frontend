import { useState } from "react";
import AuthLayout from "../components/AuthLayout.jsx";
import { FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import GoogleAuthButton from "../components/GoogleAuthButton.jsx";
import { PrimaryButton, TextInput } from "../components/FormControls.jsx";
import { loginWithEmail } from "../lib/api.js";
import { formatAuthErrorMessage } from "../lib/authErrors.js";
import { useAuth } from "../lib/AuthContext.jsx";
import { getPostLoginPath } from "../lib/authRoles.js";
import { getAuthPageCopy } from "../lib/authPageCopy.js";
import { usePreferences } from "../lib/PreferencesContext.jsx";

export default function SignInPage() {
  const { login } = useAuth();
  const { language } = usePreferences();
  const copy = getAuthPageCopy(language, "signIn");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const emailError = getEmailError(form.email, touched.email, submitted, copy);
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

    const nextEmailError = getEmailError(form.email, true, true, copy);
    const nextPasswordError = getPasswordError(form.password, true, true, copy);
    if (nextEmailError || nextPasswordError) {
      setTouched({ email: true, password: true });
      return;
    }

    setIsSubmitting(true);

    try {
      const { user } = await loginWithEmail({
        email: form.email,
        password: form.password
      });
      login(user);
      window.location.hash = getPostLoginPath(user);
    } catch (error) {
      const errorCode = error.payload?.error_code;
      if (errorCode === "EMAIL_NOT_VERIFIED") {
        const email = encodeURIComponent(String(form.email || ""));
        sessionStorage.setItem("teamoria_pending_signup", JSON.stringify({
          email: form.email,
          type: "register"
        }));
        window.location.hash = `/verify-otp?email=${email}&type=register`;
        return;
      }
      setStatus({
        type: "error",
        message: language === "ar" ? copy.signInError : formatAuthErrorMessage(error, "signin")
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      className="sign-in-shell"
      variant="analytics"
      eyebrow={copy.eyebrow}
      title={copy.heroTitle}
      text={copy.heroText}
    >
      <form className={`auth-form sign-in-form ${form.email ? "has-email" : ""}`} onSubmit={handleSubmit} noValidate>
        <header className="sign-in-header">
          <span className="auth-form-kicker">Teamoria</span>
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </header>
        {status.message && (
          <p className={`auth-alert auth-alert--${status.type}`} role="alert" aria-live="polite">
            {status.message}
          </p>
        )}
        <div className="form-stack">
          <label className="label" htmlFor="signin-email">{copy.email}<small>{copy.required}</small></label>
          <TextInput
            aria-label={copy.email}
            autoComplete="email"
            error={emailError}
            icon={<FiMail />}
            id="signin-email"
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
          <label className="label" htmlFor="signin-password">{copy.password}<small>{copy.required}</small></label>
          <label className={`field input-wrapper sign-in-password-field ${passwordError ? "field--invalid" : ""}`}>
            <span className="field-icon icon" aria-hidden="true"><FiLock /></span>
            <input
              aria-label={copy.password}
              aria-describedby={passwordError ? "signin-password-error" : undefined}
              aria-invalid={passwordError ? "true" : "false"}
              aria-required="true"
              id="signin-password"
              name="password"
              autoComplete="current-password"
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
            {passwordError ? <small className="field-error" id="signin-password-error">{passwordError}</small> : null}
          </label>
        </div>
        <div className="form-row">
          <label className="checkbox"><input name="remember" type="checkbox" /><span>{copy.remember}</span></label>
          <a href="#/reset-password">{copy.forgotPassword}</a>
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
        <p className="auth-switch">{copy.noAccount} <a href="#/signup">{copy.createAccount}</a></p>
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

function getPasswordError(value, isTouched, isSubmitted, copy) {
  const password = String(value || "");
  if (!password && isSubmitted) return copy.passwordRequired;
  return "";
}
