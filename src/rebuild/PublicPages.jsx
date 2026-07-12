import { useEffect, useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiBarChart2,
  FiBriefcase,
  FiCheck,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiFileText,
  FiGlobe,
  FiLock,
  FiMail,
  FiMapPin,
  FiMessageSquare,
  FiShield,
  FiTag,
  FiUser,
  FiUsers,
  FiZap
} from "react-icons/fi";
import Brand from "../components/Brand.jsx";
import GoogleAuthButton from "../components/GoogleAuthButton.jsx";
import featureMeetings from "../assets/feature-meeting-summaries.webp";
import featureProjects from "../assets/feature-project-management.webp";
import featureAssistant from "../assets/feature-smart-assistant.webp";
import { useAuth } from "../lib/AuthContext.jsx";
import { getPostLoginPath } from "../lib/authRoles.js";
import { getAuthPageCopy, getLocalizedRequestError } from "../lib/authPageCopy.js";
import {
  forgotPasswordSendOtp,
  loginWithEmail,
  registerCompany,
  registerWithEmail,
  sendOtp,
  verifyOtp
} from "../lib/api.js";
import { clearPendingSignup, getPendingCompanyName, getPendingSignup, setPendingSignup } from "../lib/pendingRegistration.js";
import { usePreferences } from "../lib/PreferencesContext.jsx";
import { PublicPreferenceControls } from "./WorkspaceShell.jsx";
import { Button, Field } from "./ui.jsx";

