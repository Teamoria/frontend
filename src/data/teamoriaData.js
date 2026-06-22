export const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: "grid" },
  { label: "Projects", path: "/projects", icon: "folder" },
  { label: "Tasks", path: "/tasks", icon: "check" },
  { label: "Meetings", path: "/meetings", icon: "calendar" },
  { label: "Upload Center", path: "/uploads", icon: "upload" },
  { label: "AI Chat", path: "/ai-chat", icon: "spark" },
  { label: "Employees", path: "/employees", icon: "users" },
  { label: "Reports", path: "/reports", icon: "chart" }
];

export const publicCopy = {
  eyebrow: "AI Workspace Management Platform",
  headline: "Teamoria",
  description:
    "AI-powered workspace for managing projects, meetings, tasks, files, employees, and company knowledge from one secure platform.",
  knowledgeHeadline: "Work scattered across tools becomes searchable knowledge.",
  knowledgeDescription:
    "Teamoria connects projects, tasks, meetings, documents, and AI answers in a single company workspace.",
  features: [
    ["Project Management", "Plan, track, analyze, and retrieve work context with permission-aware AI."],
    ["Meeting Intelligence", "Upload recordings and extract summaries, decisions, and tasks."],
    ["AI Knowledge Search", "Ask workspace questions with cited sources and permission-aware retrieval."],
    ["Upload Center", "Process PDF, DOCX, TXT, audio, and video files."],
    ["Roles", "Control access by user role and permission matrix."],
    ["Multi-Tenant", "Secure isolated data for each company."]
  ],
  workflow: [
    "Create workspace",
    "Add projects and teams",
    "Upload meetings and files",
    "Ask AI with sources"
  ]
};

export const dashboardStats = [
  { label: "Active Projects", value: "24", trend: "12% from last week", direction: "up", icon: "folder" },
  { label: "Tasks Done", value: "186", trend: "8% from last week", direction: "up", icon: "check" },
  { label: "Team Velocity", value: "94%", trend: "5% from last week", direction: "up", icon: "trend" },
  { label: "Meetings Today", value: "3", trend: "1 from yesterday", direction: "down", icon: "calendar" }
];

export const recentTasks = [
  ["Update user authentication flow", "Website Redesign", "May 24", "High"],
  ["Design system component library", "Mobile App", "May 22", "Medium"],
  ["Implement API rate limiting", "AI Dashboard", "May 26", "High"],
  ["User testing and feedback analysis", "Website Redesign", "May 28", "Low"],
  ["Optimize database queries", "AI Dashboard", "May 30", "Medium"]
];

export const todayMeetings = [
  ["9:00 AM", "Daily Standup", "30 min"],
  ["11:00 AM", "Project Review", "60 min"],
  ["2:00 PM", "Design Sync", "45 min"]
];

export const projects = [
  {
    title: "Website Redesign",
    description: "Redesign and optimize company website",
    due: "Jun 25, 2025",
    progress: 75,
    status: "Active",
    health: "On Track",
    accent: "violet",
    icon: "rocket",
    team: ["SJ", "EB", "LC", "NP", "+2"]
  },
  {
    title: "Mobile App Development",
    description: "Build and launch the new mobile app",
    due: "Jul 18, 2025",
    progress: 60,
    status: "Active",
    health: "On Track",
    accent: "blue",
    icon: "phone",
    team: ["EB", "SJ", "MR", "LC", "+3"]
  },
  {
    title: "Marketing Campaign",
    description: "Q2 product launch marketing campaign",
    due: "May 30, 2025",
    progress: 90,
    status: "Active",
    health: "On Track",
    accent: "pink",
    icon: "megaphone",
    team: ["SJ", "EB", "NP", "+1"]
  },
  {
    title: "Data Analytics Dashboard",
    description: "Build analytics dashboard for insights",
    due: "Aug 8, 2025",
    progress: 35,
    status: "At Risk",
    health: "At Risk",
    accent: "orange",
    icon: "pie",
    team: ["EB", "SJ", "MR", "+1"]
  }
];

export const kanbanColumns = [
  {
    title: "To Do",
    count: 6,
    tasks: [
      { title: "Design landing page hero section", owner: "Olivia Rhye", date: "May 26, 2025", priority: "High", tags: ["Design", "Website"] },
      { title: "Implement user authentication", owner: "Liam Carter", date: "May 28, 2025", priority: "Medium", tags: ["Development", "Backend"] },
      { title: "Create database schema", owner: "Sophia Chen", date: "May 30, 2025", priority: "Low", tags: ["Development", "Database"] },
      { title: "Write blog post: Task management tips", owner: "Noah Patel", date: "Jun 2, 2025", priority: "Medium", tags: ["Content", "Blog"] }
    ]
  },
  {
    title: "In Progress",
    count: 4,
    tasks: [
      { title: "Build responsive navigation", owner: "Ethan Brooks", date: "May 24, 2025", priority: "High", tags: ["Development", "Frontend"], active: true },
      { title: "Optimize images for performance", owner: "Ava Martinez", date: "May 27, 2025", priority: "Medium", tags: ["Design", "Performance"] },
      { title: "Set up CI/CD pipeline", owner: "William Johnson", date: "May 31, 2025", priority: "Low", tags: ["DevOps", "Automation"] }
    ]
  },
  {
    title: "Done",
    count: 8,
    done: true,
    tasks: [
      { title: "Project kick-off meeting", owner: "Olivia Rhye", date: "May 10, 2025", priority: "High", tags: ["Meeting", "Planning"] },
      { title: "Define project requirements", owner: "Liam Carter", date: "May 12, 2025", priority: "High", tags: ["Planning", "Docs"] },
      { title: "Create wireframes", owner: "Sophia Chen", date: "May 14, 2025", priority: "Medium", tags: ["Design", "Wireframe"] },
      { title: "Setup project repository", owner: "William Johnson", date: "May 15, 2025", priority: "Low", tags: ["DevOps", "Setup"] }
    ]
  }
];

export const meetings = [
  { title: "Product Roadmap Sync", time: "10:00 AM - 11:00 AM", group: "Today", participants: ["JC", "DL", "WW", "+2"], active: true },
  { title: "Design System Review", time: "2:00 PM - 3:00 PM", group: "Yesterday", participants: ["JC", "DL", "LC"] },
  { title: "Marketing Strategy Align", time: "11:00 AM - 12:00 PM", group: "Yesterday", participants: ["JC", "WW", "DL", "+4"] },
  { title: "Q2 Planning Session", time: "1:00 PM - 2:30 PM", group: "May 20, 2025", participants: ["JC", "DL", "WW", "+6"] },
  { title: "Engineering Standup", time: "9:30 AM - 10:00 AM", group: "May 20, 2025", participants: ["LC", "WW", "DL"] }
];

export const meetingSummary =
  "The team reviewed the current product roadmap and discussed key priorities for the upcoming quarter. We aligned on launching the mobile app redesign, improving AI-powered features, and expanding integrations. Resource allocation and timeline adjustments were also discussed.";

export const meetingActions = [
  ["Finalize mobile app wireframes", "Devon Lane", "May 26"],
  ["Review AI feature requirements", "Wade Warren", "May 27"],
  ["Prepare integration spec for Slack", "Cody Fisher", "May 28"],
  ["Update roadmap timeline", "Jane Cooper", "May 29"]
];

export const meetingDecisions = [
  "Prioritized mobile app redesign as the top initiative for Q3.",
  "Approved start of AI-powered insights feature development.",
  "Decided to integrate with Slack and Microsoft Teams in Q3.",
  "Allocated additional resources to the mobile team."
];
