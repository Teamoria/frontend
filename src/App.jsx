import { useEffect, useMemo, useState } from "react";
import LandingPage from "./pages/LandingPage.jsx";
import SignInPage from "./pages/SignInPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import ProjectsPage from "./pages/ProjectsPage.jsx";
import TasksPage from "./pages/TasksPage.jsx";
import MeetingsPage from "./pages/MeetingsPage.jsx";
import WorkspacePlaceholderPage from "./pages/WorkspacePlaceholderPage.jsx";

const routes = {
  "/": LandingPage,
  "/signin": SignInPage,
  "/reset-password": ResetPasswordPage,
  "/signup": SignUpPage,
  "/dashboard": DashboardPage,
  "/projects": ProjectsPage,
  "/tasks": TasksPage,
  "/meetings": MeetingsPage,
  "/uploads": () => <WorkspacePlaceholderPage active="Upload Center" />,
  "/ai-chat": () => <WorkspacePlaceholderPage active="AI Chat" />,
  "/employees": () => <WorkspacePlaceholderPage active="Employees" />,
  "/reports": () => <WorkspacePlaceholderPage active="Reports" />
};

function getPath() {
  const hash = window.location.hash.replace("#", "");
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
