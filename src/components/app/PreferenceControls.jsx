import { FiGlobe, FiMoon, FiSun } from "react-icons/fi";
import { usePreferences } from "../../lib/PreferencesContext.jsx";

export default function PreferenceControls({ className = "", showLabels = false }) {
  const { language, resolvedTheme, t, toggleLanguage, toggleTheme } = usePreferences();
  const ThemeIcon = resolvedTheme === "dark" ? FiSun : FiMoon;

  return (
    <div className={`preference-controls ${className}`.trim()}>
      <button
        className="preference-control"
        type="button"
        aria-label={t("switchLanguage")}
        title={t("switchLanguage")}
        onClick={toggleLanguage}
      >
        <FiGlobe aria-hidden="true" />
        <span>{showLabels ? (language === "ar" ? "EN" : "العربية") : language === "ar" ? "EN" : "ع"}</span>
      </button>
      <button
        className="preference-control"
        type="button"
        aria-label={t("switchTheme")}
        title={resolvedTheme === "dark" ? t("lightTheme") : t("darkTheme")}
        onClick={toggleTheme}
      >
        <ThemeIcon aria-hidden="true" />
        {showLabels ? <span>{resolvedTheme === "dark" ? t("lightTheme") : t("darkTheme")}</span> : null}
      </button>
    </div>
  );
}
