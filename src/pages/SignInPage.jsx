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

export default function SignInPage() {
  const { login } = useAuth();
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasEmail, setHasEmail] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    const formData = new FormData(event.currentTarget);

    try {
      const { user } = await loginWithEmail({
        email: formData.get("email"),
        password: formData.get("password")
      });
      login(user);
      window.location.hash = getPostLoginPath(user);
    } catch (error) {
      const errorCode = error.payload?.error_code;
      if (errorCode === "EMAIL_NOT_VERIFIED") {
        const email = encodeURIComponent(String(formData.get("email") || ""));
        sessionStorage.setItem("teamoria_pending_signup", JSON.stringify({
          email: formData.get("email"),
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
      <form className={`auth-form sign-in-form ${hasEmail ? "has-email" : ""}`} onSubmit={handleSubmit}>
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
            icon={<FiMail />}
            inputMode="email"
            name="email"
            type="email"
            placeholder="name@company.com"
            required
            disabled={isSubmitting}
            onChange={(event) => setHasEmail(event.target.value.trim().length > 0)}
          />
          <span className="label">Password</span>
          <label className="field input-wrapper sign-in-password-field">
            <span className="field-icon icon" aria-hidden="true"><FiLock /></span>
            <input
              name="password"
              required
              autoComplete="current-password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              disabled={isSubmitting}
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
          </label>
        </div>
        <div className="form-row">
          <label className="checkbox"><input name="remember" type="checkbox" /> Remember me</label>
          <a href="#/reset-password">Forgot password?</a>
        </div>
        <PrimaryButton type="submit" disabled={isSubmitting}>{isSubmitting ? "Signing in..." : "Sign In"}</PrimaryButton>
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

function SignInWorkspaceVisual() {
  return <AuthLegacyVisual className="sign-in-visual-content" />;
}