const landingCopy = {
  ar: {
    navProduct: "المنتج",
    navWorkflow: "طريقة العمل",
    navSecurity: "التحكم",
    signIn: "تسجيل الدخول",
    start: "ابدأ مساحة شركتك",
    demo: "استكشف مساحة تجريبية",
    heroKicker: "سياق واحد للعمل والقرار",
    heroTitle: "Teamoria",
    heroText: "نظام تشغيل للفريق يربط المشاريع والمهام والاجتماعات والملفات بمساعد ذكي يستند إلى معرفة شركتك.",
    liveContext: "مساحة العمل الآن",
    liveSignal: "3 قرارات تحتاج مراجعة",
    source: "المصادر",
    understanding: "الفهم",
    decision: "القرار",
    action: "التنفيذ",
    productEyebrow: "المساحة المشتركة",
    productTitle: "المعلومة لا تبقى معزولة عن العمل.",
    productText: "كل ملف واجتماع ومهمة يبقى داخل سياقه، بحيث يستطيع الفريق معرفة ما حدث ولماذا وما الخطوة التالية.",
    projectTitle: "إدارة العمل بوضوح",
    projectText: "تقدّم ومخاطر ومسؤوليات ظاهرة من دون ازدحام أو لوحات منفصلة لكل فريق.",
    meetingTitle: "اجتماعات تتحول إلى قرارات",
    meetingText: "الملخصات والقرارات والمهام الناتجة تبقى قابلة للمراجعة والرجوع إلى مصدرها.",
    assistantTitle: "مساعد يستشهد بالمصدر",
    assistantText: "إجابات مرتبطة بملفات ومساحات الشركة، مع خطوة تأكيد قبل إنشاء أي عمل.",
    flowEyebrow: "سير القرار",
    flowTitle: "من الإشارة إلى الإجراء في مسار يمكن تتبعه.",
    flowText: "لا يقدّم Teamoria رقمًا منفصلًا عن سببه. كل إشارة تقود إلى دليل ثم قرار ثم إجراء واضح.",
    trustEyebrow: "تحكم مؤسسي",
    trustTitle: "الوصول يتبع دور الشخص وسياق العمل.",
    trustItems: ["صلاحيات مرتبطة بالشركة والمشروع", "تتبّع واضح لمصادر إجابات المساعد", "ثيم فاتح وداكن مصممان باستقلال", "واجهة عربية وإنجليزية كاملة"],
    ctaTitle: "ابدأ من العمل الموجود، لا من أداة جديدة فارغة.",
    ctaText: "أنشئ مساحة شركتك ثم أضف مشروعًا أو ملفًا لتظهر الروابط بين المعرفة والتنفيذ.",
    footer: "نظام تشغيل الفريق"
  },
  en: {
    navProduct: "Product",
    navWorkflow: "Workflow",
    navSecurity: "Control",
    signIn: "Sign in",
    start: "Start your workspace",
    demo: "Explore a demo",
    heroKicker: "One context for work and decisions",
    heroTitle: "Teamoria",
    heroText: "A team operating system connecting projects, tasks, meetings, and files to an assistant grounded in company knowledge.",
    liveContext: "Workspace now",
    liveSignal: "3 decisions need review",
    source: "Sources",
    understanding: "Understanding",
    decision: "Decision",
    action: "Action",
    productEyebrow: "Shared workspace",
    productTitle: "Information stays connected to the work.",
    productText: "Every file, meeting, and task keeps its context, so the team can see what happened, why, and what comes next.",
    projectTitle: "Clear work management",
    projectText: "Progress, risk, and ownership stay visible without crowded dashboards or separate tools for every team.",
    meetingTitle: "Meetings become decisions",
    meetingText: "Summaries, decisions, and follow-up work remain reviewable and linked to their source.",
    assistantTitle: "An assistant that cites sources",
    assistantText: "Answers stay linked to company files and workspaces, with confirmation before any work is created.",
    flowEyebrow: "Decision flow",
    flowTitle: "From signal to action in a traceable path.",
    flowText: "Teamoria does not show a metric without its reason. Every signal leads to evidence, a decision, and a clear action.",
    trustEyebrow: "Organizational control",
    trustTitle: "Access follows each person’s role and work context.",
    trustItems: ["Company and project-aware permissions", "Traceable sources for assistant answers", "Independently designed light and dark themes", "Complete Arabic and English interface"],
    ctaTitle: "Start with the work you already have, not another empty tool.",
    ctaText: "Create your company workspace, then add a project or file to connect knowledge and execution.",
    footer: "Team operating system"
  }
};

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function LandingPage() {
  const { language, direction } = usePreferences();
  const copy = landingCopy[language] || landingCopy.en;
  const Arrow = direction === "rtl" ? FiArrowLeft : FiArrowRight;

  return (
    <div className="t2-public-page">
      <header className="t2-public-header">
        <Brand className="t2-brand t2-brand--public" tagline={copy.footer} />
        <nav aria-label={language === "ar" ? "التنقل العام" : "Public navigation"}>
          <button onClick={() => scrollToSection("product")} type="button">{copy.navProduct}</button>
          <button onClick={() => scrollToSection("workflow")} type="button">{copy.navWorkflow}</button>
          <button onClick={() => scrollToSection("control")} type="button">{copy.navSecurity}</button>
        </nav>
        <div className="t2-public-header__actions">
          <PublicPreferenceControls />
          <a className="t2-text-link" href="#/signin">{copy.signIn}</a>
          <a className="t2-button t2-button--primary" href="#/signup"><span>{copy.start}</span><Arrow aria-hidden="true" /></a>
        </div>
      </header>

      <main>
        <section className="t2-hero">
          <img alt="" aria-hidden="true" className="t2-hero__image" decoding="async" fetchPriority="high" height="1024" src={featureProjects} width="1536" />
          <span className="t2-hero__veil" aria-hidden="true" />
          <div className="t2-hero__content">
            <span className="t2-eyebrow">{copy.heroKicker}</span>
            <h1>{copy.heroTitle}</h1>
            <p>{copy.heroText}</p>
            <div className="t2-hero__actions">
              <a className="t2-button t2-button--primary" href="#/signup"><span>{copy.start}</span><Arrow aria-hidden="true" /></a>
              <a className="t2-button t2-button--secondary" href="#/dashboard?demo=1">{copy.demo}</a>
            </div>
            <div className="t2-live-signal">
              <span aria-hidden="true" />
              <small>{copy.liveContext}</small>
              <b>{copy.liveSignal}</b>
            </div>
          </div>
          <div className="t2-trace-preview" aria-label={`${copy.source}, ${copy.understanding}, ${copy.decision}, ${copy.action}`}>
            {[copy.source, copy.understanding, copy.decision, copy.action].map((label, index) => (
              <span key={label}>
                <i>{index + 1}</i>
                <b>{label}</b>
              </span>
            ))}
          </div>
        </section>

        <section className="t2-public-section" id="product">
          <div className="t2-public-section__intro">
            <span className="t2-eyebrow">{copy.productEyebrow}</span>
            <h2>{copy.productTitle}</h2>
            <p>{copy.productText}</p>
          </div>
          <div className="t2-capability-grid">
            <Capability icon={FiBarChart2} image={featureProjects} title={copy.projectTitle} text={copy.projectText} />
            <Capability icon={FiUsers} image={featureMeetings} title={copy.meetingTitle} text={copy.meetingText} />
            <Capability icon={FiMessageSquare} image={featureAssistant} title={copy.assistantTitle} text={copy.assistantText} />
          </div>
        </section>

        <section className="t2-flow-section" id="workflow">
          <div>
            <span className="t2-eyebrow">{copy.flowEyebrow}</span>
            <h2>{copy.flowTitle}</h2>
            <p>{copy.flowText}</p>
          </div>
          <div className="t2-decision-rail">
            {[
              [FiFileText, copy.source],
              [FiZap, copy.understanding],
              [FiCheckCircle, copy.decision],
              [FiBriefcase, copy.action]
            ].map(([Icon, label], index) => (
              <article key={label}>
                <span><Icon aria-hidden="true" /></span>
                <small>0{index + 1}</small>
                <h3>{label}</h3>
              </article>
            ))}
          </div>
        </section>

        <section className="t2-control-section" id="control">
          <div className="t2-control-section__mark"><FiShield aria-hidden="true" /></div>
          <div>
            <span className="t2-eyebrow">{copy.trustEyebrow}</span>
            <h2>{copy.trustTitle}</h2>
            <ul>
              {copy.trustItems.map((item) => <li key={item}><FiCheck aria-hidden="true" /><span>{item}</span></li>)}
            </ul>
          </div>
        </section>

        <section className="t2-final-cta">
          <h2>{copy.ctaTitle}</h2>
          <p>{copy.ctaText}</p>
          <a className="t2-button t2-button--primary" href="#/signup"><span>{copy.start}</span><Arrow aria-hidden="true" /></a>
        </section>
      </main>

      <footer className="t2-public-footer">
        <Brand compact className="t2-brand t2-brand--public" tagline={copy.footer} />
        <small>© {new Date().getFullYear()} Teamoria</small>
      </footer>
    </div>
  );
}

