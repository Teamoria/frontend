export function TextInput({ icon, type = "text", placeholder, value, name, required = false, disabled = false }) {
  return (
    <label className="field input-wrapper">
      <span className="field-icon icon" aria-hidden="true">{icon}</span>
      <input name={name} required={required} type={type} placeholder={placeholder} defaultValue={value} disabled={disabled} />
    </label>
  );
}

export function PrimaryButton({ children, onClick, type = "button", className = "", disabled = false }) {
  return <button className={`primary-button ${className}`} disabled={disabled} onClick={onClick} type={type}>{children}</button>;
}

export function GhostButton({ children }) {
  return <button className="ghost-button" type="button">{children}</button>;
}

export function GoogleButton({ children = "Continue with Google", disabled = false, onClick }) {
  return (
    <button className="google-button" disabled={disabled} onClick={onClick} type="button">
      <span className="google-icon" aria-hidden="true">
        <i>G</i>
      </span>
      {children}
    </button>
  );
}
