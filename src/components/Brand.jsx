import logoImage from "../assets/teamoria-logo.png";

export default function Brand({ compact = false }) {
  return (
    <a className={`brand ${compact ? "brand--compact" : ""}`} href="#/">
      <span className="brand-mark" aria-hidden="true">
        <img src={logoImage} alt="" />
      </span>
      <span className="brand-word">
        Teamoria
        <small>AI Workspace</small>
      </span>
    </a>
  );
}