function Capability({ icon: Icon, image, text, title }) {
  return (
    <article className="t2-capability">
      <div className="t2-capability__media"><img alt="" height="1024" loading="lazy" src={image} width="1536" /></div>
      <span className="t2-capability__icon" aria-hidden="true"><Icon /></span>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

export function AuthPage({ mode }) {
  const { language } = usePreferences();
  const page = mode === "signup" ? "signUp" : mode === "reset" ? "reset" : mode === "otp" ? "otp" : mode === "onboarding" ? "onboarding" : "signIn";
  const copy = getAuthPageCopy(language, page);
  const image = mode === "signup" || mode === "onboarding" ? featureProjects : mode === "otp" ? featureMeetings : featureAssistant;

  return (
    <div className="t2-auth-page">
      <header className="t2-auth-topbar">
        <Brand className="t2-brand t2-brand--public" tagline={language === "ar" ? "نظام تشغيل الفريق" : "Team operating system"} />
        <PublicPreferenceControls />
      </header>
      <main className="t2-auth-layout">
        <aside className="t2-auth-visual">
          <img alt="" aria-hidden="true" height="1024" src={image} width="1536" />
          <span aria-hidden="true" />
          <div>
            <small>{copy.eyebrow}</small>
            <h2>{copy.heroTitle}</h2>
            <p>{copy.heroText}</p>
          </div>
        </aside>
        <section className="t2-auth-form-wrap">
          {mode === "signup" ? <SignUpForm copy={copy} language={language} /> : null}
          {mode === "reset" ? <ResetForm copy={copy} language={language} /> : null}
          {mode === "otp" ? <OtpForm copy={copy} language={language} /> : null}
          {mode === "onboarding" ? <OnboardingForm copy={copy} language={language} /> : null}
          {!mode || mode === "signin" ? <SignInForm copy={copy} language={language} /> : null}
        </section>
      </main>
    </div>
  );
}

function SignInForm({ copy, language }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const errors = useMemo(() => ({
    email: submitted ? validateEmail(form.email, copy) : "",
    password: submitted && !form.password ? copy.passwordRequired : ""
  }), [copy, form, submitted]);

  async function submit(event) {
    event.preventDefault();
    setSubmitted(true);
    setStatus("");
    if (validateEmail(form.email, copy) || !form.password) return;
    setLoading(true);
    try {
      const { user } = await loginWithEmail(form);
      login(user);
      window.location.hash = getPostLoginPath(user);
    } catch (error) {
      if (error.payload?.error_code === "EMAIL_NOT_VERIFIED") {
        sessionStorage.setItem("teamoria_pending_signup", JSON.stringify({ email: form.email, type: "register" }));
        window.location.hash = `/verify-otp?email=${encodeURIComponent(form.email)}&type=register`;
        return;
      }
      setStatus(language === "ar" ? copy.signInError : getLocalizedRequestError(error, language, copy.signInError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFormHeader copy={copy}>
      <form className="t2-auth-form" noValidate onSubmit={submit}>
        {status ? <p className="t2-form-alert is-error" role="alert">{status}</p> : null}
        <Field error={errors.email} label={copy.email} required>
          <div className="t2-input"><FiMail aria-hidden="true" /><input autoComplete="email" inputMode="email" placeholder={copy.emailPlaceholder} type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></div>
        </Field>
        <Field error={errors.password} label={copy.password} required>
          <div className="t2-input"><FiLock aria-hidden="true" /><input autoComplete="current-password" placeholder={copy.passwordPlaceholder} type={showPassword ? "text" : "password"} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /><button aria-label={showPassword ? copy.hidePassword : copy.showPassword} onClick={() => setShowPassword((value) => !value)} type="button">{showPassword ? <FiEyeOff /> : <FiEye />}</button></div>
        </Field>
        <div className="t2-form-row">
          <label className="t2-checkbox"><input type="checkbox" /><span>{copy.remember}</span></label>
          <a href="#/reset-password">{copy.forgotPassword}</a>
        </div>
        <Button loading={loading} loadingLabel={copy.submitting} type="submit">{copy.submit}</Button>
        <AuthDivider label={copy.orContinueWith} />
        <GoogleAuthButton disabled={loading} onError={() => setStatus(copy.googleError)}>{copy.google}</GoogleAuthButton>
        <p className="t2-auth-switch">{copy.noAccount} <a href="#/signup">{copy.createAccount}</a></p>
      </form>
    </AuthFormHeader>
  );
}

function SignUpForm({ copy, language }) {
  const [form, setForm] = useState({ name: "", email: "", companyName: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const errors = submitted ? {
    name: form.name.trim() ? "" : copy.fullNameRequired,
    email: validateEmail(form.email, copy),
    companyName: form.companyName.trim() ? "" : copy.companyRequired,
    password: !form.password ? copy.passwordRequired : form.password.length < 8 ? copy.passwordShort : ""
  } : {};

  async function submit(event) {
    event.preventDefault();
    setSubmitted(true);
    setStatus("");
    if (!form.name.trim() || validateEmail(form.email, copy) || !form.companyName.trim() || form.password.length < 8) return;
    setLoading(true);
    try {
      await registerWithEmail({ name: form.name, email: form.email, password: form.password });
      setPendingSignup({ email: form.email, companyName: form.companyName, password: form.password });
      window.location.hash = "/verify-otp";
    } catch (error) {
      setStatus(getLocalizedRequestError(error, language, copy.signUpError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFormHeader copy={copy}>
      <form className="t2-auth-form" noValidate onSubmit={submit}>
        {status ? <p className="t2-form-alert is-error" role="alert">{status}</p> : null}
        <Field error={errors.name} label={copy.fullName} required><div className="t2-input"><FiUser /><input autoComplete="name" placeholder={copy.fullNamePlaceholder} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></div></Field>
        <Field error={errors.email} label={copy.email} required><div className="t2-input"><FiMail /><input autoComplete="email" inputMode="email" placeholder={copy.emailPlaceholder} type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></div></Field>
        <Field error={errors.companyName} label={copy.companyName} required><div className="t2-input"><FiBriefcase /><input autoComplete="organization" placeholder={copy.companyPlaceholder} value={form.companyName} onChange={(event) => setForm({ ...form, companyName: event.target.value })} /></div></Field>
        <Field error={errors.password} label={copy.password} required><div className="t2-input"><FiLock /><input autoComplete="new-password" placeholder={copy.passwordPlaceholder} type={showPassword ? "text" : "password"} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /><button aria-label={showPassword ? copy.hidePassword : copy.showPassword} onClick={() => setShowPassword((value) => !value)} type="button">{showPassword ? <FiEyeOff /> : <FiEye />}</button></div></Field>
        <Button loading={loading} loadingLabel={copy.submitting} type="submit">{copy.submit}</Button>
        <AuthDivider label={copy.orContinueWith} />
        <GoogleAuthButton disabled={loading} onError={() => setStatus(copy.googleError)}>{copy.google}</GoogleAuthButton>
        <p className="t2-auth-switch">{copy.haveAccount} <a href="#/signin">{copy.login}</a></p>
      </form>
    </AuthFormHeader>
  );
}

function ResetForm({ copy, language }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const error = submitted ? validateEmail(email, copy) : "";

  async function submit(event) {
    event.preventDefault();
    setSubmitted(true);
    setStatus({ type: "", message: "" });
    if (validateEmail(email, copy)) return;
    setLoading(true);
    try {
      await forgotPasswordSendOtp({ email: email.trim() });
      setStatus({ type: "success", message: copy.successMessage });
    } catch (requestError) {
      setStatus({ type: "error", message: getLocalizedRequestError(requestError, language, copy.error) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFormHeader copy={copy}>
      <form className="t2-auth-form" noValidate onSubmit={submit}>
        {status.message ? <p className={`t2-form-alert is-${status.type}`} role={status.type === "error" ? "alert" : "status"}>{status.message}</p> : null}
        <Field error={error} label={copy.email} required><div className="t2-input"><FiMail /><input autoComplete="email" inputMode="email" placeholder={copy.emailPlaceholder} type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></div></Field>
        <Button loading={loading} loadingLabel={copy.submitting} type="submit">{copy.submit}</Button>
        <p className="t2-auth-switch">{copy.remember} <a href="#/signin">{copy.backToLogin}</a></p>
      </form>
    </AuthFormHeader>
  );
}

function OtpForm({ copy, language }) {
  const { login } = useAuth();
  const [pending] = useState(getPendingSignup);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [status, setStatus] = useState({ type: pending?.email ? "" : "error", message: pending?.email ? "" : copy.noPending });

  useEffect(() => {
    if (!pending?.email || pending.password) return;
    setResending(true);
    sendOtp({ email: pending.email, type: pending.type || "register" })
      .then(() => setStatus({ type: "success", message: copy.sent }))
      .catch((error) => setStatus({ type: "error", message: getLocalizedRequestError(error, language, copy.sendError) }))
      .finally(() => setResending(false));
  }, [copy.sendError, copy.sent, language, pending]);

  async function submit(event) {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setStatus({ type: "error", message: code ? copy.codeInvalid : copy.codeRequired });
      return;
    }
    setLoading(true);
    setStatus({ type: "", message: "" });
    try {
      await verifyOtp({ email: pending.email, code, type: pending.type || "register" });
      if (pending.password) {
        const { user } = await loginWithEmail({ email: pending.email, password: pending.password });
        login(user);
        clearPendingSignup({ keepCompany: true });
        window.location.hash = getPostLoginPath(user);
      } else {
        clearPendingSignup();
        window.location.hash = "/signin";
      }
    } catch (error) {
      setStatus({ type: "error", message: getLocalizedRequestError(error, language, copy.verifyError) });
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    if (!pending?.email) return;
    setResending(true);
    try {
      await sendOtp({ email: pending.email, type: pending.type || "register" });
      setStatus({ type: "success", message: copy.resent });
    } catch (error) {
      setStatus({ type: "error", message: getLocalizedRequestError(error, language, copy.sendError) });
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthFormHeader copy={copy}>
      <form className="t2-auth-form" noValidate onSubmit={submit}>
        {pending?.email ? <div className="t2-otp-email"><FiMail /><bdi>{pending.email}</bdi></div> : null}
        {status.message ? <p className={`t2-form-alert is-${status.type}`} role={status.type === "error" ? "alert" : "status"}>{status.message}</p> : null}
        <Field label={copy.code} required><input aria-label={copy.code} autoComplete="one-time-code" className="t2-otp-input" disabled={!pending?.email} inputMode="numeric" maxLength="6" pattern="[0-9]*" placeholder="000000" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} /></Field>
        <Button disabled={!pending?.email} loading={loading} loadingLabel={copy.submitting} type="submit">{copy.submit}</Button>
        <button className="t2-auth-link-button" disabled={resending || !pending?.email} onClick={resend} type="button">{resending ? copy.resending : copy.resend}</button>
        <p className="t2-auth-switch"><a href="#/signup">{copy.backToSignup}</a></p>
      </form>
    </AuthFormHeader>
  );
}

function OnboardingForm({ copy, language }) {
  const { login, refreshUser, user } = useAuth();
  const [form, setForm] = useState({ name: getPendingCompanyName() || user?.company?.name || "", industry: "", website: "", address: "", status: "active" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function submit(event) {
    event.preventDefault();
    if (!form.name.trim()) {
      setStatus(copy.nameRequired);
      return;
    }
    setLoading(true);
    setStatus("");
    try {
      await registerCompany(form);
      const nextUser = await refreshUser();
      login({ ...nextUser, requires_company: false });
      clearPendingSignup();
      window.location.hash = "/dashboard";
    } catch (error) {
      setStatus(getLocalizedRequestError(error, language, copy.error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFormHeader copy={copy}>
      <form className="t2-auth-form" noValidate onSubmit={submit}>
        {status ? <p className="t2-form-alert is-error" role="alert">{status}</p> : null}
        <Field label={copy.companyName} required><div className="t2-input"><FiBriefcase /><input autoComplete="organization" placeholder={copy.companyPlaceholder} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></div></Field>
        <Field label={copy.industry}><div className="t2-input"><FiTag /><input placeholder={copy.industryPlaceholder} value={form.industry} onChange={(event) => setForm({ ...form, industry: event.target.value })} /></div></Field>
        <Field label={copy.website}><div className="t2-input"><FiGlobe /><input autoComplete="url" placeholder={copy.websitePlaceholder} type="url" value={form.website} onChange={(event) => setForm({ ...form, website: event.target.value })} /></div></Field>
        <Field label={copy.address}><div className="t2-input"><FiMapPin /><input autoComplete="street-address" placeholder={copy.addressPlaceholder} value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></div></Field>
        <Button loading={loading} loadingLabel={copy.submitting} type="submit">{copy.submit}</Button>
      </form>
    </AuthFormHeader>
  );
}

function AuthFormHeader({ children, copy }) {
  return (
    <div className="t2-auth-form-shell">
      <span className="t2-eyebrow">{copy.eyebrow}</span>
      <h1>{copy.title}</h1>
      <p>{copy.subtitle}</p>
      {children}
    </div>
  );
}

function AuthDivider({ label }) {
  return <div className="t2-auth-divider"><span>{label}</span></div>;
}

function validateEmail(value, copy) {
  const email = String(value || "").trim();
  if (!email) return copy.emailRequired;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : copy.emailInvalid;
}
