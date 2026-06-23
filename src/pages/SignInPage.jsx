import AuthLayout from "../components/AuthLayout.jsx";
import { GoogleButton, PrimaryButton, TextInput } from "../components/FormControls.jsx";

export default function SignInPage() {
  return (
    <AuthLayout
      title="The Intelligent Project Nervous System"
      text="Plan, track, and improve team delivery with one intelligent workspace."
    >
      <div className="auth-form">
        <h1>Welcome back</h1>
        <p>Sign in to continue to Teamoria</p>
        <div className="form-stack">
          <span className="label">Email</span>
          <TextInput icon="@" placeholder="you@company.com" />
          <span className="label">Password</span>
          <TextInput icon="[]" type="password" placeholder="Password" />
        </div>
        <div className="form-row">
          <label className="checkbox"><input type="checkbox" /> Remember me</label>
          <a href="#/reset-password">Forgot password?</a>
        </div>
        <PrimaryButton>Sign In</PrimaryButton>
        <div className="divider"><span>or continue with</span></div>
        <div className="social-row">
          <GoogleButton>Sign in with Google</GoogleButton>
          <button type="button"><b>M</b> Continue with Microsoft</button>
        </div>
        <p className="auth-switch">Don't have an account? <a href="#/signup">Sign up</a></p>
      </div>
    </AuthLayout>
  );
}
