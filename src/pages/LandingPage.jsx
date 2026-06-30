import { useEffect, useState } from "react";
import {
  FiArrowRight,
  FiGrid,
  FiPlayCircle,
  FiUsers,
  FiZap
} from "react-icons/fi";
import logoImage from "../assets/teamoria-logo.png";
import "../styles/landing.css";

const landingImages = {
  hero: "https://lh3.googleusercontent.com/aida-public/AB6AXuDLlct6wdloPz2cybi7ltzUaN5Kzoo0XM062E4rbPQChMnFHgAlY_GLfOI3MRpHR4eQEE7axK6byu5udWe2IJHFUIqiMPvnNXmJ2TAg27hpjAsKzsh5GGE0rZYh77bvR6vIM07dNs8MwxqGnhUfTVZKtkGygX8MV-R2_g5wVuoFvLgf8Wrq9SLu33B3sGFU-dCMoiVQnVY55b7g_5ZBW2thzfCJEnoaXUWaeLqin8fBunHJgoeuQuvYxtKgvPcWPYZtnutoCaYCpNo7",
  assistant: "https://lh3.googleusercontent.com/aida/AP1WRLvTNdW9wtVlcOLLTushfE2w3w3lNSMtBs-nyFnVJom2XeLRDBVz8WfK33qNiHkVNsQlpw5OpsMScMvMTj6iTdPETA57PNdMIJUJIDMLMCCRU5bqI6ln6oXkrF1LxSyFQzfCm78aZu3Ozz0G2Hc6numUMfXrZ6A6HEcGvEqmUw4fv8aRLZNFnB8BYZ2xSDpTEAEz25mRQqBkdk0Gr_1gLmQLXZ5LU3waV_ie9wX6h5h_1Ar5WM3liXw_0hUx",
  kanban: "https://lh3.googleusercontent.com/aida-public/AB6AXuCueVIYYsrvacofCChZ42yRhD-UyQXKwOx8vAoWR7Dcn2qba5sGixI_k_XWOREFp4dmXYtXpFgAr4n1AYslqrAUt7HL0PTpLdKX5x7t25ionOafaU9wTIKe-Jv7TXDVKhY_cmMhHg44Qul-u7Q2RzyF0YrJCi3tLdpurMuB8EMv872qdDyno-a4teLujTYSgGEkfbsva-_CaKEqLlbBvF41BpRR9CPSjA0EP5tqrfdoB6XgeFblBRSK5O8TXp5BfeW_ELVnFM1mE6vE",
  meetings: "https://lh3.googleusercontent.com/aida/AP1WRLsbfOtDRMrLyDwHn1GXmlDk8PMHu1FN8mpHhKE1SxDDkEFm91SbbAgO2Iw_u9v53u_Rah9mw4weLKCy7qAfA1b3UfulcFSYRc7WSFePd3vScs5EjQpD-JMtdw4baC0Yx_zHFHqqXhk4kXIrnejZ8ztjF_MDgrvvzV8LJeoDtrcq8ofrqqUsjqVPjlHTxUQ21dKMeMlbxFOvY0hXJdjHNVG8uNIxFFSlyhRPGk76xprcc_0iTxiW0exz9Bk",
  workflow: "https://lh3.googleusercontent.com/aida-public/AB6AXuBe3ALd40yLMQMKDT5nH-wbMcQ9S8oqJJu9HLuAsTVJmIbyWecrcAjGcnD2WPxE637n0ch8ag50UhoVTRnb9y0VaKMMQx7Tn6vBl3g9F63XOyOZWWb_lDG09kb3dxqUXlGEVIjZ1GMo9h3rZDkvmt8ct4P_vLsMKESiXVDdM-IJ6K5_cihP2UBn3P5O3pDqBKEHsDwxuLqxcNeOMFqndC4Bwz_S1kLfH82jMA_f2uC0ZCdGWwSgMAwukiKLXKRQJPEWn_FxsX8PgJCv"
};

