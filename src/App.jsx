import { useEffect, useMemo, useState } from "react";
import LandingPage from "./pages/LandingPage.jsx";
import SignInPage from "./pages/SignInPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ProjectsPage from "./pages/ProjectsPage.jsx";
import TasksPage from "./pages/TasksPage.jsx";
import MeetingsPage from "./pages/MeetingsPage.jsx";
import WorkspaceDetailsPage from "./pages/WorkspaceDetailsPage.jsx";
import UploadCenterPage from "./pages/UploadCenterPage.jsx";
import AiChatPage from "./pages/AiChatPage.jsx";
import AiSystemPage from "./pages/AiSystemPage.jsx";
import AgentRunsPage from "./pages/AgentRunsPage.jsx";
import AgentRunDetailsPage from "./pages/AgentRunDetailsPage.jsx";
import WorkspaceGraphPage from "./pages/WorkspaceGraphPage.jsx";
import EmployeesPage from "./pages/EmployeesPage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import MarketingPage from "./pages/MarketingPage.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import AdminPlansPage from "./pages/AdminPlansPage.jsx";
import AdminCompaniesPage from "./pages/AdminCompaniesPage.jsx";
import AdminCompanyDetailsPage from "./pages/AdminCompanyDetailsPage.jsx";
import AdminPaymentsPage from "./pages/AdminPaymentsPage.jsx";
import AdminStatsPage from "./pages/AdminStatsPage.jsx";
import CompanyDashboardPage from "./pages/CompanyDashboardPage.jsx";
import CompanyBillingPage from "./pages/CompanyBillingPage.jsx";
import CompanyTeamPage from "./pages/CompanyTeamPage.jsx";
import CompanySettingsPage from "./pages/CompanySettingsPage.jsx";
import MyProjectsPage from "./pages/MyProjectsPage.jsx";
import ProjectDetailsFlowPage from "./pages/ProjectDetailsFlowPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";

const routes = {
  "/": LandingPage,
  "/signin": SignInPage,
  "/reset-password": ResetPasswordPage,
  "/signup": SignUpPage,
  "/dashboard": DashboardPage,
  "/projects": ProjectsPage,
  "/tasks": TasksPage,
  "/meetings": MeetingsPage,
  "/workspace": WorkspaceDetailsPage,
  "/uploads": UploadCenterPage,
  "/ai-chat": AiChatPage,
  "/ai-system": AiSystemPage,
  "/agent-runs": AgentRunsPage,
  "/agent-run-details": AgentRunDetailsPage,
  "/workspace-graph": WorkspaceGraphPage,
  "/employees": EmployeesPage,
  "/reports": ReportsPage,
  "/settings": SettingsPage,
  "/profile": ProfilePage,
  "/product": () => <MarketingPage page="product" />,
  "/features": () => <MarketingPage page="features" />,
  "/solutions": () => <MarketingPage page="solutions" />,
  "/pricing": () => <MarketingPage page="pricing" />,
  "/admin": AdminDashboardPage,
  "/admin/plans": AdminPlansPage,
  "/admin/companies": AdminCompaniesPage,
  "/admin/companies/taqat": AdminCompanyDetailsPage,
  "/admin/payments": AdminPaymentsPage,
  "/admin/stats": AdminStatsPage,
  "/company": CompanyDashboardPage,
  "/company/projects": ProjectsPage,
  "/company/billing": CompanyBillingPage,
  "/company/team": CompanyTeamPage,
  "/company/settings": CompanySettingsPage,
  "/my-projects": MyProjectsPage,
  "/project-details": ProjectDetailsFlowPage,
  "/notifications": NotificationsPage,
  "/Admin": AdminDashboardPage,
  "/Owner": CompanyDashboardPage,
  "/Company Owner": CompanyDashboardPage,
  "/Manager": WorkspaceDetailsPage,
  "/Member": MyProjectsPage,
  "/owner": CompanyDashboardPage,
  "/company-owner": CompanyDashboardPage,
  "/manager": WorkspaceDetailsPage,
  "/member": MyProjectsPage
};

function getPath() {
  const rawHash = window.location.hash.replace("#", "");
  const hash = decodeURIComponent(rawHash);
  return routes[hash] ? hash : "/";
}

export default function App() {
  const [path, setPath] = useState(getPath);

  useEffect(() => {
    const onHashChange = () => setPath(getPath());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const Page = useMemo(() => routes[path] || LandingPage, [path]);

  return <Page />;
}
