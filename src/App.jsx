import { useEffect, useMemo, useState } from "react";
import LandingPage from "./pages/LandingPage.jsx";
import SignInPage from "./pages/SignInPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import VerifyOtpPage from "./pages/VerifyOtpPage.jsx";
import CompanyOnboardingPage from "./pages/CompanyOnboardingPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ProjectsPage from "./pages/ProjectsPage.jsx";
import TasksPage from "./pages/TasksPage.jsx";
import MeetingsPage from "./pages/MeetingsPage.jsx";
import WorkspaceDetailsPage from "./pages/WorkspaceDetailsPage.jsx";
import UploadCenterPage from "./pages/UploadCenterPage.jsx";
import AiChatPage from "./pages/AiChatPage.jsx";
import AgentRunsPage from "./pages/AgentRunsPage.jsx";
import AgentRunDetailsPage from "./pages/AgentRunDetailsPage.jsx";
import WorkspaceGraphPage from "./pages/WorkspaceGraphPage.jsx";
import EmployeesPage from "./pages/EmployeesPage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";
import TeamPerformanceOversightPage from "./pages/TeamPerformanceOversightPage.jsx";
import OwnerProjectsPage from "./pages/OwnerProjectsPage.jsx";
import OwnerUploadCenterPage from "./pages/OwnerUploadCenterPage.jsx";
import OwnerUploadedFilesPage from "./pages/OwnerUploadedFilesPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import SuperAdminConsolePage from "./pages/SuperAdminConsolePage.jsx";
import SuperAdminCompaniesPage from "./pages/SuperAdminCompaniesPage.jsx";
import SuperAdminUsersPage from "./pages/SuperAdminUsersPage.jsx";
import SuperAdminPaymentsPage from "./pages/SuperAdminPaymentsPage.jsx";
import SuperAdminProfilePage from "./pages/SuperAdminProfilePage.jsx";
import { useAuth } from "./lib/AuthContext.jsx";
import { getDemoUser, isDemoMode } from "./lib/demoMode.js";
import { normalizeRole } from "./lib/authRoles.js";
import { usePreferences } from "./lib/PreferencesContext.jsx";

const legacyRouteRedirects = Object.freeze({
  "/ower/team-performance": "/owner/team-performance",
  "/ower /team-performance": "/owner/team-performance"
});

const routeTitles = {
  "/": { ar: "Teamoria — نظام تشغيل الفريق", en: "Teamoria — Team operating system" },
  "/signin": { ar: "تسجيل الدخول", en: "Sign in" },
  "/login": { ar: "تسجيل الدخول", en: "Sign in" },
  "/reset-password": { ar: "إعادة تعيين كلمة المرور", en: "Reset password" },
  "/forgot-password": { ar: "استعادة كلمة المرور", en: "Forgot password" },
  "/signup": { ar: "إنشاء حساب", en: "Create account" },
  "/register": { ar: "إنشاء حساب", en: "Create account" },
  "/verify-otp": { ar: "تأكيد رمز التحقق", en: "Verify code" },
  "/company/register": { ar: "إعداد الشركة", en: "Set up company" },
  "/onboarding/company": { ar: "إعداد الشركة", en: "Set up company" },
  "/dashboard": { ar: "نظرة عامة", en: "Dashboard" },
  "/projects": { ar: "المشاريع", en: "Projects" },
  "/tasks": { ar: "المهام", en: "Tasks" },
  "/meetings": { ar: "الاجتماعات", en: "Meetings" },
  "/workspace": { ar: "مساحة العمل", en: "Workspace" },
  "/uploads": { ar: "مركز الملفات", en: "Upload center" },
  "/ai-chat": { ar: "مساعد Teamoria", en: "Teamoria assistant" },
  "/agent-runs": { ar: "عمليات الوكلاء", en: "Agent runs" },
  "/agent-run-details": { ar: "تفاصيل عملية الوكيل", en: "Agent run details" },
  "/workspace-graph": { ar: "خريطة المعرفة", en: "Knowledge graph" },
  "/employees": { ar: "الفريق", en: "Team" },
  "/owner/projects": { ar: "إدارة المشاريع", en: "Project management" },
  "/owner/uploads": { ar: "إدارة الملفات", en: "File management" },
  "/owner/uploads/files": { ar: "الملفات المرفوعة", en: "Uploaded files" },
  "/team-performance": { ar: "أداء الفريق", en: "Team performance" },
  "/owner/team-performance": { ar: "أداء الفريق", en: "Team performance" },
  "/reports": { ar: "التقارير", en: "Reports" },
  "/profile": { ar: "الملف الشخصي", en: "Profile" },
  "/notifications": { ar: "الإشعارات", en: "Notifications" },
  "/super-admin": { ar: "إدارة المنصة", en: "Platform administration" },
  "/super-admin/companies": { ar: "إدارة الشركات", en: "Company management" },
  "/super-admin/users": { ar: "إدارة المستخدمين", en: "User management" },
  "/super-admin/payments": { ar: "إدارة المدفوعات", en: "Payment management" },
  "/super-admin/profile": { ar: "الملف الشخصي", en: "Profile" },
  "/super-admin/notifications": { ar: "الإشعارات", en: "Notifications" }
};