const copy = {
  en: {
    dir: "ltr",
    home: "Home",
    features: "Features",
    how: "How it Works",
    pricing: "Pricing",
    login: "Log In",
    start: "Start for Free",
    badge: "Enterprise AI is now available",
    headlineA: "Teamoria:",
    headlineB: "Smart Command Center",
    headlineC: "for your Company",
    heroText: "Manage projects, tasks, meetings, and files in one place with an AI assistant that understands every detail of your business.",
    startNow: "Start Free Now",
    demo: "Watch Live Demo",
    trusted: "Trusted by leading companies worldwide",
    featureTitle: "AI-Powered Productivity",
    featureText: "We don't just automate tasks; we provide the mastermind that connects every corner of your organization.",
    howTitle: "How Teamoria Transforms Your Workflow",
    ctaTitle: "Ready for the Future of Project Management?",
    ctaText: "Join over 500 companies that have already started increasing their productivity by 40% using Teamoria.",
    trial: "Start Your Free Trial",
    sales: "Contact Sales"
  },
  ar: {
    dir: "rtl",
    home: "الرئيسية",
    features: "الميزات",
    how: "كيف يعمل",
    pricing: "الأسعار",
    login: "تسجيل الدخول",
    start: "ابدأ مجاناً",
    badge: "الذكاء الاصطناعي للمؤسسات أصبح متاحاً الآن",
    headlineA: "Teamoria:",
    headlineB: "مركز قيادة ذكي",
    headlineC: "لشركتك",
    heroText: "أدر المشاريع والمهام والاجتماعات والملفات في مكان واحد مع مساعد ذكاء اصطناعي يفهم كل تفاصيل عملك.",
    startNow: "ابدأ مجاناً الآن",
    demo: "شاهد العرض المباشر",
    trusted: "تثق بنا الشركات الرائدة عالمياً",
    featureTitle: "قوة الذكاء الاصطناعي في خدمة إنتاجيتك",
    featureText: "نحن لا نقوم فقط بأتمتة المهام؛ بل نوفر العقل المدبر الذي يربط كل زاوية من مؤسستك.",
    howTitle: "كيف يحول Teamoria طريقة عمل شركتك؟",
    ctaTitle: "هل أنت مستعد لمستقبل إدارة المشاريع؟",
    ctaText: "انضم إلى أكثر من 500 شركة بدأت بالفعل بزيادة إنتاجيتها بنسبة 40% باستخدام Teamoria.",
    trial: "ابدأ تجربتك المجانية",
    sales: "تواصل مع المبيعات"
  }
};

const footerCopy = {
  en: {
    description: "The next generation of AI-powered project management systems for large enterprises.",
    product: "Product",
    resources: "Resources",
    legal: "Legal",
    copyright: "© 2026 Teamoria AI. All rights reserved."
  },
  ar: {
    description: "الجيل الجديد من أنظمة إدارة المشاريع المدعومة بالذكاء الاصطناعي للمؤسسات الكبيرة.",
    product: "المنتج",
    resources: "الموارد",
    legal: "القانونية",
    copyright: "© 2026 Teamoria AI. جميع الحقوق محفوظة."
  }
};

const logos = ["TECHCORP", "GLOBAL-X", "NEXUS AI", "STRATOS", "V-SHIFT"];

const features = [
  {
    icon: FiZap,
    title: { en: "Smart Assistant with Citations", ar: "مساعد ذكي مع مصادر موثقة" },
    text: {
      en: "Ask any question about your projects, and the assistant will analyze files and messages to give you a precise answer with direct links to sources.",
      ar: "اسأل عن أي تفاصيل في مشاريعك، وسيحلل المساعد الملفات والرسائل ليعطيك إجابة دقيقة مع روابط مباشرة للمصادر."
    },
    image: landingImages.assistant,
    imageAlt: "AI assistant interface scanning documents"
  },
  {
    icon: FiGrid,
    title: { en: "Flexible Project Management", ar: "إدارة مشاريع مرنة" },
    text: {
      en: "Advanced Kanban boards, timeline tracking, and intelligent delivery date predictions based on historical team performance.",
      ar: "لوحات كانبان متقدمة، تتبع للجداول الزمنية، وتوقعات ذكية لمواعيد التسليم بناءً على أداء الفريق السابق."
    },
    image: landingImages.kanban,
    imageAlt: "Advanced Kanban board and project management interface illustration"
  },
  {
    icon: FiUsers,
    title: { en: "Automated Meeting Summaries", ar: "ملخصات اجتماعات تلقائية" },
    text: {
      en: "No more manual note-taking. Teamoria summarizes meetings, extracts required tasks automatically, and distributes them.",
      ar: "لا حاجة لتدوين الملاحظات يدوياً. يلخص Teamoria الاجتماعات، ويستخرج المهام المطلوبة تلقائياً، ويوزعها على الفريق."
    },
    image: landingImages.meetings,
    imageAlt: "Automated meeting summary interface"
  }
];

const steps = [
  [
    { en: "Smart Connectivity", ar: "ربط ذكي للبيانات" },
    {
      en: "Connect your data sources like Slack, Google Drive, and Jira. The system understands your work context immediately.",
      ar: "اربط مصادر بياناتك مثل Slack وGoogle Drive وJira ليبدأ النظام بفهم سياق العمل فوراً."
    }
  ],
  [
    { en: "Gap Analysis", ar: "تحليل الفجوات" },
    {
      en: "AI detects missing tasks or potential timeline risks and alerts the responsible people before delivery slips.",
      ar: "يكتشف الذكاء الاصطناعي المهام الناقصة أو مخاطر التأخير وينبه المسؤولين قبل أن يتأثر التسليم."
    }
  ],
  [
    { en: "Data-Driven Leadership", ar: "قيادة مبنية على البيانات" },
    {
      en: "Get periodic strategic reports that help leaders make decisions based on real business facts.",
      ar: "احصل على تقارير استراتيجية دورية تساعد القادة على اتخاذ قرارات مبنية على حقائق العمل."
    }
  ]
];

