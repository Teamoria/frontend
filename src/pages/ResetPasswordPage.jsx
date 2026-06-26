import { useState } from "react";
import AuthLayout from "../components/AuthLayout.jsx";
import { FiLock, FiMail, FiShield } from "react-icons/fi";
import { PrimaryButton, TextInput } from "../components/FormControls.jsx";
import { forgotPasswordSendOtp, forgotPasswordVerify } from "../lib/api.js";
import "../styles/reset-access.css";

const workspaceImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAihiwQ5gWaPNLFXzNG-TzS2eV0pPLpvfKcuLXvwklDhAET0Ao6oujo3rL7pREHOEaeUopVHbIOXzGKlzHBOtBvUjhf4SyYBHJUaMCn46KzUgUiP8NEjIFMOH4IvWOszKDZ_3eye1Av_F6UW0eoXThSb6pg6WvvrCC2wC_TpAScoDN3ifERvRQdeQwl142mfsWhiJKDGEIwQVwYdn0VktxZL2Ra-6sMzeWtD6-hAmcwzGk26As4cT7kFlmhYZTwI1obzGuHp1EU9fJh";

export default function ResetPasswordPage() {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSendOtp(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    const formData = new FormData(event.currentTarget);
    const emailValue = formData.get("email");

    try {
      const payload = await forgotPasswordSendOtp({ email: emailValue });
      setEmail(emailValue);
      setStep("otp");
      setStatus({
        type: "success",
        message: "Verification code sent to your email."
      });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyAndReset(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    const formData = new FormData(event.currentTarget);
    const code = String(formData.get("code") || "").trim();
    const newPassword = formData.get("newPassword");

    try {
      await forgotPasswordVerify({ email, code, newPassword });
      setStep("done");
      setStatus({ type: "success", message: "Password reset successfully." });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      className="reset-access-shell"
      variant="analytics"
      title="Restore Your Neural Access."
      text="Forgot your encryption key? We will help you securely reconnect to your team and meeting archives."
      visualContent={<ResetAccessVisual />}
    >
      {step === "email" && (
        <form className="auth-form reset-password-form reset-access-form" onSubmit={handleSendOtp}>
          <ResetMobileBrand />
          <header className="reset-access-header">
            <h1>Reset Access</h1>
            <p>Enter your work identity to receive an access restoration link.</p>
          </header>
          {status.message && <p className={`auth-alert auth-alert--${status.type}`}>{status.message}</p>}
          <div className="form-stack">
            <span className="label">Work Email</span>
            <TextInput icon={<FiMail />} name="email" type="email" placeholder="identity@enterprise.ai" required disabled={isSubmitting} />
          </div>
          <PrimaryButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Restoration Link"}
          </PrimaryButton>
          <p className="auth-switch">Remember your key? <a href="#/signin">Back to Login</a></p>
          <ResetAccessFooter />
        </form>
      )}

      {step === "otp" && (
        <form className="auth-form reset-password-form reset-access-form" onSubmit={handleVerifyAndReset}>
          <ResetMobileBrand />
          <header className="reset-access-header">
            <h1>Create New Key</h1>
            <p>Enter the verification code sent to <b>{email}</b>, then choose a new password.</p>
          </header>
          {status.message && <p className={`auth-alert auth-alert--${status.type}`}>{status.message}</p>}
          <div className="form-stack">
            <span className="label">Verification code</span>
            <TextInput icon={<FiShield />} name="code" placeholder="Enter OTP code" required disabled={isSubmitting} />
            <span className="label">New password</span>
            <TextInput icon={<FiLock />} name="newPassword" type="password" placeholder="Enter new password" required disabled={isSubmitting} />
          </div>
          <PrimaryButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </PrimaryButton>
          <button
            className="otp-resend-button"
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              setStep("email");
              setStatus({ type: "", message: "" });
            }}
          >
            Use a different email
          </button>
          <ResetAccessFooter />
        </form>
      )}

      {step === "done" && (
        <div className="auth-form reset-password-form reset-access-form">
          <ResetMobileBrand />
          <div className="success-card">
            <span aria-hidden="true" />
            <div>
              <h2>Password reset successful!</h2>
              <p>Your password has been updated. You can now sign in with your new password.</p>
              <a className="primary-button" href="#/signin">
                Sign In
              </a>
            </div>
          </div>
          <ResetAccessFooter />
        </div>
      )}
    </AuthLayout>
  );
}

function ResetAccessVisual() {
  return (
    <div className="reset-access-visual-content" aria-hidden="true">
      <img src={workspaceImage} alt="" />
      <div className="reset-access-visual-brand">
        <span>Teamoria</span>
      </div>
    </div>
  );
}

function ResetMobileBrand() {
  return (
    <div className="reset-access-mobile-brand">
      <span>Teamoria</span>
      <small>Enterprise AI PM</small>
    </div>
  );
}

function ResetAccessFooter() {
  return (
    <footer className="reset-access-footer">
      <span><i /> Grid Online</span>
      <nav aria-label="Authentication links">
        <a href="#/security">Security</a>
        <a href="#/terms">Legal</a>
        <a href="#/support">Support</a>
      </nav>
    </footer>
  );
}
