import { useEffect, useMemo, useState } from "react";
import LandingPage from "./pages/LandingPage.jsx";
import SignInPage from "./pages/SignInPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import VerifyOtpPage from "./pages/VerifyOtpPage.jsx";
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
import OwnerOperationsPage from "./pages/OwnerOperationsPage.jsx";
import OwnerUploadCenterPage from "./pages/OwnerUploadCenterPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import SuperAdminConsolePage from "./pages/SuperAdminConsolePage.jsx";
import SuperAdminCompaniesPage from "./pages/SuperAdminCompaniesPage.jsx";
import SuperAdminUsersPage from "./pages/SuperAdminUsersPage.jsx";
import SuperAdminPaymentsPage from "./pages/SuperAdminPaymentsPage.jsx";
import SuperAdminProfilePage, { SuperAdminProfileSettingsPage } from "./pages/SuperAdminProfilePage.jsx";
import { useAuth } from "./lib/AuthContext.jsx";
import { getDemoUser, isDemoMode } from "./lib/demoMode.js";
import { normalizeRole } from "./lib/authRoles.js";

const adminRoutes = new Set([
  "/super-admin",
  "/super-admin/companies",
  "/super-admin/users",
  "/super-admin/payments",
  "/super-admin/profile-settings",
  "/super-admin/profile"
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
  "/owner/operations",
  "/owner/uploads",
  "/team-performance",
  "/owner/team-performance",
  "/ower/team-performance",
  "/ower /team-performance",
  "/reports",
  "/settings",
  "/profile"
]);

const companyOwnerRoutes = new Set([
  "/dashboard",
  "/employees",
  "/owner/projects",
  "/tasks",
  "/owner/operations",
  "/owner/uploads",
  "/ai-chat",
  "/settings",
  "/profile"
]);

const companyManagerRoutes = new Set([
  "/dashboard",
  "/projects",
  "/tasks",
  "/uploads",
  "/ai-chat",
  "/profile"
]);

const companyMemberRoutes = new Set([
  "/dashboard",
  "/tasks",
  "/uploads",
  "/ai-chat",
  "/profile"
]);

const routes = {
  "/": LandingPage,
  "/signin": SignInPage,
  "/reset-password": ResetPasswordPage,
  "/signup": SignUpPage,
  "/verify-otp": VerifyOtpPage,
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
  "/owner/operations": OwnerOperationsPage,
  "/owner/uploads": OwnerUploadCenterPage,
  "/team-performance": TeamPerformanceOversightPage,
  "/owner/team-performance": TeamPerformanceOversightPage,
  "/ower/team-performance": TeamPerformanceOversightPage,
  "/ower /team-performance": TeamPerformanceOversightPage,
  "/reports": ReportsPage,
  "/settings": SettingsPage,
  "/profile": ProfilePage,
  "/super-admin": SuperAdminConsolePage,
  "/super-admin/companies": SuperAdminCompaniesPage,
  "/super-admin/users": SuperAdminUsersPage,
  "/super-admin/payments": SuperAdminPaymentsPage,
  "/super-admin/profile-settings": SuperAdminProfileSettingsPage,
  "/super-admin/profile": SuperAdminProfilePage
};

function getPath() {
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

  useEffect(() => {
    const onHashChange = () => setPath(getPath());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const Page = useMemo(() => routes[path] || LandingPage, [path]);

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
