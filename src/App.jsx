import { useEffect, useMemo, useState } from "react";
import { useAuth } from "./lib/AuthContext.jsx";
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
import SettingsPage from "./pages/SettingsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import MarketingPage from "./pages/MarketingPage.jsx";

const publicRoutes = {
  "/": LandingPage,
  "/signin": SignInPage,
  "/reset-password": ResetPasswordPage,
  "/signup": SignUpPage,
  "/verify-otp": VerifyOtpPage,
  "/product": () => <MarketingPage page="product" />,
  "/features": () => <MarketingPage page="features" />,
  "/solutions": () => <MarketingPage page="solutions" />,
  "/pricing": () => <MarketingPage page="pricing" />
};

const protectedRoutes = {
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
  "/reports": ReportsPage,
  "/settings": SettingsPage,
  "/profile": ProfilePage
};

const authPages = new Set(["/signin", "/signup", "/reset-password", "/verify-otp"]);
const allRoutes = { ...publicRoutes, ...protectedRoutes };

function getPath() {
  const hash = window.location.hash.replace("#", "");
  return allRoutes[hash] ? hash : "/";
}

export default function App() {
  const { user, isLoading } = useAuth();
  const [path, setPath] = useState(getPath);

  useEffect(() => {
    const onHashChange = () => setPath(getPath());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-spinner" />
        <p>جاري التحميل...</p>
      </div>
    );
  }

  // Redirect: authenticated user visiting auth pages → dashboard
  if (user && authPages.has(path)) {
    window.location.hash = "/dashboard";
    return null;
  }

  // Redirect: unauthenticated user visiting protected pages → signin
  if (!user && protectedRoutes[path]) {
    window.location.hash = "/signin";
    return null;
  }

  const Page = allRoutes[path] || LandingPage;
  return <Page />;
}