const adminRoutes = new Set([
  "/super-admin",
  "/super-admin/companies",
  "/super-admin/users",
  "/super-admin/payments",
  "/super-admin/profile",
  "/super-admin/notifications"
]);

const guestRoutes = new Set([
  "/signin",
  "/login",
  "/signup",
  "/register",
  "/reset-password",
  "/forgot-password"
]);

const companyOnboardingRoutes = new Set([
  "/company/register",
  "/onboarding/company"
]);

const workspaceRoutes = new Set([
  "/dashboard",
  "/projects",
  "/tasks",
  "/meetings",
  "/workspace",
  "/uploads",
  "/ai-chat",
  "/agent-runs",
  "/agent-run-details",
  "/workspace-graph",
  "/employees",
  "/owner/projects",
  "/owner/uploads",
  "/owner/uploads/files",
  "/team-performance",
  "/owner/team-performance",
  "/reports",
  "/profile",
  "/notifications"
]);

const companyOwnerRoutes = new Set([
  "/dashboard",
  "/tasks",
  "/employees",
  "/owner/projects",
  "/owner/uploads",
  "/owner/uploads/files",
  "/ai-chat",
  "/profile",
  "/notifications"
]);

const companyManagerRoutes = new Set([
  "/dashboard",
  "/projects",
  "/tasks",
  "/uploads",
  "/ai-chat",
  "/profile",
  "/notifications"
]);

const companyMemberRoutes = new Set([
  "/dashboard",
  "/tasks",
  "/uploads",
  "/ai-chat",
  "/profile",
  "/notifications"
]);

const routes = {
  "/": LandingPage,
  "/signin": SignInPage,
  "/login": SignInPage,
  "/reset-password": ResetPasswordPage,
  "/forgot-password": ResetPasswordPage,
  "/signup": SignUpPage,
  "/register": SignUpPage,
  "/verify-otp": VerifyOtpPage,
  "/company/register": CompanyOnboardingPage,
  "/onboarding/company": CompanyOnboardingPage,
  "/dashboard": DashboardPage,
  "/projects": ProjectsPage,
  "/tasks": TasksPage,
  "/meetings": MeetingsPage,
  "/workspace": WorkspaceDetailsPage,
  "/uploads": UploadCenterPage,
  "/ai-chat": AiChatPage,
  "/agent-runs": AgentRunsPage,
  "/agent-run-details": AgentRunDetailsPage,
  "/workspace-graph": WorkspaceGraphPage,
  "/employees": EmployeesPage,
  "/owner/projects": OwnerProjectsPage,
  "/owner/uploads": OwnerUploadCenterPage,
  "/owner/uploads/files": OwnerUploadedFilesPage,
  "/team-performance": TeamPerformanceOversightPage,
  "/owner/team-performance": TeamPerformanceOversightPage,
  "/reports": ReportsPage,
  "/profile": ProfilePage,
  "/notifications": NotificationsPage,
  "/super-admin": SuperAdminConsolePage,
  "/super-admin/companies": SuperAdminCompaniesPage,
  "/super-admin/users": SuperAdminUsersPage,
  "/super-admin/payments": SuperAdminPaymentsPage,
  "/super-admin/profile": SuperAdminProfilePage,
  "/super-admin/notifications": NotificationsPage
};

function decodeRoutePath(path) {
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}

function resolveRoutePath(path) {
  const decodedPath = decodeRoutePath(path);
  return legacyRouteRedirects[decodedPath] || decodedPath;
}

