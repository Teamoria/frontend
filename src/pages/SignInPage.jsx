import { useState } from "react";
import AuthLayout from "../components/AuthLayout.jsx";
import AuthLegacyVisual from "../components/AuthLegacyVisual.jsx";
import { FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import GoogleAuthButton from "../components/GoogleAuthButton.jsx";
import { PrimaryButton, TextInput } from "../components/FormControls.jsx";
import { loginWithEmail } from "../lib/api.js";
import { formatAuthErrorMessage } from "../lib/authErrors.js";
import { useAuth } from "../lib/AuthContext.jsx";
import { getPostLoginPath } from "../lib/authRoles.js";
import "../styles/sign-in.css";
import "../styles/auth-unified.css";

export default function SignInPage() {
  const { login } = useAuth();
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const emailError = getEmailError(form.email, touched.email, submitted);
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

    const nextEmailError = getEmailError(form.email, true, true);
    const nextPasswordError = getPasswordError(form.password, true, true);
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
      setStatus({ type: "error", message: formatAuthErrorMessage(error, "signin") });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      className="sign-in-shell"
      variant="analytics"
      title="The Neural Hub for Modern Meetings."
      text="Manage your meetings, team flow, and AI-driven insights within the world's most advanced operations ecosystem."
      visualContent={<SignInWorkspaceVisual />}
    >
      <form className={`auth-form sign-in-form ${form.email ? "has-email" : ""}`} onSubmit={handleSubmit} noValidate>
        <div className="sign-in-mobile-brand">
          <span>Teamoria</span>
          <small>Enterprise AI PM</small>
        </div>
        <header className="sign-in-header">
          <h1>Welcome back</h1>
          <p>Sign in to continue to Teamoria</p>
        </header>
        {status.message && (
          <p className={`auth-alert auth-alert--${status.type}`} role="alert" aria-live="polite">
            {status.message}
          </p>
        )}
        <div className="form-stack">
          <span className="label">Email</span>
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
          <span className="label">Password</span>
          <label className={`field input-wrapper sign-in-password-field ${passwordError ? "field--invalid" : ""}`}>
            <span className="field-icon icon" aria-hidden="true"><FiLock /></span>
            <input
              aria-describedby={passwordError ? "signin-password-error" : undefined}
              aria-invalid={passwordError ? "true" : "false"}
              aria-required="true"
              name="password"
              autoComplete="current-password"
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
            {passwordError ? <small className="field-error" id="signin-password-error">{passwordError}</small> : null}
          </label>
        </div>
        <div className="form-row">
          <label className="checkbox"><input name="remember" type="checkbox" /> Remember me</label>
          <a href="#/reset-password">Forgot password?</a>
        </div>
        <PrimaryButton type="submit" isLoading={isSubmitting} loadingText="Signing In...">Sign In</PrimaryButton>
        <div className="divider"><span>or continue with</span></div>
        <div className="social-row">
          <GoogleAuthButton
            disabled={isSubmitting}
            onError={(message) => setStatus({ type: "error", message })}
            onStart={() => setStatus({ type: "", message: "" })}
          >
            Sign in with Google
          </GoogleAuthButton>
        </div>
        <p className="auth-switch">Don't have an account? <a href="#/signup">Sign up</a></p>
        <footer className="sign-in-footer">
          <span><i /> Grid Online</span>
          <nav aria-label="Authentication links">
            <a href="#/security">Security</a>
            <a href="#/terms">Legal</a>
            <a href="#/support">Support</a>
          </nav>
        </footer>
      </form>
    </AuthLayout>
  );
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getEmailError(value, isTouched, isSubmitted) {
  const email = String(value || "").trim();
  if (!email && isSubmitted) return "Email is required";
  if (email && isTouched && !emailPattern.test(email)) return "Please enter a valid email address";
  return "";
}

function getPasswordError(value, isTouched, isSubmitted) {
  const password = String(value || "");
  if (!password && isSubmitted) return "Password is required";
  return "";
}

function SignInWorkspaceVisual() {
  return <AuthLegacyVisual className="sign-in-visual-content" />;
}
