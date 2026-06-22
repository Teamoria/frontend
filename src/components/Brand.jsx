export default function Brand({ compact = false }) {
  return (
    <a className={`brand ${compact ? "brand--compact" : ""}`} href="#/">
      <span className="brand-mark" aria-hidden="true">
        <span className="brand-mark__stem" />
      </span>
      <span>Teamoria</span>
    </a>
  );
}
