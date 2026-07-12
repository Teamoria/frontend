import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiActivity,
  FiBarChart2,
  FiBell,
  FiBriefcase,
  FiCheckSquare,
  FiChevronDown,
  FiCloud,
  FiCommand,
  FiCreditCard,
  FiFileText,
  FiFolder,
  FiGlobe,
  FiGrid,
  FiHome,
  FiLogOut,
  FiMenu,
  FiMessageSquare,
  FiMoon,
  FiSearch,
  FiSettings,
  FiShield,
  FiSun,
  FiUser,
  FiUsers,
  FiX,
  FiZap
} from "react-icons/fi";
import Brand from "../components/Brand.jsx";
import { useAuth } from "../lib/AuthContext.jsx";
import { usePreferences } from "../lib/PreferencesContext.jsx";
import { useRealtime } from "../lib/RealtimeContext.jsx";
import { appCopy, routeMeta, textFor } from "./appData.js";
import { IconButton } from "./ui.jsx";

const iconMap = {
  activity: FiActivity,
  assistant: FiMessageSquare,
  companies: FiBriefcase,
  dashboard: FiHome,
  employees: FiUsers,
  graph: FiZap,
  notifications: FiBell,
  payments: FiCreditCard,
  profile: FiUser,
  projects: FiFolder,
  reports: FiBarChart2,
  runs: FiActivity,
  settings: FiSettings,
  tasks: FiCheckSquare,
  uploads: FiCloud,
  users: FiUsers
};

const companyOwnerGroups = [
  {
    label: "overview",
    items: [
      ["dashboard", "/dashboard", "dashboard"],
      ["notifications", "/notifications", "notifications"]
    ]
  },
  {
    label: "operations",
    items: [
      ["projects", "/owner/projects", "projects"],
      ["tasks", "/tasks", "tasks"],
      ["employees", "/employees", "employees"],
      ["uploads", "/owner/uploads", "uploads"]
    ]
  },
  {
    label: "intelligence",
    items: [["assistant", "/ai-chat", "assistant"]]
  }
];

const companyManagerGroups = [
  {
    label: "overview",
    items: [
      ["dashboard", "/dashboard", "dashboard"],
      ["notifications", "/notifications", "notifications"]
    ]
  },
  {
    label: "operations",
    items: [
      ["projects", "/projects", "projects"],
      ["tasks", "/tasks", "tasks"],
      ["uploads", "/uploads", "uploads"]
    ]
  },
  {
    label: "intelligence",
    items: [["assistant", "/ai-chat", "assistant"]]
  }
];

const companyMemberGroups = [
  {
    label: "overview",
    items: [
      ["dashboard", "/dashboard", "dashboard"],
      ["notifications", "/notifications", "notifications"]
    ]
  },
  {
    label: "operations",
    items: [
      ["tasks", "/tasks", "tasks"],
      ["uploads", "/uploads", "uploads"]
    ]
  },
  {
    label: "intelligence",
    items: [["assistant", "/ai-chat", "assistant"]]
  }
];

const adminGroups = [
  {
    label: "overview",
    items: [
      ["platform", "/super-admin", "dashboard"],
      ["notifications", "/super-admin/notifications", "notifications"]
    ]
  },
  {
    label: "administration",
    items: [
      ["companies", "/super-admin/companies", "companies"],
      ["users", "/super-admin/users", "users"],
      ["payments", "/super-admin/payments", "payments"]
    ]
  }
];

function navGroupsForRole(role) {
  if (role === "admin") return adminGroups;
  if (role === "company_owner") return companyOwnerGroups;
  if (role === "company_manager") return companyManagerGroups;
  return companyMemberGroups;
}

