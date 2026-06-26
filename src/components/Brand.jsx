import logoImage from "../assets/teamoria-logo.png";

export default function Brand({ compact = false, tagline = "AI Workspace" }) {
  return (
    <a className={`brand ${compact ? "brand--compact" : ""}`} href="#/">
      <span className="brand-mark" aria-hidden="true">
        <img src={logoImage} alt="" />
      </span>
      <span className="brand-word">
        Teamoria
        <small>{tagline}</small>
      </span>
    </a>
  );
}
