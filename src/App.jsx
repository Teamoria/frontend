import { useEffect, useMemo, useState } from "react";
import { FiAlertCircle, FiLoader } from "react-icons/fi";
import { useAuth } from "./lib/AuthContext.jsx";
import { normalizeRole } from "./lib/authRoles.js";
import { getDemoUser, isDemoMode } from "./lib/demoMode.js";
import { usePreferences } from "./lib/PreferencesContext.jsx";
import { AuthPage, LandingPage } from "./rebuild/PublicPages.jsx";
import WorkspaceShell from "./rebuild/WorkspaceShell.jsx";
import { AiChatPage, DashboardPage, ProfilePage, ResourcePage, SpecialPage } from "./rebuild/WorkspacePages.jsx";
import { Button } from "./rebuild/ui.jsx";

const routeTitles = {
  "/": { ar: "Teamoria — نظام تشغيل الفريق", en: "Teamoria — Team operating system" },
  "/signin": { ar: "تسجيل الدخول", en: "Sign in" },
  "/login": { ar: "تسجيل الدخول", en: "Sign in" },
  "/reset-password": { ar: "استعادة كلمة المرور", en: "Reset password" },
  "/forgot-password": { ar: "استعادة كلمة المرور", en: "Reset password" },
  "/signup": { ar: "إنشاء حساب", en: "Create account" },
  "/register": { ar: "إنشاء حساب", en: "Create account" },
  "/verify-otp": { ar: "تأكيد البريد", en: "Verify email" },
  "/company/register": { ar: "إعداد الشركة", en: "Set up company" },
  "/onboarding/company": { ar: "إعداد الشركة", en: "Set up company" },
  "/dashboard": { ar: "مركز العمل", en: "Work center" },
  "/projects": { ar: "المشاريع", en: "Projects" },
  "/owner/projects": { ar: "المشاريع", en: "Projects" },
  "/tasks": { ar: "المهام", en: "Tasks" },
  "/meetings": { ar: "الاجتماعات", en: "Meetings" },
  "/workspace": { ar: "مساحة العمل", en: "Workspace" },
  "/uploads": { ar: "مركز الملفات", en: "File center" },
  "/owner/uploads": { ar: "مركز الملفات", en: "File center" },
  "/owner/uploads/files": { ar: "الملفات المرفوعة", en: "Uploaded files" },
  "/ai-chat": { ar: "مساعد Teamoria", en: "Teamoria assistant" },
  "/agent-runs": { ar: "عمليات الوكلاء", en: "Agent runs" },
  "/agent-run-details": { ar: "تفاصيل العملية", en: "Run details" },
  "/workspace-graph": { ar: "خريطة المعرفة", en: "Knowledge graph" },
  "/employees": { ar: "الفريق والصلاحيات", en: "Team and access" },
  "/team-performance": { ar: "أداء الفريق", en: "Team performance" },
  "/owner/team-performance": { ar: "أداء الفريق", en: "Team performance" },
  "/reports": { ar: "التقارير", en: "Reports" },
  "/profile": { ar: "الملف الشخصي", en: "Profile" },
  "/notifications": { ar: "الإشعارات", en: "Notifications" },
  "/super-admin": { ar: "حالة المنصة", en: "Platform health" },
  "/super-admin/companies": { ar: "الشركات", en: "Companies" },
  "/super-admin/users": { ar: "المستخدمون", en: "Users" },
  "/super-admin/payments": { ar: "المدفوعات", en: "Payments" },
  "/super-admin/profile": { ar: "الملف الشخصي", en: "Profile" },
  "/super-admin/notifications": { ar: "إشعارات المنصة", en: "Platform notifications" }
};

const publicRoutes = new Set(["/", "/signin", "/login", "/reset-password", "/forgot-password", "/signup", "/register", "/verify-otp"]);
const onboardingRoutes = new Set(["/company/register", "/onboarding/company"]);
const adminRoutes = new Set(["/super-admin", "/super-admin/companies", "/super-admin/users", "/super-admin/payments", "/super-admin/profile", "/super-admin/notifications"]);
const workspaceRoutes = new Set([
  "/dashboard", "/projects", "/owner/projects", "/tasks", "/meetings", "/workspace", "/uploads", "/owner/uploads", "/owner/uploads/files",
  "/ai-chat", "/agent-runs", "/agent-run-details", "/workspace-graph", "/employees", "/team-performance", "/owner/team-performance", "/reports", "/profile", "/notifications"
]);

const ownerRoutes = new Set(["/dashboard", "/tasks", "/employees", "/owner/projects", "/owner/uploads", "/owner/uploads/files", "/ai-chat", "/profile", "/notifications"]);
const managerRoutes = new Set(["/dashboard", "/projects", "/tasks", "/uploads", "/ai-chat", "/profile", "/notifications"]);
const memberRoutes = new Set(["/dashboard", "/tasks", "/uploads", "/ai-chat", "/profile", "/notifications"]);

function normalizePath(path) {
  try {
    const decoded = decodeURIComponent(path || "/");
    if (decoded === "/ower/team-performance" || decoded === "/ower /team-performance") return "/owner/team-performance";
    return decoded;
  } catch {
    return path || "/";
  }
}

