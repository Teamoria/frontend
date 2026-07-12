import { useEffect, useRef, useState } from "react";
import AuthLayout from "../components/AuthLayout.jsx";
import { FiMail } from "react-icons/fi";
import { PrimaryButton } from "../components/FormControls.jsx";
import { loginWithEmail, sendOtp, verifyOtp } from "../lib/api.js";
import { useAuth } from "../lib/AuthContext.jsx";
import { getPostLoginPath } from "../lib/authRoles.js";
import { clearPendingSignup, getPendingSignup, PENDING_SIGNUP_KEY } from "../lib/pendingRegistration.js";
import { getAuthPageCopy, getLocalizedRequestError } from "../lib/authPageCopy.js";
import { usePreferences } from "../lib/PreferencesContext.jsx";
import "../styles/reset-access.css";
import "../styles/auth-unified.css";

export default function VerifyOtpPage() {
  const { login } = useAuth();
  const { language } = usePreferences();
  const copy = getAuthPageCopy(language, "otp");
  const [pendingSignup, setPendingSignup] = useState(getPendingSignup);
  const [codeDigits, setCodeDigits] = useState(Array(6).fill(""));
  const [hasAutoSent, setHasAutoSent] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!pendingSignup?.email) {
      setStatus({
        type: "error",
        message: copy.noPending
      });
    }
  }, [pendingSignup]);

  useEffect(() => {
    if (!pendingSignup?.email || hasAutoSent || pendingSignup.password) return;

    setHasAutoSent(true);
    setIsResending(true);
    sendOtp({ email: pendingSignup.email, type: pendingSignup.type || "register" })
      .then(() => {
        setStatus({
          type: "success",
          message: copy.sent
        });
      })
      .catch((error) => {
        setStatus({ type: "error", message: getLocalizedRequestError(error, language, copy.sendError) });
      })
      .finally(() => {
        setIsResending(false);
      });
  }, [copy.sendError, copy.sent, hasAutoSent, language, pendingSignup]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!pendingSignup?.email) {
      setStatus({ type: "error", message: copy.createFirst });
      return;
    }

    const code = codeDigits.join("");
    if (!code) {
      setStatus({ type: "error", message: copy.codeRequired });
      inputRefs.current[0]?.focus();
      return;
    }

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setStatus({ type: "error", message: copy.codeInvalid });
      inputRefs.current[codeDigits.findIndex((digit) => !digit)]?.focus();
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      await verifyOtp({
        email: pendingSignup.email,
        code,
        type: pendingSignup.type || "register"
      });

      setStatus({ type: "success", message: copy.verified });

      if (pendingSignup.password) {
        const { user } = await loginWithEmail({
          email: pendingSignup.email,
          password: pendingSignup.password
        });

        login(user);
        clearPendingSignup({ keepCompany: true });
        window.setTimeout(() => {
          window.location.hash = getPostLoginPath(user);
        }, 350);
        return;
      }

      clearPendingSignup();
      window.setTimeout(() => {
        window.location.hash = "/signin";
      }, 350);
    } catch (error) {
      setStatus({ type: "error", message: getLocalizedRequestError(error, language, copy.verifyError) });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (!pendingSignup?.email) {
      setStatus({ type: "error", message: copy.resendNeedsEmail });
      return;
    }

    setIsResending(true);
    setStatus({ type: "", message: "" });

    try {
      await sendOtp({ email: pendingSignup.email, type: pendingSignup.type || "register" });
      setCodeDigits(Array(6).fill(""));
      inputRefs.current[0]?.focus();
      setStatus({
        type: "success",
        message: copy.resent
      });
    } catch (error) {
      setStatus({ type: "error", message: getLocalizedRequestError(error, language, copy.sendError) });
    } finally {
      setIsResending(false);
    }
  }

  function handleCodeChange(index, value) {
    const cleanValue = String(value || "").replace(/\D/g, "");
    if (!cleanValue) {
      setCodeDigits((current) => current.map((digit, digitIndex) => digitIndex === index ? "" : digit));
      return;
    }

    const nextDigits = [...codeDigits];
    cleanValue.slice(0, 6 - index).split("").forEach((digit, offset) => {
      nextDigits[index + offset] = digit;
    });
    setCodeDigits(nextDigits);
    setStatus((current) => current.type === "error" ? { type: "", message: "" } : current);

    const nextIndex = Math.min(index + cleanValue.length, 5);
    inputRefs.current[nextIndex]?.focus();
  }

  function handleCodeKeyDown(index, event) {
    if (event.key === "Backspace" && !codeDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleCodePaste(event) {
    const pastedCode = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedCode) return;

    event.preventDefault();
    const nextDigits = Array(6).fill("");
    pastedCode.split("").forEach((digit, index) => {
      nextDigits[index] = digit;
    });
    setCodeDigits(nextDigits);
    inputRefs.current[Math.min(pastedCode.length, 6) - 1]?.focus();
  }

  return (
    <AuthLayout
      className="reset-access-shell verify-email-shell"
      variant="analytics"
      eyebrow={copy.eyebrow}
      title={copy.heroTitle}
      text={copy.heroText}
    >
      <form className="auth-form reset-access-form otp-form" onSubmit={handleSubmit} noValidate>
        <div className="reset-access-mobile-brand">
          <span>Teamoria</span>
          <small>{copy.eyebrow}</small>
        </div>
        <header className="reset-access-header">
          <h1>{copy.title}</h1>
          <p>{copy.subtitle}</p>
        </header>

        {pendingSignup?.email && (
          <div className="otp-email-card">
            <FiMail aria-hidden="true" />
            <span>{pendingSignup.email}</span>
          </div>
        )}

        {status.message && <p className={`auth-alert auth-alert--${status.type}`} role={status.type === "error" ? "alert" : "status"} aria-live="polite">{status.message}</p>}

        <div className="form-stack">
          <span className="label">{copy.code}</span>
          <div className="otp-code-grid" onPaste={handleCodePaste}>
            {codeDigits.map((digit, index) => (
              <input
                aria-label={copy.digitLabel.replace("{number}", index + 1)}
                autoComplete={index === 0 ? "one-time-code" : "off"}
                disabled={isSubmitting || !pendingSignup?.email}
                inputMode="numeric"
                key={index}
                maxLength="1"
                pattern="[0-9]*"
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                type="text"
                value={digit}
                onChange={(event) => handleCodeChange(index, event.target.value)}
                onKeyDown={(event) => handleCodeKeyDown(index, event)}
              />
            ))}
          </div>
        </div>

        <PrimaryButton type="submit" isLoading={isSubmitting} loadingText={copy.submitting} disabled={isSubmitting || !pendingSignup?.email}>
          {copy.submit}
        </PrimaryButton>

        <div className="otp-action-stack">
          <button className="otp-resend-button" disabled={isResending || !pendingSignup?.email} onClick={handleResend} type="button">
            {isResending ? copy.resending : copy.resend}
          </button>

          <a className="back-link" href="#/signup">{copy.backToSignup}</a>
        </div>
      </form>
    </AuthLayout>
  );
}

export { PENDING_SIGNUP_KEY };
