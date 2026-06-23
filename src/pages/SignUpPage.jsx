import AuthLayout from "../components/AuthLayout.jsx";
import { GoogleButton, PrimaryButton, TextInput } from "../components/FormControls.jsx";

export default function SignUpPage() {
  function handleSubmit(event) {
    event.preventDefault();
    window.location.hash = "/dashboard";
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

        <div className="signup-steps">
          {["User", "Company", "Role", "Workspace"].map((step, index) => (
            <span className={index < 3 ? "active" : ""} key={step}>{step}</span>
          ))}
        </div>

        <div className="form-stack">
          <span className="label">Full name</span>
          <TextInput icon="U" name="fullName" placeholder="Alex Morgan" required />

          <span className="label">Work email</span>
          <TextInput icon="@" name="email" type="email" placeholder="you@company.com" required />

          <span className="label">Company name</span>
          <TextInput icon="C" name="company" placeholder="Taqat Digital" required />

          <span className="label">Job title / Role</span>
          <label className="field">
            <span className="field-icon" aria-hidden="true">R</span>
            <select name="role" defaultValue="project-manager">
              <option value="admin">Company Admin</option>
              <option value="general-manager">General Manager</option>
              <option value="project-manager">Project Manager</option>
              <option value="employee">Employee</option>
            </select>
          </label>

          <span className="label">Password</span>
          <TextInput icon="[]" name="password" type="password" placeholder="Create a strong password" required />
        </div>

        <PrimaryButton type="submit">Create Workspace</PrimaryButton>
        <div className="divider"><span>or sign up with</span></div>
        <GoogleButton>Sign up with Google</GoogleButton>
        <p className="auth-switch">Already have an account? <a className="auth-inline-action" href="#/signin">Sign in</a></p>
      </form>
    </AuthLayout>
  );
}
