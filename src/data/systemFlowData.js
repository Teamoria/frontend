export const roleProfiles = {
  admin: {
    user: "Platform Admin",
    role: "Admin",
    company: "Teamoria Platform",
    status: "Platform control",
    badge: "Admin"
  },
  owner: {
    user: "Ahmed Alyazouri",
    role: "Company Owner",
    company: "Taqat Digital",
    status: "Trial ends in 3 days",
    badge: "Owner"
  },
  manager: {
    user: "Fares Namlah",
    role: "Manager",
    company: "Taqat Digital",
    status: "Active workspace",
    badge: "Manager"
  },
  member: {
    user: "Sarah Johnson",
    role: "Member",
    company: "Taqat Digital",
    status: "4 tasks due",
    badge: "Member"
  }
};

export const systemUsers = [
  {
    name: "Platform Admin",
    email: "admin@teamoria.ai",
    password: "Demo@12345",
    role: "Admin",
    roleId: "admin",
    company: "Teamoria Platform",
    entry: "/admin",
    scope: "Manage platform plans, companies, payments, and global statistics."
  },
  {
    name: "Ahmed Alyazouri",
    email: "owner@taqat.ai",
    password: "Demo@12345",
    role: "Company Owner",
    roleId: "owner",
    company: "Taqat Digital",
    entry: "/company",
    scope: "Manage company subscription, team members, projects, and settings."
  },
  {
    name: "Fares Namlah",
    email: "manager@taqat.ai",
    password: "Demo@12345",
    role: "Manager",
    roleId: "manager",
    company: "Taqat Digital",
    entry: "/workspace",
    scope: "Create projects, manage tasks, assign members, upload files, and use AI Chat."
  },
  {
    name: "Sarah Johnson",
    email: "member@taqat.ai",
    password: "Demo@12345",
    role: "Member",
    roleId: "member",
    company: "Taqat Digital",
    entry: "/my-projects",
    scope: "View assigned projects, update task status, add notes, upload files, and ask AI."
  }
];

export const roleNavigation = {
  admin: [
    { label: "Admin Dashboard", path: "/admin", icon: "grid" },
    { label: "Plans", path: "/admin/plans", icon: "plans" },
    { label: "Companies", path: "/admin/companies", icon: "building" },
    { label: "Payments", path: "/admin/payments", icon: "payments" },
    { label: "Platform Stats", path: "/admin/stats", icon: "chart" }
  ],
  owner: [
    { label: "Company Dashboard", path: "/company", icon: "grid" },
    { label: "Projects", path: "/company/projects", icon: "folder" },
    { label: "Team", path: "/company/team", icon: "users" },
    { label: "Upload Center", path: "/uploads", icon: "upload" },
    { label: "Billing", path: "/company/billing", icon: "payments" },
    { label: "Company Settings", path: "/company/settings", icon: "settings" }
  ],
  manager: [
    { label: "Dashboard", path: "/workspace", icon: "grid" },
    { label: "My Projects", path: "/my-projects", icon: "folder" },
    { label: "Kanban Board", path: "/tasks", icon: "check" },
    { label: "Upload Center", path: "/uploads", icon: "upload" },
    { label: "AI Chat", path: "/ai-chat", icon: "spark" },
    { label: "Notifications", path: "/notifications", icon: "bell" }
  ],
  member: [
    { label: "Dashboard", path: "/workspace", icon: "grid" },
    { label: "My Projects", path: "/my-projects", icon: "folder" },
    { label: "Kanban Board", path: "/tasks", icon: "check" },
    { label: "Upload Center", path: "/uploads", icon: "upload" },
    { label: "AI Chat", path: "/ai-chat", icon: "spark" },
    { label: "Notifications", path: "/notifications", icon: "bell" }
  ]
};

export const adminStats = [
  { label: "Companies", value: "48", trend: "6 new this month", icon: "building" },
  { label: "Active Subscriptions", value: "31", trend: "9 trials converting", icon: "plans" },
  { label: "Pending Payments", value: "7", trend: "$18.4k awaiting review", icon: "payments" },
  { label: "Platform Revenue", value: "$94k", trend: "Up 18% this quarter", icon: "chart" }
];

