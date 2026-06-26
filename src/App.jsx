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
import SettingsPage from "./pages/SettingsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

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
  "/reports": ReportsPage,
  "/settings": SettingsPage,
  "/profile": ProfilePage
};

function getPath() {
  const hash = window.location.hash.replace("#", "");
  const path = hash.split("?")[0];
  return routes[path] ? path : "/";
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
