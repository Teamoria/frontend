import { useEffect, useRef, useState } from "react";
import {
  FiActivity,
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiCheckCircle,
  FiCpu,
  FiFileText,
  FiFolder,
  FiLayers,
  FiLock,
  FiMenu,
  FiMessageSquare,
  FiPlayCircle,
  FiShield,
  FiUsers,
  FiX,
  FiZap
} from "react-icons/fi";
import Brand from "../components/Brand.jsx";
import PreferenceControls from "../components/app/PreferenceControls.jsx";
import { usePreferences } from "../lib/PreferencesContext.jsx";
import "../styles/landing-next.css";

const messages = {
  ar: {
    nav: { home: "الرئيسية", capabilities: "ما الذي يربطه؟", flow: "كيف يعمل؟", roles: "لكل دور" },
    login: "تسجيل الدخول",
    start: "أنشئ مساحة شركتك",
    brandTagline: "نظام تشغيل الفريق",
    badge: "من المعرفة إلى قرار قابل للتنفيذ",
    headlineA: "كل ما يعرفه فريقك،",
    headlineB: "يتحوّل إلى عمل واضح.",
    heroText: "يجمع Teamoria المشاريع والمهام والاجتماعات والملفات في مساحة واحدة، ثم يمنح كل شخص إجابة موثّقة ورؤية تناسب صلاحياته.",
    primaryCta: "ابدأ بمساحة شركتك",
    demoCta: "استكشف مساحة تجريبية",
    proof: ["إجابات مرتبطة بالمصادر", "صلاحيات حسب الدور", "تحديثات لحظية"],
    canvasKicker: "نبض مساحة العمل",
    canvasLive: "متصل الآن",
    sourceLabel: "مصادر الفريق",
    sources: ["خطة الإطلاق.pdf", "اجتماع التسليم", "مهام المشروع"],
    analysisLabel: "تحليل Teamoria",
    analysisTitle: "تعارض يهدد موعد التسليم",
    analysisText: "مهمتان تعتمدان على مراجعة واحدة لم تُنجز بعد.",
    confidence: "3 مصادر مرتبطة",
    decisionLabel: "قرار مقترح",
    decisionTitle: "أعد توزيع المراجعة قبل الخميس",
    decisionAction: "مراجعة الإجراء",
    signalTitle: "ليست لوحة أخرى لإدارة المهام.",
    signalText: "إنها طبقة تصل ما يحدث، وما يعرفه الفريق، وما يجب فعله بعد ذلك.",
    capabilitiesEyebrow: "نسيج قرار واحد",
    capabilitiesTitle: "أربع مساحات تعمل كسياق واحد",
    capabilitiesText: "لا ينتقل فريقك بين جزر منفصلة. كل مهمة تعرف مشروعها، وكل إجابة تُظهر مصدرها، وكل ملف يمكن أن يتحول إلى قرار أو إجراء.",
    capabilities: [
      { title: "العمل المنظم", text: "مشاريع ومهام وأعضاء وتبعيات وحالات تقدّم، ضمن حدود الشركة والصلاحية.", tag: "المشاريع + المهام" },
      { title: "معرفة قابلة للسؤال", text: "ارفع مستندًا أو تسجيلًا، ودع Teamoria يحفظ الملخص والقرارات والسياق القابل للبحث.", tag: "الملفات + الاجتماعات" },
      { title: "مساعد يذكر مصادره", text: "اسأل عن خطر أو قرار أو مهمة؛ تحصل على إجابة من سياق العمل الذي يحق لك رؤيته فقط.", tag: "RAG موثّق" },
      { title: "رؤية تناسب المسؤولية", text: "المالك يرى المخاطر والقرارات، المدير يرى ما يهدد التسليم، والعضو يرى ما عليه اليوم.", tag: "صلاحيات ذكية" }
    ],
    flowEyebrow: "من الإشارة إلى الإجراء",
    flowTitle: "مسار مفهوم يمكن للفريق تتبّعه",
    flowText: "يبقى الإنسان صاحب القرار؛ يساعده Teamoria على الوصول إليه بسرعة وبسياق واضح.",
    steps: [
      { title: "اجمع السياق", text: "مشاريع، مهام، ملفات واجتماعات داخل مساحة الشركة." },
      { title: "افهم الإشارة", text: "تحليل المحتوى وربطه بالمشروع والأشخاص والصلاحيات." },
      { title: "راجع الدليل", text: "كل إجابة أو نتيجة مهمة تعود إلى مصدر يمكن فتحه." },
      { title: "حوّلها إلى عمل", text: "أنشئ مهمة أو حدّث قرارًا بعد مراجعة بشرية واضحة." }
    ],
    rolesEyebrow: "واجهة تتبدّل حسب الدور",
    rolesTitle: "المعلومة نفسها، بالزاوية المناسبة لكل شخص",
    roles: [
      { name: "مالك الشركة", question: "ما الذي يحتاج قراري الآن؟", details: ["المخاطر عبر المشاريع", "الفريق والصلاحيات", "صحة العمل والاشتراك"] },
      { name: "مدير الشركة", question: "ما الذي يهدد التسليم؟", details: ["تقدم المشاريع والمهام", "تعارضات الفريق", "سياق الملفات والمساعد"] },
      { name: "عضو الفريق", question: "ما الذي عليّ إنجازه اليوم؟", details: ["المهام المعيّنة", "الملفات المشتركة", "إجابات ضمن الصلاحية"] }
    ],
    trustEyebrow: "الثقة جزء من التجربة",
    trustTitle: "السياق لا يتجاوز صلاحيات صاحبه.",
    trustText: "تعزل Teamoria بيانات كل شركة، وتربط الوصول بدور المستخدم وعضويته في المشروع. المساعد يسترجع فقط ما تسمح به هذه الحدود.",
    trustItems: ["مصادقة API آمنة", "قنوات خاصة للتحديث اللحظي", "إجابات مرتبطة بالمصادر"],
    ctaEyebrow: "ابدأ من سياق فريقك الحقيقي",
    ctaTitle: "امنح فريقك مساحة تعرف لماذا، لا ماذا فقط.",
    ctaText: "أنشئ حساب مالك الشركة، فعّل بريدك، ثم جهّز مساحة العمل وأضف فريقك.",
    ctaPrimary: "إنشاء حساب الشركة",
    ctaSecondary: "لدي حساب بالفعل",
    footerText: "منصة تشغيل مؤسسية تربط المعرفة بالقرار والعمل.",
    footerProduct: "المنتج",
    footerAccount: "الحساب",
    footerRights: "© 2026 Teamoria. جميع الحقوق محفوظة.",
    menu: "فتح القائمة",
    close: "إغلاق القائمة"
  },
  en: {
    nav: { home: "Home", capabilities: "What it connects", flow: "How it works", roles: "For every role" },
    login: "Sign in",
    start: "Create your company space",
    brandTagline: "Team operating system",
    badge: "From knowledge to an executable decision",
    headlineA: "Everything your team knows",
    headlineB: "becomes clear work.",
    heroText: "Teamoria brings projects, tasks, meetings, and files into one space, then gives each person cited answers and the view their permissions allow.",
    primaryCta: "Create your workspace",
    demoCta: "Explore a demo space",
    proof: ["Source-linked answers", "Role-aware access", "Realtime updates"],
    canvasKicker: "Workspace pulse",
    canvasLive: "Connected now",
    sourceLabel: "Team sources",
    sources: ["Launch plan.pdf", "Delivery meeting", "Project tasks"],
    analysisLabel: "Teamoria analysis",
    analysisTitle: "A dependency threatens delivery",
    analysisText: "Two tasks depend on the same review that is still pending.",
    confidence: "3 linked sources",
    decisionLabel: "Suggested decision",
    decisionTitle: "Reassign the review before Thursday",
    decisionAction: "Review action",
    signalTitle: "Not another task dashboard.",
    signalText: "It is the layer connecting what happens, what the team knows, and what should happen next.",
    capabilitiesEyebrow: "One decision fabric",
    capabilitiesTitle: "Four spaces working as one context",
    capabilitiesText: "Your team does not move between isolated islands. Every task knows its project, every answer shows its source, and every file can become a decision or an action.",
    capabilities: [
      { title: "Structured work", text: "Projects, tasks, members, dependencies, and progress within company and permission boundaries.", tag: "Projects + tasks" },
      { title: "Knowledge you can ask", text: "Upload a document or recording; Teamoria preserves its summary, decisions, and searchable context.", tag: "Files + meetings" },
      { title: "An assistant that cites", text: "Ask about a risk, decision, or task and get an answer only from work context you are allowed to see.", tag: "Cited RAG" },
      { title: "A view for each responsibility", text: "Owners see risks and decisions, managers see delivery threats, and members see what matters today.", tag: "Role-aware" }
    ],
    flowEyebrow: "From signal to action",
    flowTitle: "A traceable path the team can understand",
    flowText: "People remain in control; Teamoria helps them reach a decision faster with clear context.",
    steps: [
      { title: "Gather context", text: "Projects, tasks, files, and meetings inside the company space." },
      { title: "Understand the signal", text: "Analyze content and connect it to projects, people, and permissions." },
      { title: "Review the evidence", text: "Every important answer or result links back to a source you can open." },
      { title: "Turn it into work", text: "Create a task or update a decision after a clear human review." }
    ],
    rolesEyebrow: "An interface shaped by role",
    rolesTitle: "The same truth, at the right angle for each person",
    roles: [
      { name: "Company owner", question: "What needs my decision now?", details: ["Cross-project risks", "Team and permissions", "Workspace and subscription health"] },
      { name: "Company manager", question: "What threatens delivery?", details: ["Project and task progress", "Team conflicts", "File and assistant context"] },
      { name: "Team member", question: "What should I finish today?", details: ["Assigned tasks", "Shared files", "Permission-aware answers"] }
    ],
    trustEyebrow: "Trust is part of the experience",
    trustTitle: "Context never exceeds its owner's access.",
    trustText: "Teamoria isolates every company's data and binds access to user roles and project membership. The assistant retrieves only what those boundaries allow.",
    trustItems: ["Secure API authentication", "Private realtime channels", "Source-linked answers"],
    ctaEyebrow: "Start with your team's real context",
    ctaTitle: "Give your team a space that knows why, not only what.",
    ctaText: "Create a company-owner account, verify your email, then set up the workspace and invite your team.",
    ctaPrimary: "Create company account",
    ctaSecondary: "I already have an account",
    footerText: "An enterprise operating platform connecting knowledge, decisions, and work.",
    footerProduct: "Product",
    footerAccount: "Account",
    footerRights: "© 2026 Teamoria. All rights reserved.",
    menu: "Open menu",
    close: "Close menu"
  }
};

