export function TextInput({ icon, type = "text", placeholder, value, name, required = false }) {
  return (
    <label className="field input-wrapper">
      <span className="field-icon icon" aria-hidden="true">{icon}</span>
      <input name={name} required={required} type={type} placeholder={placeholder} defaultValue={value} />
    </label>
  );
}

export function PrimaryButton({ children, onClick, type = "button", className = "" }) {
  return <button className={`primary-button ${className}`} onClick={onClick} type={type}>{children}</button>;
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
