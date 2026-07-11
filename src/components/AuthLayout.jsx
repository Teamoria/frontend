import Brand from "./Brand.jsx";
import PreferenceControls from "./app/PreferenceControls.jsx";
import { FiCheckCircle, FiCpu, FiFileText, FiLayers, FiShield, FiUsers, FiVideo } from "react-icons/fi";
import { usePreferences } from "../lib/PreferencesContext.jsx";
import "../styles/auth.css";
import "../styles/auth-next.css";

const layoutCopy = {
  ar: {
    tagline: "مساحة عمل مدعومة بالذكاء الاصطناعي",
    eyebrow: "نظام تشغيل موحّد لفريقك",
    projects: "المشاريع",
    projectStatus: "المسار واضح",
    meetings: "الاجتماعات",
    meetingStatus: "المعرفة محفوظة",
    team: "الفريق",
    teamStatus: "الأدوار متناسقة",
    ai: "مساعد Teamoria",
    aiStatus: "السياق متصل",
    live: "المساحة متزامنة الآن",
    security: "دخول آمن ومشفّر إلى مساحة شركتك",
    backHome: "العودة إلى الرئيسية"
  },
  en: {
    tagline: "AI-powered workspace",
    eyebrow: "One operating system for your team",
    projects: "Projects",
    projectStatus: "Work stays aligned",
    meetings: "Meetings",
    meetingStatus: "Knowledge is captured",
    team: "Team",
    teamStatus: "Roles stay in sync",
    ai: "Teamoria AI",
    aiStatus: "Context stays connected",
    live: "Workspace is synchronized",
    security: "Secure, encrypted access to your company workspace",
    backHome: "Back to home"
  }
};

export default function AuthLayout({
  variant = "analytics",
  title,
  text,
  eyebrow,
  children,
  className = "",
  visualContent = null
}) {
  const { language, direction } = usePreferences();
  const copy = layoutCopy[language] || layoutCopy.en;

  return (
    <main className={`auth-shell auth-shell--next auth-shell--${variant} ${className}`.trim()} dir={direction}>
      <aside className={`auth-visual auth-visual--${variant}`}>
        <div className="auth-visual-topbar">
          <Brand className="auth-brand" tagline={copy.tagline} />
          <a className="auth-home-link" href="#/">
            <span aria-hidden="true">←</span>
            {copy.backHome}
          </a>
        </div>
        <div className="auth-copy">
          <span className="auth-eyebrow"><FiCpu aria-hidden="true" />{eyebrow || copy.eyebrow}</span>
          <h1>{title}</h1>
          <p>{text}</p>
        </div>
        {visualContent || <WorkspaceConstellation copy={copy} />}
        <div className="auth-visual-note">
          <FiCheckCircle aria-hidden="true" />
          <span>{copy.live}</span>
        </div>
      </aside>
      <section className="auth-panel">
        <div className="auth-panel-topbar">
          <Brand className="auth-mobile-brand" compact tagline={copy.tagline} />
          <PreferenceControls className="auth-preference-controls" />
        </div>
        <div className="auth-panel-content">{children}</div>
        <footer className="auth-panel-footer">
          <FiShield aria-hidden="true" />
          <span>{copy.security}</span>
        </footer>
      </section>
    </main>
  );
}

function WorkspaceConstellation({ copy }) {
  return (
    <div className="auth-constellation" aria-hidden="true">
      <svg className="auth-constellation-lines" viewBox="0 0 720 360" preserveAspectRatio="none">
        <path d="M360 180 C292 150 245 112 172 88" />
        <path d="M360 180 C428 146 486 111 562 89" />
        <path d="M360 180 C296 221 245 259 174 278" />
        <path d="M360 180 C427 219 486 256 560 277" />
      </svg>

      <div className="auth-hub">
        <span className="auth-hub-orbit"><i /><i /><i /></span>
        <div className="auth-hub-icon"><FiCpu /></div>
        <small>Teamoria</small>
        <strong>{copy.ai}</strong>
        <span>{copy.aiStatus}</span>
      </div>

      <ConstellationNode className="auth-node--projects" icon={<FiLayers />} label={copy.projects} status={copy.projectStatus} />
      <ConstellationNode className="auth-node--meetings" icon={<FiVideo />} label={copy.meetings} status={copy.meetingStatus} />
      <ConstellationNode className="auth-node--team" icon={<FiUsers />} label={copy.team} status={copy.teamStatus} />
      <div className="auth-context-chip auth-context-chip--document"><FiFileText /><span>Context</span></div>
      <div className="auth-context-chip auth-context-chip--secure"><FiShield /><span>Secure</span></div>
    </div>
  );
}

function ConstellationNode({ className, icon, label, status }) {
  return (
    <div className={`auth-node ${className}`}>
      <span className="auth-node-icon">{icon}</span>
      <span>
        <strong>{label}</strong>
        <small>{status}</small>
      </span>
      <i />
    </div>
  );
}

function AnalyticsArtwork() {
  return (
    <div className="analytics-art" aria-hidden="true">
      <div className="project-illustration">
        <div className="tablet-screen">
          <div className="tablet-top" />
          <div className="tablet-body">
            <div className="tablet-chart" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SecurityArtwork() {
  return (
    <div className="security-art" aria-hidden="true">
      <div className="shield">
        <div className="lock">
          <span />
        </div>
      </div>
      <div className="check-badge">OK</div>
      <div className="user-badge">U</div>
      <div className="password-dots">***</div>
    </div>
  );
}
