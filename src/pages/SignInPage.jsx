import { useState } from "react";
import AuthLayout from "../components/AuthLayout.jsx";
import { FiMail, FiLock } from "react-icons/fi";
import GoogleAuthButton from "../components/GoogleAuthButton.jsx";
import { PrimaryButton, TextInput } from "../components/FormControls.jsx";
import { loginWithEmail } from "../lib/api.js";

export default function SignInPage() {
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    const formData = new FormData(event.currentTarget);

    try {
      await loginWithEmail({
        email: formData.get("email"),
        password: formData.get("password")
      });
      window.location.hash = "/dashboard";
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      variant="analytics"
      title="AI-powered project operations"
      text="Manage delivery, tasks, and team flow with intelligent project oversight."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Welcome back</h1>
        <p>Sign in to continue to Teamoria</p>
        {status.message && <p className={`auth-alert auth-alert--${status.type}`}>{status.message}</p>}
        <div className="form-stack">
          <span className="label">Email</span>
          <TextInput icon={<FiMail />} name="email" type="email" placeholder="you@company.com" required disabled={isSubmitting} />
          <span className="label">Password</span>
          <TextInput icon={<FiLock />} name="password" type="password" placeholder="Password" required disabled={isSubmitting} />
        </div>
        <div className="form-row">
          <label className="checkbox"><input type="checkbox" /> Remember me</label>
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
      </form>
    </AuthLayout>
  );
}
