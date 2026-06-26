export const aiInsightLevels = {
  info: "Info",
  opportunity: "Opportunity",
  warning: "Warning",
  critical: "Critical"
};

export const aiInsights = [
  {
    id: "insight-growth-apac",
    level: "opportunity",
    title: "Market Opportunity",
    summary: "Expanding APAC AI Lab by 15% will likely yield a 2.4x return on subscription revenue by Q4.",
    confidence: 86,
    scope: "company",
    sources: [
      { label: "Velocity trend", type: "report", href: "#/reports" },
      { label: "Revenue forecast", type: "metric", href: "#/reports" }
    ],
    actions: [
      { label: "Generate HR Roadmap", href: "#/reports" },
      { label: "Review staffing plan", href: "#/employees" }
    ]
  },
  {
    id: "insight-meeting-density",
    level: "info",
    title: "Efficiency Unlock",
    summary: "Cross-department meeting density is high. AI summaries could save 1,200 dev-hours monthly.",
    confidence: 79,
    scope: "company",
    sources: [
      { label: "Meeting calendar", type: "meeting", href: "#/meetings" },
      { label: "Activity overview", type: "dashboard", href: "#/dashboard" }
    ],
    actions: [
      { label: "Enable summaries", href: "#/settings" },
      { label: "View meetings", href: "#/meetings" }
    ]
  },
  {
    id: "insight-frontend-bottleneck",
    level: "warning",
    title: "Potential Delay: Frontend",
    summary: "UI Component Library is holding up 3 downstream dependencies. Average review time increased by 14 hours.",
    confidence: 91,
    scope: "workspace",
    sources: [
      { label: "Sprint #42 board", type: "task", href: "#/tasks" },
      { label: "Review cycle log", type: "activity", href: "#/agent-runs" }
    ],
    actions: [
      { label: "Reassign tasks", href: "#/tasks" },
      { label: "Move Final QA", href: "#/tasks" }
    ]
  },
  {
    id: "insight-employee-focus",
    level: "opportunity",
    title: "Start Q3 Roadmap Review",
    summary: "Your schedule shows a high-focus window now. Starting the roadmap review first should reduce context switching.",
    confidence: 82,
    scope: "personal",
    sources: [
      { label: "Work schedule", type: "calendar", href: "#/meetings" },
      { label: "Task priority", type: "task", href: "#/tasks" }
    ],
    actions: [
      { label: "Open task", href: "#/tasks" },
      { label: "Ask AI to summarize feedback", href: "#/ai-chat" }
    ]
  }
];

export const dashboardCharts = {
  taskDistribution: [
    { label: "Open", value: 5, tone: "blue" },
    { label: "In Progress", value: 4, tone: "purple" },
    { label: "Done", value: 8, tone: "green" }
  ],
  projectProgress: [
    { label: "AI Platform", value: 78 },
    { label: "Client Portal", value: 62 },
    { label: "Knowledge Base", value: 45 },
    { label: "Mobile Team", value: 88 }
  ],
  activityOverview: [
    { label: "Mon", value: 42 },
    { label: "Tue", value: 58 },
    { label: "Wed", value: 51 },
    { label: "Thu", value: 72 },
    { label: "Fri", value: 64 },
    { label: "Sat", value: 38 },
    { label: "Sun", value: 46 }
  ]
};

export const workspaceActivities = [
  {
    id: "activity-task-created",
    type: "task",
    actor: "Aseel Harazeen",
    title: "Created a new high-priority task",
    detail: "Review roadmap action plan extracted from Roadmap meeting",
    workspace: "AI Platform Workspace",
    time: "8 min ago",
    href: "#/tasks"
  },
  {
    id: "activity-meeting-summary",
    type: "meeting",
    actor: "Teamoria AI",
    title: "Generated meeting summary",
    detail: "AI Sprint Planning produced 4 actions, 2 decisions, and 1 delivery risk",
    workspace: "AI Platform Workspace",
    time: "24 min ago",
    href: "#/meetings"
  },
  {
    id: "activity-upload-processed",
    type: "upload",
    actor: "Fares Namlah",
    title: "Uploaded and indexed a workspace file",
    detail: "Roadmap_Call.mp4 is 64% processed and transcription is running",
    workspace: "Upload Center",
    time: "42 min ago",
    href: "#/uploads"
  },
  {
    id: "activity-user-role",
    type: "user",
    actor: "Ahmed Alyazouri",
    title: "Updated user access scope",
    detail: "Sarah Johnson was added to Mobile Delivery Team as contributor",
    workspace: "Company Settings",
    time: "1 hour ago",
    href: "#/employees"
  }
];
