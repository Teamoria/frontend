import { useState } from "react";
import AuthLayout from "../components/AuthLayout.jsx";
import AuthLegacyVisual from "../components/AuthLegacyVisual.jsx";
import { FiBriefcase, FiEye, FiEyeOff, FiLock, FiMail, FiUser } from "react-icons/fi";
import GoogleAuthButton from "../components/GoogleAuthButton.jsx";
import { PrimaryButton, TextInput } from "../components/FormControls.jsx";
import { registerWithEmail } from "../lib/api.js";
import { formatAuthErrorMessage } from "../lib/authErrors.js";
import { PENDING_SIGNUP_KEY } from "./VerifyOtpPage.jsx";
import "../styles/sign-up.css";
import "../styles/auth-unified.css";

export default function SignUpPage() {
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", companyName: "", password: "" });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const fullNameError = getRequiredError(form.fullName, "Full name is required", submitted);
  const emailError = getEmailError(form.email, touched.email, submitted);
  const companyNameError = getRequiredError(form.companyName, "Company name is required", submitted);
  const passwordError = getPasswordError(form.password, touched.password, submitted);

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
      getRequiredError(form.fullName, "Full name is required", true),
      getEmailError(form.email, true, true),
      getRequiredError(form.companyName, "Company name is required", true),
      getPasswordError(form.password, true, true)
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
      const payload = await registerWithEmail({ name, email, password });
      sessionStorage.setItem(PENDING_SIGNUP_KEY, JSON.stringify({
        email,
        companyName,
        password
      }));
      window.location.hash = "/verify-otp";
    } catch (error) {
      setStatus({ type: "error", message: formatAuthErrorMessage(error, "signup") });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      className="sign-up-shell"
      variant="analytics"
      title="Start Your Intelligent Meeting Ecosystem."
      text="Streamline your team collaboration with AI-powered meeting summaries and real-time operational insights."
      visualContent={<SignUpWorkspaceVisual />}
    >
      <form className={`auth-form sign-up-form ${form.email ? "has-email" : ""}`} onSubmit={handleSubmit} noValidate>
        <div className="sign-up-mobile-brand">
          <span>Teamoria</span>
          <small>Enterprise AI PM</small>
        </div>
        <header className="sign-up-header">
          <h1>Create account</h1>
          <p>Join Teamoria and create your workspace.</p>
        </header>

        {status.message && (
          <p className={`auth-alert auth-alert--${status.type}`} role="alert" aria-live="polite">
            {status.message}
          </p>
        )}

        <div className="form-stack">
          <span className="label">Full Name</span>
          <TextInput
            autoComplete="name"
            error={fullNameError}
            icon={<FiUser />}
            name="fullName"
            placeholder="Enter your full name"
            required
            disabled={isSubmitting}
            value={form.fullName}
            onBlur={() => setTouched((current) => ({ ...current, fullName: true }))}
            onChange={(event) => updateField("fullName", event.target.value)}
          />

          <span className="label">Work Email</span>
          <TextInput
            autoComplete="email"
            error={emailError}
            icon={<FiMail />}
            inputMode="email"
            name="email"
            type="email"
            placeholder="name@company.com"
            required
            disabled={isSubmitting}
            value={form.email}
            onBlur={() => setTouched((current) => ({ ...current, email: true }))}
            onChange={(event) => updateField("email", event.target.value)}
          />

          <span className="label">Company Name</span>
          <TextInput
            autoComplete="organization"
            error={companyNameError}
            icon={<FiBriefcase />}
            name="companyName"
            placeholder="Enter your company name"
            required
            disabled={isSubmitting}
            value={form.companyName}
            onBlur={() => setTouched((current) => ({ ...current, companyName: true }))}
            onChange={(event) => updateField("companyName", event.target.value)}
          />

          <div className="sign-up-owner-notice" aria-label="Account role">
            <FiBriefcase aria-hidden="true" />
            <span>
              <b>Company Owner account</b>
              <small>Your workspace will be created under your company owner access.</small>
            </span>
          </div>

          <span className="label">Password</span>
          <label className={`field input-wrapper sign-up-password-field ${passwordError ? "field--invalid" : ""}`}>
            <span className="field-icon icon" aria-hidden="true"><FiLock /></span>
            <input
              aria-describedby={passwordError ? "signup-password-error" : undefined}
              aria-invalid={passwordError ? "true" : "false"}
              aria-required="true"
              name="password"
              autoComplete="new-password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              disabled={isSubmitting}
              value={form.password}
              onBlur={() => setTouched((current) => ({ ...current, password: true }))}
              onChange={(event) => updateField("password", event.target.value)}
            />
            <button
              className="password-toggle"
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((current) => !current)}
              disabled={isSubmitting}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
            {passwordError ? <small className="field-error" id="signup-password-error">{passwordError}</small> : null}
          </label>
        </div>

        <PrimaryButton type="submit" isLoading={isSubmitting} loadingText="Creating Workspace...">Create Workspace</PrimaryButton>
        <div className="divider"><span>or continue with</span></div>
        <div className="social-row">
          <GoogleAuthButton
            disabled={isSubmitting}
            onError={(message) => setStatus({ type: "error", message })}
            onStart={() => setStatus({ type: "", message: "" })}
          >
            Sign up with Google
          </GoogleAuthButton>
        </div>
        <p className="auth-switch">Already have an account? <a href="#/signin">Log in</a></p>
      </form>
    </AuthLayout>
  );
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getRequiredError(value, message, isSubmitted) {
  if (isSubmitted && !String(value || "").trim()) return message;
  return "";
}

function getEmailError(value, isTouched, isSubmitted) {
  const email = String(value || "").trim();
  if (!email && isSubmitted) return "Email is required";
  if (email && isTouched && !emailPattern.test(email)) return "Please enter a valid email address";
  return "";
}

function getPasswordError(value, isTouched, isSubmitted) {
  const password = String(value || "");
  if (!password && isSubmitted) return "Password is required";
  if (password && isTouched && password.length < 8) return "Password must be at least 8 characters";
  return "";
}

function SignUpWorkspaceVisual() {
  return <AuthLegacyVisual className="sign-up-visual-content" />;
}