function readPath() {
  const direct = normalizePath(window.location.pathname);
  if (direct !== "/" && routeTitles[direct]) {
    const nextHash = `${direct}${window.location.search || ""}`;
    window.history.replaceState(null, "", `${window.location.origin}/#${nextHash}`);
  }
  const hash = window.location.hash.replace(/^#/, "");
  const path = normalizePath((hash.split("?")[0] || "/").replace(/\/$/, "") || "/");
  return routeTitles[path] ? path : "/";
}

function allowedRoutesFor(role) {
  if (role === "company_owner") return ownerRoutes;
  if (role === "company_manager") return managerRoutes;
  if (role === "company_member") return memberRoutes;
  return null;
}

export default function App() {
  const [path, setPath] = useState(readPath);
  const auth = useAuth();
  const { language } = usePreferences();
  const demoUser = isDemoMode() ? getDemoUser() : null;
  const user = auth.user || demoUser;
  const role = normalizeRole(user?.role);
  const isAdmin = role === "admin";
  const isCompanyUser = ["company_owner", "company_manager", "company_member"].includes(role);
  const loading = auth.isLoading && !demoUser;
  const requiresCompany = Boolean(user?.requires_company);

  useEffect(() => {
    const onRouteChange = () => setPath(readPath());
    window.addEventListener("hashchange", onRouteChange);
    window.addEventListener("popstate", onRouteChange);
    return () => {
      window.removeEventListener("hashchange", onRouteChange);
      window.removeEventListener("popstate", onRouteChange);
    };
  }, []);

  useEffect(() => {
    const title = routeTitles[path] || routeTitles["/"];
    document.title = path === "/" ? title[language] : `${title[language]} — Teamoria`;
  }, [language, path]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const main = document.getElementById("main-content") || document.querySelector("main");
      if (main instanceof HTMLElement) {
        if (!main.hasAttribute("tabindex")) main.tabIndex = -1;
        main.focus({ preventScroll: true });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [path]);

  const redirect = useMemo(() => {
    if (["/signin", "/login", "/signup", "/register", "/reset-password", "/forgot-password"].includes(path) && !loading && user && !requiresCompany) {
      return isAdmin ? "/super-admin" : "/dashboard";
    }
    if (onboardingRoutes.has(path)) {
      if (loading) return null;
      if (!user) return "/signin";
      if (isAdmin) return "/super-admin";
      if (!requiresCompany) return "/dashboard";
    }
    if (workspaceRoutes.has(path)) {
      if (loading) return null;
      if (isAdmin) return path === "/profile" ? "/super-admin/profile" : "/super-admin";
      if (!user) return "/signin";
      if (requiresCompany) return "/company/register";
      const allowed = allowedRoutesFor(role);
      if (isCompanyUser && allowed && !allowed.has(path)) return "/dashboard";
    }
    if (adminRoutes.has(path)) {
      if (loading) return null;
      if (!user) return "/signin";
      if (!isAdmin) return "/dashboard";
    }
    return "";
  }, [isAdmin, isCompanyUser, loading, path, requiresCompany, role, user]);

  if (redirect) return <Navigate to={redirect} />;
  if (loading && (workspaceRoutes.has(path) || adminRoutes.has(path) || onboardingRoutes.has(path))) return <FullPageLoading language={language} />;

  if (path === "/") return <LandingPage />;
  if (path === "/signin" || path === "/login") return <AuthPage mode="signin" />;
  if (path === "/signup" || path === "/register") return <AuthPage mode="signup" />;
  if (path === "/reset-password" || path === "/forgot-password") return <AuthPage mode="reset" />;
  if (path === "/verify-otp") return <AuthPage mode="otp" />;
  if (onboardingRoutes.has(path)) return <AuthPage mode="onboarding" />;

  return (
    <WorkspaceShell activePath={path}>
      <WorkspacePage path={path} />
    </WorkspaceShell>
  );
}

function WorkspacePage({ path }) {
  if (path === "/dashboard") return <DashboardPage />;
  if (path === "/super-admin") return <DashboardPage admin />;
  if (path === "/ai-chat") return <AiChatPage />;
  if (path === "/profile") return <ProfilePage />;
  if (path === "/super-admin/profile") return <ProfilePage admin />;
  if (["/workspace-graph", "/agent-run-details"].includes(path)) return <SpecialPage path={path} />;
  return <ResourcePage path={path} />;
}

function Navigate({ to }) {
  useEffect(() => {
    const currentHash = window.location.hash.replace(/^#/, "").split("?")[0] || "/";
    if (currentHash !== to) window.location.hash = to;
  }, [to]);
  return <FullPageLoading />;
}

function FullPageLoading({ language = "ar" }) {
  return (
    <main className="t2-full-state" id="main-content" tabIndex="-1">
      <FiLoader className="t2-spin" aria-hidden="true" />
      <h1>{language === "ar" ? "جارٍ تجهيز مساحة العمل" : "Preparing your workspace"}</h1>
      <p>{language === "ar" ? "نتحقق من الحساب والصلاحيات." : "Checking your account and permissions."}</p>
    </main>
  );
}

export function AccessMessage({ message, title }) {
  return (
    <main className="t2-full-state" id="main-content" tabIndex="-1">
      <FiAlertCircle aria-hidden="true" />
      <h1>{title}</h1>
      <p>{message}</p>
      <Button onClick={() => { window.location.hash = "/dashboard"; }}>Back to dashboard</Button>
    </main>
  );
}
