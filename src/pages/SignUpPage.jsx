import { useState } from "react";
import AuthLayout from "../components/AuthLayout.jsx";
import { FiMail, FiLock, FiUser, FiBriefcase, FiAward } from "react-icons/fi";
import GoogleAuthButton from "../components/GoogleAuthButton.jsx";
import { PrimaryButton, TextInput } from "../components/FormControls.jsx";
import { registerWithEmail } from "../lib/api.js";
import { PENDING_SIGNUP_KEY } from "./VerifyOtpPage.jsx";

export default function SignUpPage() {
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    const formData = new FormData(event.currentTarget);
    const name = formData.get("fullName");
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const payload = await registerWithEmail({ name, email, password });
      sessionStorage.setItem(PENDING_SIGNUP_KEY, JSON.stringify({
        email,
        password,
        debugCode: payload?.data?.code ? String(payload.data.code) : ""
      }));
      window.location.hash = "/verify-otp";
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      variant="signup"
      title="Start building better project momentum"
      text="Create a workspace for your team and move from scattered updates to clear execution."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Create account</h1>
        <p>Set up your Teamoria workspace</p>
        {status.message && <p className={`auth-alert auth-alert--${status.type}`}>{status.message}</p>}

        <div className="form-stack">
          <span className="label">Full name</span>
          <TextInput icon={<FiUser />} name="fullName" placeholder="Alex Morgan" required disabled={isSubmitting} />

          <span className="label">Work email</span>
          <TextInput icon={<FiMail />} name="email" type="email" placeholder="you@company.com" required disabled={isSubmitting} />

          <span className="label">Company name</span>
          <TextInput icon={<FiBriefcase />} name="company" placeholder="Taqat Digital" required disabled={isSubmitting} />

          <span className="label">Job title / Role</span>
          <label className="field">
            <span className="field-icon" aria-hidden="true"><FiAward /></span>
            <select name="role" defaultValue="project-manager" disabled={isSubmitting}>
              <option value="admin">Company Admin</option>
              <option value="general-manager">General Manager</option>
              <option value="project-manager">Project Manager</option>
              <option value="employee">Employee</option>
            </select>
          </label>

          <span className="label">Password</span>
          <TextInput icon={<FiLock />} name="password" type="password" placeholder="Create a strong password" required disabled={isSubmitting} />
        </div>

        <PrimaryButton type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Workspace"}</PrimaryButton>
        <div className="divider"><span>or sign up with</span></div>
        <GoogleAuthButton
          disabled={isSubmitting}
          onError={(message) => setStatus({ type: "error", message })}
          onStart={() => setStatus({ type: "", message: "" })}
        >
          Sign up with Google
        </GoogleAuthButton>
        <p className="auth-switch">Already have an account? <a className="auth-inline-action" href="#/signin">Sign in</a></p>
      </form>
    </AuthLayout>
  );
}
