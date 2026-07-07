import { useState } from "react";
import AuthLayout from "../components/AuthLayout.jsx";
import AuthLegacyVisual from "../components/AuthLegacyVisual.jsx";
import { FiMail } from "react-icons/fi";
import { PrimaryButton, TextInput } from "../components/FormControls.jsx";
import { forgotPasswordSendOtp } from "../lib/api.js";
import "../styles/reset-access.css";
import "../styles/auth-unified.css";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailError = getEmailError(email, touched, submitted);

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

    const nextError = getEmailError(email, true, true);
    if (nextError) {
      setTouched(true);
      return;
    }

    setIsSubmitting(true);

    try {
      await forgotPasswordSendOtp({ email: email.trim() });
      setStatus({
        type: "success",
        message: "If an account exists for this email, we sent a password reset link."
      });
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
      <form className={`auth-form reset-password-form reset-access-form ${email ? "has-email" : ""}`} onSubmit={handleSendOtp} noValidate>
        <ResetMobileBrand />
        <header className="reset-access-header">
          <h1>Reset password</h1>
          <p>Enter your work email and we&rsquo;ll send you a secure reset link.</p>
        </header>
        {status.type === "success" ? (
          <div className="success-card reset-success-card" role="status" aria-live="polite">
            <span aria-hidden="true" />
            <div>
              <h2>Check your email</h2>
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
            value={email}
            onBlur={() => setTouched(true)}
            onChange={(event) => updateEmail(event.target.value)}
          />
        </div>
        <PrimaryButton type="submit" isLoading={isSubmitting} loadingText="Sending...">
          Send Reset Link
        </PrimaryButton>
        <p className="auth-switch">Remember your password? <a href="#/signin">Back to Login</a></p>
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

function ResetAccessVisual() {
  return <AuthLegacyVisual className="reset-access-visual-content" />;
}

function ResetMobileBrand() {
  return (
    <div className="reset-access-mobile-brand">
      <span>Teamoria</span>
      <small>Enterprise AI PM</small>
    </div>
  );
}
