export function TextInput({
  autoComplete,
  error,
  icon,
  inputMode,
  type = "text",
  placeholder,
  value,
  name,
  required = false,
  disabled = false,
  wrapperClassName = "",
  ...inputProps
}) {
  const errorId = error ? `${name}-error` : undefined;

  return (
    <label className={`field input-wrapper ${error ? "field--invalid" : ""} ${wrapperClassName}`.trim()}>
      {icon ? <span className="field-icon icon" aria-hidden="true">{icon}</span> : null}
      <input
        aria-describedby={errorId}
        aria-invalid={error ? "true" : "false"}
        aria-required={required ? "true" : undefined}
        autoComplete={autoComplete}
        disabled={disabled}
        inputMode={inputMode}
        name={name}
        placeholder={placeholder}
        required={false}
        type={type}
        value={value}
        {...inputProps}
      />
      {error ? <small className="field-error" id={errorId}>{error}</small> : null}
    </label>
  );
}

export function PrimaryButton({ children, onClick, type = "button", className = "", disabled = false, isLoading = false, loadingText = "Loading..." }) {
  return (
    <button
      className={`primary-button ${isLoading ? "is-loading" : ""} ${className}`.trim()}
      disabled={disabled || isLoading}
      onClick={onClick}
      type={type}
    >
      {isLoading ? <span className="button-spinner" aria-hidden="true" /> : null}
      <span>{isLoading ? loadingText : children}</span>
    </button>
  );
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
