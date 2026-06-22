export function TextInput({ icon, type = "text", placeholder, value }) {
  return (
    <label className="field">
      <span className="field-icon" aria-hidden="true">{icon}</span>
      <input type={type} placeholder={placeholder} defaultValue={value} />
    </label>
  );
}

export function PrimaryButton({ children }) {
  return <button className="primary-button" type="button">{children}</button>;
}

export function GhostButton({ children }) {
  return <button className="ghost-button" type="button">{children}</button>;
}

export function GoogleButton({ children = "Continue with Google" }) {
  return (
    <button className="google-button" type="button">
      <span className="google-icon" aria-hidden="true">
        <i>G</i>
      </span>
      {children}
    </button>
  );
}
