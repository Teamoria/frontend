import { useState } from "react";
import AuthLayout from "../components/AuthLayout.jsx";
import { FiAward, FiEye, FiEyeOff, FiLock, FiMail, FiUser } from "react-icons/fi";
import GoogleAuthButton from "../components/GoogleAuthButton.jsx";
import { PrimaryButton, TextInput } from "../components/FormControls.jsx";
import { registerWithEmail } from "../lib/api.js";
import { PENDING_SIGNUP_KEY } from "./VerifyOtpPage.jsx";
import "../styles/sign-up.css";

const workspaceImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAihiwQ5gWaPNLFXzNG-TzS2eV0pPLpvfKcuLXvwklDhAET0Ao6oujo3rL7pREHOEaeUopVHbIOXzGKlzHBOtBvUjhf4SyYBHJUaMCn46KzUgUiP8NEjIFMOH4IvWOszKDZ_3eye1Av_F6UW0eoXThSb6pg6WvvrCC2wC_TpAScoDN3ifERvRQdeQwl142mfsWhiJKDGEIwQVwYdn0VktxZL2Ra-6sMzeWtD6-hAmcwzGk26As4cT7kFlmhYZTwI1obzGuHp1EU9fJh";

const roleMap = {
  owner: "admin",
  manager: "project-manager",
  employee: "employee",
  admin: "admin"
};

export default function SignUpPage() {
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    const formData = new FormData(event.currentTarget);
    const name = formData.get("fullName");
    const email = formData.get("email");
    const password = formData.get("password");
    const selectedRole = formData.get("role") || "manager";
    const dashboardRole = roleMap[selectedRole] || "project-manager";

    try {
      const payload = await registerWithEmail({ name, email, password });
      sessionStorage.setItem(PENDING_SIGNUP_KEY, JSON.stringify({
        email,
        password,
        role: dashboardRole
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
      className="sign-up-shell"
      variant="analytics"
      title="Start Your Intelligent Meeting Ecosystem."
      text="Streamline your team collaboration with AI-powered meeting summaries and real-time operational insights."
      visualContent={<SignUpWorkspaceVisual />}
    >
      <form className="auth-form sign-up-form" onSubmit={handleSubmit}>
        <div className="sign-up-mobile-brand">
          <span>Teamoria</span>
          <small>Enterprise AI PM</small>
        </div>
        <header className="sign-up-header">
          <h1>Create Account</h1>
          <p>Join the world's most advanced AI-driven workspace</p>
        </header>

        <GoogleAuthButton
          disabled={isSubmitting}
          onError={(message) => setStatus({ type: "error", message })}
          onStart={() => setStatus({ type: "", message: "" })}
        >
          Sign up with Google
        </GoogleAuthButton>
        <div className="divider"><span>or sign up with</span></div>

        {status.message && <p className={`auth-alert auth-alert--${status.type}`}>{status.message}</p>}

        <div className="form-stack">
          <span className="label">Full Name</span>
          <TextInput icon={<FiUser />} name="fullName" placeholder="Enter your full name" required disabled={isSubmitting} />

          <span className="label">Work Email</span>
          <TextInput icon={<FiMail />} name="email" type="email" placeholder="identity@enterprise.ai" required disabled={isSubmitting} />

          <span className="label">Role</span>
          <label className="field sign-up-select-field">
            <span className="field-icon" aria-hidden="true"><FiAward /></span>
            <select name="role" defaultValue="" required disabled={isSubmitting}>
              <option value="" disabled>Select your role</option>
              <option value="owner">Company Owner</option>
              <option value="manager">Team Manager</option>
              <option value="employee">Employee</option>
              <option value="admin">Company Admin</option>
            </select>
          </label>

          <span className="label">Password</span>
          <label className="field input-wrapper sign-up-password-field">
            <span className="field-icon icon" aria-hidden="true"><FiLock /></span>
            <input
              name="password"
              required
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

        <PrimaryButton type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Workspace"}</PrimaryButton>
        <p className="auth-switch">Already have an account? <a href="#/signin">Log in</a></p>
        <SignUpFooter />
      </form>
    </AuthLayout>
  );
}

function SignUpWorkspaceVisual() {
  return (
    <div className="sign-up-visual-content" aria-hidden="true">
      <img src={workspaceImage} alt="" />
      <div className="sign-up-visual-brand">
        <span>Teamoria</span>
      </div>
    </div>
  );
}

function SignUpFooter() {
  return (
    <footer className="sign-up-footer">
      <span><i /> Grid Online</span>
      <nav aria-label="Authentication links">
        <a href="#/security">Security</a>
        <a href="#/terms">Legal</a>
        <a href="#/support">Support</a>
      </nav>
    </footer>
  );
}
