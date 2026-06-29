import { useEffect, useState } from "react";
import AuthLayout from "../components/AuthLayout.jsx";
import { FiMail, FiShield } from "react-icons/fi";
import { PrimaryButton, TextInput } from "../components/FormControls.jsx";
import { loginWithEmail, sendOtp, verifyOtp } from "../lib/api.js";
import { useAuth } from "../lib/AuthContext.jsx";

const PENDING_SIGNUP_KEY = "teamoria_pending_signup";

function getPendingSignup() {
  const hashQuery = window.location.hash.split("?")[1] || "";
  const params = new URLSearchParams(hashQuery);
  const email = params.get("email");
  const type = params.get("type");

  if (email) {
    return {
      email,
      type: type || "register"
    };
  }

  try {
    return JSON.parse(sessionStorage.getItem(PENDING_SIGNUP_KEY) || "null");
  } catch {
    return null;
  }
}

export default function VerifyOtpPage() {
  const { login } = useAuth();
  const [pendingSignup, setPendingSignup] = useState(getPendingSignup);
  const [hasAutoSent, setHasAutoSent] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!pendingSignup?.email) {
      setStatus({
        type: "error",
        message: "No pending signup email found. Please create an account first."
      });
    }
  }, [pendingSignup]);

  useEffect(() => {
    if (!pendingSignup?.email || hasAutoSent || pendingSignup.password) return;

    setHasAutoSent(true);
    setIsResending(true);
    sendOtp({ email: pendingSignup.email, type: pendingSignup.type || "register" })
      .then((payload) => {
        const developmentCode = extractOtpCode(payload);
        setStatus({
          type: "success",
          message: developmentCode
            ? `A verification code was sent to your email. Development OTP: ${developmentCode}`
            : "A verification code was sent to your email."
        });
      })
      .catch((error) => {
        setStatus({ type: "error", message: error.message });
      })
      .finally(() => {
        setIsResending(false);
      });
  }, [hasAutoSent, pendingSignup]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!pendingSignup?.email) {
      setStatus({ type: "error", message: "Please create an account before verifying OTP." });
      return;
    }

    const formData = new FormData(event.currentTarget);
    const code = String(formData.get("code") || "").trim();

    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      await verifyOtp({
        email: pendingSignup.email,
        code,
        type: pendingSignup.type || "register"
      });

      if (pendingSignup.password) {
        const { user } = await loginWithEmail({
          email: pendingSignup.email,
          password: pendingSignup.password
        });
        login(user);
        sessionStorage.removeItem(PENDING_SIGNUP_KEY);
        window.location.hash = "/dashboard";
        return;
      }

      sessionStorage.removeItem(PENDING_SIGNUP_KEY);
      window.location.hash = "/signin";
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (!pendingSignup?.email) {
      setStatus({ type: "error", message: "Enter signup again so we know where to send the code." });
      return;
    }

    setIsResending(true);
    setStatus({ type: "", message: "" });

    try {
      const payload = await sendOtp({ email: pendingSignup.email, type: pendingSignup.type || "register" });
      const developmentCode = extractOtpCode(payload);
      setStatus({
        type: "success",
        message: developmentCode
          ? `A new verification code was sent. Development OTP: ${developmentCode}`
          : "A new verification code was sent."
      });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setIsResending(false);
    }
  }

  return (
    <AuthLayout
      variant="security"
      title="Verify your workspace access"
      text="Confirm your email so Teamoria can keep your workspace identity secure."
    >
      <form className="auth-form otp-form" onSubmit={handleSubmit}>
        <h1>Verify your email</h1>
        <p>Enter the verification code sent to your email.</p>

        {pendingSignup?.email && (
          <div className="otp-email-card">
            <FiMail aria-hidden="true" />
            <span>{pendingSignup.email}</span>
          </div>
        )}

        {status.message && <p className={`auth-alert auth-alert--${status.type}`}>{status.message}</p>}

        <div className="form-stack">
          <span className="label">Verification code</span>
          <TextInput
            icon={<FiShield />}
            name="code"
            placeholder="Enter OTP code"
            required
            disabled={isSubmitting || !pendingSignup?.email}
          />
        </div>

        <PrimaryButton type="submit" disabled={isSubmitting || !pendingSignup?.email}>
          {isSubmitting ? "Verifying..." : "Verify Email"}
        </PrimaryButton>

        <button className="otp-resend-button" disabled={isResending || !pendingSignup?.email} onClick={handleResend} type="button">
          {isResending ? "Sending..." : "Send a new code"}
        </button>

        <a className="back-link" href="#/signup"><span aria-hidden="true">&lt;-</span> Back to Sign Up</a>
      </form>
    </AuthLayout>
  );
}

function extractOtpCode(payload) {
  return (
    payload?.data?.code ||
    payload?.data?.otp ||
    payload?.data?.otp_code ||
    payload?.code ||
    payload?.otp ||
    payload?.otp_code ||
    ""
  );
}

export { PENDING_SIGNUP_KEY };
