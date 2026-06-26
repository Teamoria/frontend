import { useState } from "react";
import AuthLayout from "../components/AuthLayout.jsx";
import { FiMail, FiShield, FiLock } from "react-icons/fi";
import { PrimaryButton, TextInput } from "../components/FormControls.jsx";
import { forgotPasswordSendOtp, forgotPasswordVerify } from "../lib/api.js";

export default function ResetPasswordPage() {
  const [step, setStep] = useState("email"); // "email" | "otp" | "done"
  const [email, setEmail] = useState("");
  const [debugCode, setDebugCode] = useState("");
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
      const code = payload?.data?.code ? String(payload.data.code) : "";
      setDebugCode(code);
      setStep("otp");
      setStatus({
        type: "success",
        message: code
          ? `تم إرسال رمز التحقق. الرمز (للاختبار): ${code}`
          : "تم إرسال رمز التحقق إلى بريدك الإلكتروني."
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
      setStatus({ type: "success", message: "تم إعادة تعيين كلمة المرور بنجاح!" });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      variant="security"
      title="Your security, our priority."
      text="We'll help you get back to your account in no time."
    >
      {step === "email" && (
        <form className="auth-form reset-password-form" onSubmit={handleSendOtp}>
          <h1>Reset your password</h1>
          <p>Enter your email and we'll send you a verification code</p>
          {status.message && <p className={`auth-alert auth-alert--${status.type}`}>{status.message}</p>}
          <div className="form-stack">
            <span className="label">Email address</span>
            <TextInput icon={<FiMail />} name="email" type="email" placeholder="you@example.com" required disabled={isSubmitting} />
          </div>
          <PrimaryButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Reset Code"}
          </PrimaryButton>
          <a className="back-link" href="#/signin"><span aria-hidden="true">&lt;-</span> Back to Sign In</a>
        </form>
      )}

      {step === "otp" && (
        <form className="auth-form reset-password-form" onSubmit={handleVerifyAndReset}>
          <h1>Enter new password</h1>
          <p>Enter the verification code sent to <b>{email}</b> and your new password</p>
          {status.message && <p className={`auth-alert auth-alert--${status.type}`}>{status.message}</p>}
          <div className="form-stack">
            <span className="label">Verification code</span>
            <TextInput icon={<FiShield />} name="code" placeholder="Enter OTP code" value={debugCode} required disabled={isSubmitting} />
            <span className="label">New password</span>
            <TextInput icon={<FiLock />} name="newPassword" type="password" placeholder="Enter new password" required disabled={isSubmitting} />
          </div>
          <PrimaryButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </PrimaryButton>
          <button className="otp-resend-button" type="button" disabled={isSubmitting} onClick={() => { setStep("email"); setStatus({ type: "", message: "" }); }}>
            Use a different email
          </button>
        </form>
      )}

      {step === "done" && (
        <div className="auth-form reset-password-form">
          <div className="success-card">
            <span aria-hidden="true" />
            <div>
              <h2>Password reset successful!</h2>
              <p>Your password has been updated. You can now sign in with your new password.</p>
              <a className="primary-button" href="#/signin" style={{ display: "inline-block", marginTop: "1rem", textAlign: "center", textDecoration: "none" }}>
                Sign In
              </a>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