function getPath() {
  const directPath = resolveRoutePath(window.location.pathname);

  if (window.location.pathname !== "/" && routes[directPath]) {
    const nextHash = `${directPath}${window.location.search || ""}`;
    window.history.replaceState(null, "", `${window.location.origin}/#${nextHash}`);
  }

  const hash = window.location.hash.replace(/^#/, "");
  const queryIndex = hash.indexOf("?");
  const rawPath = queryIndex === -1 ? hash : hash.slice(0, queryIndex);
  const hashQuery = queryIndex === -1 ? "" : hash.slice(queryIndex);
  const path = resolveRoutePath(rawPath);

  if (routes[path] && rawPath !== path) {
    window.history.replaceState(null, "", `#${path}${hashQuery}`);
  }

  return routes[path] ? path : "/";
}

export default function App() {
  const [path, setPath] = useState(getPath);
  const auth = useAuth();
  const { language } = usePreferences();
  const demoUser = isDemoMode() ? getDemoUser() : null;
  const user = auth.user || demoUser;
  const normalizedRole = normalizeRole(user?.role);
  const isAdmin = normalizedRole === "admin";
  const isCompanyUser = ["company_owner", "company_manager", "company_member"].includes(normalizedRole);
  const isLoading = auth.isLoading && !demoUser;
  const requiresCompany = Boolean(user?.requires_company);

  useEffect(() => {
    const onHashChange = () => setPath(getPath());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    const title = routeTitles[path] || routeTitles["/"];
    document.title = path === "/"
      ? title[language] || title.en
      : `${title[language] || title.en} — Teamoria`;
  }, [language, path]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const existingTarget = document.getElementById("main-content");
      const mainContent = existingTarget || document.querySelector("#root main");

      if (!(mainContent instanceof HTMLElement)) return;

      if (!existingTarget) mainContent.id = "main-content";
      if (!mainContent.hasAttribute("tabindex")) mainContent.tabIndex = -1;
      mainContent.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [path]);

  const Page = useMemo(() => routes[path] || LandingPage, [path]);

  if (guestRoutes.has(path) && !isLoading && user && !requiresCompany) {
    window.location.hash = isAdmin ? "/super-admin" : "/dashboard";
    return null;
  }

  if (companyOnboardingRoutes.has(path)) {
    if (isLoading) {
      return <AccessMessage title="Loading..." message="Checking your account setup." />;
    }

    if (!user) {
      window.location.hash = "/signin";
      return null;
    }

    if (isAdmin) {
      window.location.hash = "/super-admin";
      return null;
    }

    if (!requiresCompany) {
      window.location.hash = "/dashboard";
      return null;
    }

    return <Page />;
  }

  if (workspaceRoutes.has(path)) {
    if (isLoading) {
      return <AccessMessage title="Loading..." message="Checking your permissions." />;
    }

    if (isAdmin) {
      window.location.hash = path === "/profile" ? "/super-admin/profile" : "/super-admin";
      return null;
    }

    if (!user) {
      window.location.hash = "/signin";
      return null;
    }

    if (requiresCompany) {
      window.location.hash = "/company/register";
      return null;
    }

    const allowedRoutes = getAllowedWorkspaceRoutes(normalizedRole);
    if (isCompanyUser && allowedRoutes && !allowedRoutes.has(path)) {
      window.location.hash = "/dashboard";
      return null;
    }
  }

  if (adminRoutes.has(path)) {
    if (isLoading) {
      return <AccessMessage title="Loading..." message="Checking your permissions." />;
    }

    if (!user) {
      window.location.hash = "/signin";
      return null;
    }

    if (!isAdmin) {
      return <AccessMessage title="You are not authorized" message="Admin pages are only available for admin users." />;
    }
  }

  return <Page />;
}

function getAllowedWorkspaceRoutes(role) {
  if (role === "company_owner") return companyOwnerRoutes;
  if (role === "company_manager") return companyManagerRoutes;
  if (role === "company_member") return companyMemberRoutes;
  return null;
}

function AccessMessage({ title, message }) {
  return (
    <main className="access-message-page">
      <section>
        <h1>{title}</h1>
        <p>{message}</p>
        <a href="#/dashboard">Back to dashboard</a>
      </section>
    </main>
  );
}
