export function TextInput({
  autoComplete,
  icon,
  inputMode,
  type = "text",
  placeholder,
  value,
  name,
  required = false,
  disabled = false,
  ...inputProps
}) {
  return (
    <label className="field input-wrapper">
      <span className="field-icon icon" aria-hidden="true">{icon}</span>
      <input
        autoComplete={autoComplete}
        defaultValue={value}
        disabled={disabled}
        inputMode={inputMode}
        name={name}
        placeholder={placeholder}
        required={required}
        type={type}
        {...inputProps}
      />
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