const localize = (value, lang) => (typeof value === "string" ? value : value[lang] || value.en);

export default function LandingPage() {
  const [lang, setLang] = useState("en");
  const t = copy[lang];

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");

    if (!hash || hash === "/") {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, []);

  function goHome(event) {
    event.preventDefault();
    window.location.hash = "/";
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    });
  }

  return (
    <main className="teamoria-home" dir={t.dir}>
      <header className="home-topbar">
        <nav>
          <a className="home-logo" href="#/" onClick={goHome}>
            <span className="home-logo-mark" aria-hidden="true">
              <img src={logoImage} alt="" />
            </span>
            <span className="home-logo-text">Teamoria</span>
          </a>
          <div className="home-links">
            <a href="#/" onClick={goHome}>{t.home}</a>
            <a href="#features">{t.features}</a>
            <a href="#workflow">{t.how}</a>
            <a href="#pricing">{t.pricing}</a>
          </div>
          <div className="home-actions">
            <div className="home-lang-toggle" aria-label="Language">
              <button className={lang === "ar" ? "active" : ""} type="button" onClick={() => setLang("ar")}>AR</button>
              <button className={lang === "en" ? "active" : ""} type="button" onClick={() => setLang("en")}>EN</button>
            </div>
            <a className="home-login" href="#/signin">{t.login}</a>
            <a className="home-start" href="#/signup">{t.start}</a>
          </div>
        </nav>
      </header>

      <section className="home-hero" id="home">
        <div className="home-hero-inner">
          <span className="home-pill"><FiZap aria-hidden="true" />{t.badge}</span>
          <h1>
            {t.headlineA} <span>{t.headlineB}</span> {t.headlineC}
          </h1>
          <p>{t.heroText}</p>
          <div className="home-hero-actions">
            <a className="home-primary-cta" href="#/signup">{t.startNow}<FiArrowRight aria-hidden="true" /></a>
            <a className="home-secondary-cta" href="#/dashboard?role=admin"><FiPlayCircle aria-hidden="true" />{t.demo}</a>
          </div>

          <div className="home-product-preview">
            <div className="home-preview-glow" />
            <div className="home-preview-frame">
              <img
                className="home-platform-image"
                src={landingImages.hero}
                alt="Teamoria AI Command Center"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="home-trusted">
        <p>{t.trusted}</p>
        <div>
          {logos.map((logo) => <span key={logo}>{logo}</span>)}
        </div>
      </section>

      <section className="home-features" id="features">
        <div className="home-section-head">
          <h2>{t.featureTitle}</h2>
          <p>{t.featureText}</p>
        </div>
        <div className="home-feature-grid">
          {features.map(({ icon: Icon, title, text, image, imageAlt }) => (
            <article key={localize(title, "en")}>
              <span><Icon aria-hidden="true" /></span>
              <h3>{localize(title, lang)}</h3>
              <p>{localize(text, lang)}</p>
              <img className="home-feature-image" src={image} alt={imageAlt} />
            </article>
          ))}
        </div>
      </section>

      <section className="home-workflow" id="workflow">
        <div className="home-workflow-copy">
          <h2>{t.howTitle}</h2>
          <div className="home-step-list">
            {steps.map(([title, text], index) => (
              <article key={localize(title, "en")}>
                <span>{index + 1}</span>
                <div>
                  <h3>{localize(title, lang)}</h3>
                  <p>{localize(text, lang)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="home-workflow-visual">
          <img
            src={landingImages.workflow}
            alt="Teamoria workflow"
          />
        </div>
      </section>

      <section className="home-cta" id="pricing">
        <div>
          <h2>{t.ctaTitle}</h2>
          <p>{t.ctaText}</p>
          <div>
            <a className="home-primary-cta" href="#/signup">{t.trial}</a>
            <a className="home-secondary-cta" href="mailto:sales@teamoria.ai">{t.sales}</a>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="home-footer-grid">
          <div>
            <a className="home-logo" href="#/" onClick={goHome}>
              <span className="home-logo-mark" aria-hidden="true">
                <img src={logoImage} alt="" />
              </span>
              <span className="home-logo-text">Teamoria</span>
            </a>
            <p>{footerCopy[lang].description}</p>
          </div>
          <FooterColumn title={footerCopy[lang].product} items={["Features", "Security", "Integrations", "Roadmap"]} />
          <FooterColumn title={footerCopy[lang].resources} items={["Blog", "Help Center", "User Guide", "Community"]} />
          <FooterColumn title={footerCopy[lang].legal} items={["Privacy Policy", "Terms of Service", "SLA Agreement"]} />
        </div>
        <div className="home-footer-bottom">
          <p>{footerCopy[lang].copyright}</p>
          <div>
            <a href="#/">Twitter</a>
            <a href="#/">LinkedIn</a>
            <a href="#/">GitHub</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FooterColumn({ title, items }) {
  return (
    <div>
      <h3>{title}</h3>
      {items.map((item) => <a href="#/" key={item}>{item}</a>)}
    </div>
  );
}
