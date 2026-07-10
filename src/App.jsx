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
  "/ower/team-performance",
  "/ower /team-performance",
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
  "/ower/team-performance": TeamPerformanceOversightPage,
  "/ower /team-performance": TeamPerformanceOversightPage,
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

function getPath() {
  if (window.location.pathname !== "/" && routes[window.location.pathname]) {
    const nextHash = `${window.location.pathname}${window.location.search || ""}`;
    window.history.replaceState(null, "", `${window.location.origin}/#${nextHash}`);
  }

  const hash = window.location.hash.replace("#", "");
  const path = hash.split("?")[0];
  return routes[path] ? path : "/";
}

export default function App() {
  const [path, setPath] = useState(getPath);
  const auth = useAuth();
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
