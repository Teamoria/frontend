import AuthLayout from "../components/AuthLayout.jsx";
import { GoogleButton, PrimaryButton, TextInput } from "../components/FormControls.jsx";

export default function SignUpPage() {
  return (
    <AuthLayout
      variant="signup"
      title="Start building better project momentum"
      text="Create a workspace for your team and move from scattered updates to clear execution."
    >
      <div className="auth-form">
        <h1>Create account</h1>
        <p>Set up your Teamoria workspace</p>
        <div className="form-stack">
          <span className="label">Full name</span>
          <TextInput icon="U" placeholder="Alex Morgan" />
          <span className="label">Work email</span>
          <TextInput icon="@" placeholder="you@company.com" />
          <span className="label">Password</span>
          <TextInput icon="[]" type="password" placeholder="Create a strong password" />
        </div>
        <PrimaryButton>Create Workspace</PrimaryButton>
        <div className="divider"><span>or sign up with</span></div>
        <GoogleButton>Sign up with Google</GoogleButton>
        <p className="auth-switch">Already have an account? <a className="auth-inline-action" href="#/signin">Sign in</a></p>
      </div>
    </AuthLayout>
  );
}