function initials(name = "Teamoria") {
  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function roleLabel(role, language) {
  const labels = {
    admin: { ar: "مدير المنصة", en: "Platform admin" },
    company_owner: { ar: "مالك الشركة", en: "Company owner" },
    company_manager: { ar: "مدير الشركة", en: "Company manager" },
    company_member: { ar: "عضو الفريق", en: "Team member" }
  };
  return labels[role]?.[language] || role;
}

export default function WorkspaceShell({ activePath, children }) {
  const { user, normalizedRole, logout } = useAuth();
  const { language, resolvedTheme, toggleLanguage, toggleTheme } = usePreferences();
  const realtime = useRealtime();
  const copy = appCopy[language] || appCopy.en;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [search, setSearch] = useState("");
  const searchRef = useRef(null);
  const accountRef = useRef(null);
  const groups = navGroupsForRole(normalizedRole);
  const meta = routeMeta[activePath];
  const companyName = user?.company?.name || user?.company_name || copy.workspace;

  const searchItems = useMemo(() => groups.flatMap((group) => group.items).map(([key, path, icon]) => ({
    key,
    path,
    icon,
    label: copy[key] || key
  })), [copy, groups]);

  const searchResults = search.trim()
    ? searchItems.filter((item) => item.label.toLowerCase().includes(search.trim().toLowerCase())).slice(0, 6)
    : [];

  useEffect(() => {
    function closeMenus() {
      setDrawerOpen(false);
      setAccountOpen(false);
      setSearch("");
    }
    window.addEventListener("hashchange", closeMenus);
    return () => window.removeEventListener("hashchange", closeMenus);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("t2-drawer-open", drawerOpen);
    return () => document.body.classList.remove("t2-drawer-open");
  }, [drawerOpen]);

  useEffect(() => {
    function onPointerDown(event) {
      if (accountRef.current && !accountRef.current.contains(event.target)) setAccountOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setSearch("");
    }
    function onKeyDown(event) {
      if (event.key === "Escape") {
        setDrawerOpen(false);
        setAccountOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  function navigate(path) {
    window.location.hash = path;
    setDrawerOpen(false);
    setSearch("");
  }

  function handleSearchKeyDown(event) {
    if (event.key === "Enter" && searchResults[0]) {
      event.preventDefault();
      navigate(searchResults[0].path);
    }
  }

  return (
    <div className="t2-shell">
      <a className="t2-skip-link" href="#main-content">{copy.skip}</a>
      <aside className={`t2-sidebar ${drawerOpen ? "is-open" : ""}`} aria-label={copy.navigation}>
        <div className="t2-sidebar__top">
          <Brand className="t2-brand" tagline={copy.brandTagline} />
          <IconButton className="t2-sidebar__close" label={copy.closeMenu} onClick={() => setDrawerOpen(false)}>
            <FiX />
          </IconButton>
        </div>

        <div className="t2-workspace-switcher">
          <span className="t2-workspace-switcher__mark" aria-hidden="true"><FiBriefcase /></span>
          <span>
            <small>{copy.workspace}</small>
            <b title={companyName}>{companyName}</b>
          </span>
          <FiChevronDown aria-hidden="true" />
        </div>

        <nav className="t2-nav">
          {groups.map((group) => (
            <section className="t2-nav__group" key={group.label}>
              <h2>{copy[group.label]}</h2>
              <div>
                {group.items.map(([key, path, icon]) => {
                  const Icon = iconMap[icon] || FiGrid;
                  const active = activePath === path;
                  return (
                    <a aria-current={active ? "page" : undefined} className={active ? "is-active" : ""} href={`#${path}`} key={path}>
                      <Icon aria-hidden="true" />
                      <span>{copy[key]}</span>
                      {active ? <i aria-hidden="true" /> : null}
                    </a>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>

        <div className="t2-sidebar__footer">
          <a className={activePath.includes("profile") ? "is-active" : ""} href={normalizedRole === "admin" ? "#/super-admin/profile" : "#/profile"}>
            <FiUser aria-hidden="true" />
            <span>{copy.profile}</span>
          </a>
          <div className={`t2-realtime t2-realtime--${realtime.connectionStatus || "offline"}`}>
            <span aria-hidden="true" />
            <div>
              <b>{realtime.isConnected ? copy.connected : realtime.connectionStatus === "connecting" ? copy.connecting : copy.offline}</b>
              <small>Laravel Reverb</small>
            </div>
          </div>
        </div>
      </aside>

      {drawerOpen ? <button aria-label={copy.closeMenu} className="t2-drawer-scrim" onClick={() => setDrawerOpen(false)} type="button" /> : null}

      <div className="t2-shell__body">
        <header className="t2-topbar">
          <IconButton className="t2-menu-button" label={copy.openMenu} onClick={() => setDrawerOpen(true)}>
            <FiMenu />
          </IconButton>

          <div className="t2-topbar__context">
            <small>{companyName}</small>
            <b>{textFor(language, meta?.title) || copy.dashboard}</b>
          </div>

          <div className="t2-command-search" ref={searchRef}>
            <FiSearch aria-hidden="true" />
            <input
              aria-label={copy.search}
              autoComplete="off"
              placeholder={copy.search}
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            <span aria-hidden="true"><FiCommand /> K</span>
            {search.trim() ? (
              <div className="t2-search-results">
                <small>{copy.searchResults}</small>
                {searchResults.length ? searchResults.map((item) => {
                  const Icon = iconMap[item.icon] || FiGrid;
                  return (
                    <button key={item.path} onClick={() => navigate(item.path)} type="button">
                      <Icon aria-hidden="true" />
                      <span>{item.label}</span>
                    </button>
                  );
                }) : <p>{copy.noData}</p>}
              </div>
            ) : null}
          </div>

          <div className="t2-topbar__actions">
            <IconButton label={copy.language} onClick={toggleLanguage}><FiGlobe /><span>{language === "ar" ? "EN" : "AR"}</span></IconButton>
            <IconButton label={copy.theme} onClick={toggleTheme}>{resolvedTheme === "dark" ? <FiSun /> : <FiMoon />}</IconButton>
            <IconButton label={copy.notifications} onClick={() => navigate(normalizedRole === "admin" ? "/super-admin/notifications" : "/notifications")}>
              <FiBell />
              <i className="t2-notification-dot" aria-hidden="true" />
            </IconButton>
            <div className="t2-account" ref={accountRef}>
              <button aria-expanded={accountOpen} className="t2-account__trigger" onClick={() => setAccountOpen((current) => !current)} type="button">
                <span className="t2-avatar">{initials(user?.name)}</span>
                <span className="t2-account__copy">
                  <b>{user?.name || "Teamoria User"}</b>
                  <small>{roleLabel(normalizedRole, language)}</small>
                </span>
                <FiChevronDown aria-hidden="true" />
              </button>
              {accountOpen ? (
                <div className="t2-account-menu">
                  <a href={normalizedRole === "admin" ? "#/super-admin/profile" : "#/profile"}>
                    <FiUser aria-hidden="true" />
                    {copy.profile}
                  </a>
                  <button onClick={logout} type="button">
                    <FiLogOut aria-hidden="true" />
                    {copy.signOut}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="t2-main" id="main-content" tabIndex="-1">
          {children}
        </main>
      </div>
    </div>
  );
}

export function PublicPreferenceControls() {
  const { language, resolvedTheme, toggleLanguage, toggleTheme } = usePreferences();
  const copy = appCopy[language] || appCopy.en;
  return (
    <div className="t2-public-preferences">
      <IconButton label={copy.language} onClick={toggleLanguage}><FiGlobe /><span>{language === "ar" ? "EN" : "AR"}</span></IconButton>
      <IconButton label={copy.theme} onClick={toggleTheme}>{resolvedTheme === "dark" ? <FiSun /> : <FiMoon />}</IconButton>
    </div>
  );
}

export function PlatformMark() {
  return <span className="t2-platform-mark" aria-hidden="true"><FiShield /></span>;
}

export function FileMark() {
  return <span className="t2-file-mark" aria-hidden="true"><FiFileText /></span>;
}
