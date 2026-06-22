import AuthLayout from "../components/AuthLayout.jsx";
import { PrimaryButton, TextInput } from "../components/FormControls.jsx";

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      variant="security"
      title="Your security, our priority."
      text="We'll help you get back to your account in no time."
    >
      <div className="auth-form">
        <h1>Reset your password</h1>
        <p>Enter your email and we'll send you a reset link</p>
        <div className="form-stack">
          <span className="label">Email address</span>
          <TextInput icon="@" placeholder="you@example.com" />
        </div>
        <PrimaryButton>Send Reset Link</PrimaryButton>
        <a className="back-link" href="#/signin">&lt;- Back to Sign In</a>
        <div className="success-card">
          <span>OK</span>
          <div>
            <h2>Reset link sent!</h2>
            <p>We've sent a password reset link to <b>you@example.com</b>.</p>
            <p>Please check your inbox and follow the instructions to reset your password.</p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
