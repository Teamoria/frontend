import logoImage from "../assets/teamoria-logo.png";

export default function Brand({
  compact = false,
  tagline = "AI Workspace",
  className = "",
  href = "#/"
}) {
  return (
    <a
      aria-label={`Teamoria — ${tagline}`}
      className={`brand ${compact ? "brand--compact" : ""} ${className}`.trim()}
      href={href}
    >
      <span className="brand-mark" aria-hidden="true">
        <img src={logoImage} alt="" decoding="async" />
      </span>
      <span className="brand-word">
        <span className="brand-name">Teamoria</span>
        <small>{tagline}</small>
      </span>
    </a>
  );
}