export const plans = [
  { name: "Basic", price: "$49", companies: 14, members: "10", projects: "5", status: "Active" },
  { name: "Pro", price: "$149", companies: 22, members: "50", projects: "Unlimited", status: "Active" },
  { name: "Enterprise", price: "Custom", companies: 12, members: "Unlimited", projects: "Unlimited", status: "Active" }
];

export const platformCompanies = [
  { name: "Taqat Digital", owner: "Ahmed Alyazouri", plan: "Enterprise", status: "Trialing", members: 64, projects: 8, revenue: "$4,900" },
  { name: "North Star Labs", owner: "Maya Quinn", plan: "Pro", status: "Active", members: 38, projects: 5, revenue: "$1,490" },
  { name: "Afaq Consulting", owner: "Nour Haddad", plan: "Basic", status: "Pending Payment", members: 21, projects: 3, revenue: "$490" },
  { name: "Cedar Systems", owner: "Rami Saleh", plan: "Pro", status: "Suspended", members: 17, projects: 2, revenue: "$0" }
];

export const payments = [
  { id: "PAY-2048", company: "Afaq Consulting", plan: "Basic", amount: "$490", reference: "BT-882104", status: "Pending", submitted: "Jun 24, 2026" },
  { id: "PAY-2047", company: "Taqat Digital", plan: "Enterprise", amount: "$4,900", reference: "BT-771920", status: "Confirmed", submitted: "Jun 22, 2026" },
  { id: "PAY-2046", company: "Cedar Systems", plan: "Pro", amount: "$1,490", reference: "BT-551019", status: "Rejected", submitted: "Jun 19, 2026" }
];

export const subscriptionStates = [
  { state: "trialing", label: "7-day free trial", tone: "blue", copy: "Full access is enabled until the trial ends." },
  { state: "limited", label: "Limited access", tone: "orange", copy: "Trial ended. Uploads and AI actions are paused until payment is submitted." },
  { state: "pending", label: "Payment pending", tone: "amber", copy: "Bank transfer was submitted and is waiting for admin review." },
  { state: "active", label: "Subscription active", tone: "green", copy: "Billing is confirmed and all workspace features are enabled." },
  { state: "rejected", label: "Payment rejected", tone: "red", copy: "Reference could not be verified. Submit a corrected transfer." },
  { state: "suspended", label: "Company suspended", tone: "red", copy: "Access is disabled by platform administration." }
];

export const companyMetrics = [
  { label: "Active Projects", value: "8", trend: "3 need manager review", icon: "folder" },
  { label: "Team Members", value: "64", trend: "5 invited this week", icon: "users" },
  { label: "Open Tasks", value: "143", trend: "28 high priority", icon: "check" },
  { label: "AI Files Indexed", value: "512", trend: "96% searchable", icon: "spark" }
];

export const projectWorkload = [
  { title: "AI Platform Workspace", manager: "Fares Namlah", status: "On Track", progress: 78, tasks: 42, files: 128 },
  { title: "Client Portal Launch", manager: "Aseel Harazeen", status: "At Risk", progress: 62, tasks: 31, files: 74 },
  { title: "Operations Knowledge Base", manager: "Sarah Johnson", status: "Review", progress: 45, tasks: 28, files: 211 }
];

export const teamMembers = [
  { name: "Aseel Harazeen", email: "aseel@taqat.ai", role: "Manager", projects: 8, status: "Active", lastSeen: "Today" },
  { name: "Fares Namlah", email: "fares@taqat.ai", role: "Manager", projects: 3, status: "Active", lastSeen: "Today" },
  { name: "Sarah Johnson", email: "sarah@taqat.ai", role: "Member", projects: 2, status: "Active", lastSeen: "2h ago" },
  { name: "Liam Carter", email: "liam@taqat.ai", role: "Member", projects: 1, status: "Invited", lastSeen: "Pending" }
];

export const notifications = [
  { title: "Payment review pending", detail: "Afaq Consulting submitted transfer BT-882104.", type: "Billing", time: "8 min ago", unread: true },
  { title: "Task status changed", detail: "Sarah moved Source citation review to In Progress.", type: "Task", time: "32 min ago", unread: true },
  { title: "Upload processing completed", detail: "Roadmap_Call.mp4 generated 4 tasks and 2 decisions.", type: "AI", time: "1h ago", unread: false },
  { title: "New member invited", detail: "Liam Carter was invited as Member.", type: "Team", time: "Yesterday", unread: false }
];