const capabilityIcons = [FiLayers, FiFileText, FiCpu, FiShield];
const roleIcons = [FiZap, FiActivity, FiCheckCircle];

export default function LandingPage() {
  const { direction, language } = usePreferences();
  const [navOpen, setNavOpen] = useState(false);
  const menuRef = useRef(null);
  const copy = messages[language] || messages.en;
  const ForwardIcon = direction === "rtl" ? FiArrowLeft : FiArrowRight;

  useEffect(() => {
    document.body.classList.add("tm-public-page");
    return () => document.body.classList.remove("tm-public-page");
  }, []);

  useEffect(() => {
    function closeOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setNavOpen(false);
    }
    function closeOnEscape(event) {
      if (event.key === "Escape") setNavOpen(false);
    }
    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <main className="tm-home" dir={direction} id="main-content" tabIndex="-1">
      <header className="tm-home-header">
        <nav className="tm-home-container tm-home-nav" aria-label={copy.nav.home}>
          <Brand className="tm-home-brand" tagline={copy.brandTagline} />

          <div className="tm-home-nav-links">
            <a href="#home">{copy.nav.home}</a>
            <a href="#capabilities">{copy.nav.capabilities}</a>
            <a href="#flow">{copy.nav.flow}</a>
            <a href="#roles">{copy.nav.roles}</a>
          </div>

          <div className="tm-home-nav-actions" ref={menuRef}>
            <PreferenceControls className="tm-home-preferences" />
            <a className="tm-home-login" href="#/signin">{copy.login}</a>
            <a className="tm-home-nav-cta" href="#/signup">{copy.start}</a>
            <button
              className="tm-home-menu-button"
              type="button"
              aria-label={navOpen ? copy.close : copy.menu}
              aria-expanded={navOpen}
              onClick={() => setNavOpen((value) => !value)}
            >
              {navOpen ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
            </button>

            {navOpen ? (
              <div className="tm-home-mobile-menu">
                {Object.entries(copy.nav).map(([key, value]) => (
                  <a href={key === "home" ? "#home" : `#${key}`} key={key} onClick={() => setNavOpen(false)}>{value}</a>
                ))}
                <hr />
                <a href="#/signin" onClick={() => setNavOpen(false)}>{copy.login}</a>
                <a className="is-primary" href="#/signup" onClick={() => setNavOpen(false)}>{copy.start}</a>
              </div>
            ) : null}
          </div>
        </nav>
      </header>

      <section className="tm-home-hero" id="home">
        <div className="tm-home-container tm-home-hero-grid">
          <div className="tm-home-hero-copy">
            <span className="tm-home-eyebrow"><FiZap aria-hidden="true" />{copy.badge}</span>
            <h1><span>{copy.headlineA}</span> {copy.headlineB}</h1>
            <p>{copy.heroText}</p>
            <div className="tm-home-hero-actions">
              <a className="tm-home-primary-button" href="#/signup">{copy.primaryCta}<ForwardIcon aria-hidden="true" /></a>
              <a className="tm-home-secondary-button" href="#/dashboard?role=admin"><FiPlayCircle aria-hidden="true" />{copy.demoCta}</a>
            </div>
            <div className="tm-home-proof" aria-label="Product principles">
              {copy.proof.map((item) => <span key={item}><FiCheck aria-hidden="true" />{item}</span>)}
            </div>
          </div>

          <DecisionCanvas copy={copy} />
        </div>
      </section>

      <section className="tm-home-signal-band">
        <div className="tm-home-container">
          <span className="tm-home-signal-mark" aria-hidden="true"><i /><i /><i /><FiActivity /></span>
          <div><h2>{copy.signalTitle}</h2><p>{copy.signalText}</p></div>
        </div>
      </section>

      <section className="tm-home-section tm-home-capabilities" id="capabilities">
        <div className="tm-home-container">
          <SectionIntro eyebrow={copy.capabilitiesEyebrow} title={copy.capabilitiesTitle} text={copy.capabilitiesText} />
          <div className="tm-capability-grid">
            {copy.capabilities.map((item, index) => {
              const Icon = capabilityIcons[index];
              return (
                <article className={`tm-capability-card tm-capability-card--${index + 1}`} key={item.title}>
                  <div className="tm-capability-card-top"><span><Icon aria-hidden="true" /></span><small>{item.tag}</small></div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  {index === 1 ? <MiniTrace direction={direction} /> : null}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="tm-home-section tm-home-flow" id="flow">
        <div className="tm-home-container tm-flow-layout">
          <SectionIntro eyebrow={copy.flowEyebrow} title={copy.flowTitle} text={copy.flowText} />
          <ol className="tm-flow-steps">
            {copy.steps.map((step, index) => (
              <li key={step.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><h3>{step.title}</h3><p>{step.text}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="tm-home-section tm-home-roles" id="roles">
        <div className="tm-home-container">
          <SectionIntro eyebrow={copy.rolesEyebrow} title={copy.rolesTitle} />
          <div className="tm-role-grid">
            {copy.roles.map((role, index) => {
              const Icon = roleIcons[index];
              return (
                <article className="tm-role-card" key={role.name}>
                  <header><span><Icon aria-hidden="true" /></span><small>{role.name}</small></header>
                  <h3>{role.question}</h3>
                  <ul>{role.details.map((detail) => <li key={detail}><FiCheckCircle aria-hidden="true" />{detail}</li>)}</ul>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="tm-home-trust">
        <div className="tm-home-container tm-trust-card">
          <div className="tm-trust-icon"><FiLock aria-hidden="true" /></div>
          <div><span className="tm-section-eyebrow">{copy.trustEyebrow}</span><h2>{copy.trustTitle}</h2><p>{copy.trustText}</p></div>
          <ul>{copy.trustItems.map((item) => <li key={item}><FiShield aria-hidden="true" />{item}</li>)}</ul>
        </div>
      </section>

      <section className="tm-home-cta">
        <div className="tm-home-container tm-home-cta-card">
          <div><span>{copy.ctaEyebrow}</span><h2>{copy.ctaTitle}</h2><p>{copy.ctaText}</p></div>
          <div><a className="tm-home-primary-button" href="#/signup">{copy.ctaPrimary}<ForwardIcon aria-hidden="true" /></a><a href="#/signin">{copy.ctaSecondary}</a></div>
        </div>
      </section>

      <footer className="tm-home-footer">
        <div className="tm-home-container tm-home-footer-grid">
          <div><Brand className="tm-home-footer-brand" tagline={copy.brandTagline} /><p>{copy.footerText}</p></div>
          <div><b>{copy.footerProduct}</b><a href="#capabilities">{copy.nav.capabilities}</a><a href="#flow">{copy.nav.flow}</a><a href="#roles">{copy.nav.roles}</a></div>
          <div><b>{copy.footerAccount}</b><a href="#/signin">{copy.login}</a><a href="#/signup">{copy.start}</a></div>
        </div>
        <div className="tm-home-container tm-home-footer-bottom"><span>{copy.footerRights}</span><span><FiActivity aria-hidden="true" />Decision Fabric</span></div>
      </footer>
    </main>
  );
}

function DecisionCanvas({ copy }) {
  return (
    <div className="tm-decision-canvas" aria-label={copy.canvasKicker}>
      <header><div><span className="tm-canvas-pulse"><i /></span><b>{copy.canvasKicker}</b></div><small>{copy.canvasLive}</small></header>
      <div className="tm-canvas-body">
        <section className="tm-canvas-sources">
          <span>{copy.sourceLabel}</span>
          {copy.sources.map((source, index) => {
            const Icon = index === 0 ? FiFileText : index === 1 ? FiMessageSquare : FiFolder;
            return <article key={source}><i><Icon aria-hidden="true" /></i><b>{source}</b><small>{index + 1}</small></article>;
          })}
        </section>
        <div className="tm-canvas-trace" aria-hidden="true"><i /><i /><i /><span><FiCpu /></span><i /><i /></div>
        <section className="tm-canvas-analysis">
          <span>{copy.analysisLabel}</span><h3>{copy.analysisTitle}</h3><p>{copy.analysisText}</p><small><FiLayers aria-hidden="true" />{copy.confidence}</small>
        </section>
        <section className="tm-canvas-decision">
          <span>{copy.decisionLabel}</span><h3>{copy.decisionTitle}</h3><button type="button">{copy.decisionAction}<FiArrowLeft aria-hidden="true" /></button>
        </section>
      </div>
    </div>
  );
}

function MiniTrace({ direction }) {
  const ForwardIcon = direction === "rtl" ? FiArrowLeft : FiArrowRight;
  return (
    <div className="tm-mini-trace" aria-hidden="true">
      <span><FiFileText /></span><i /><span><FiCpu /></span><i /><span><ForwardIcon /></span>
    </div>
  );
}

function SectionIntro({ eyebrow, title, text }) {
  return (
    <div className="tm-section-intro"><span className="tm-section-eyebrow">{eyebrow}</span><h2>{title}</h2>{text ? <p>{text}</p> : null}</div>
  );
}
