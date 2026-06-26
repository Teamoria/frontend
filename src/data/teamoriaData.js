export const navItems = [
  { label: "Dashboard", ar: "لوحة التحكم", path: "/dashboard", icon: "grid", roles: ["admin", "general-manager", "project-manager", "employee"] },
  { label: "Workspaces", ar: "مساحات العمل", path: "/projects", icon: "folder", roles: ["admin", "general-manager", "project-manager"] },
  { label: "Tasks", ar: "المهام", path: "/tasks", icon: "check", roles: ["admin", "general-manager", "project-manager", "employee"] },
  { label: "Meetings", ar: "الاجتماعات", path: "/meetings", icon: "calendar", roles: ["admin", "general-manager", "project-manager", "employee"] },
  { label: "Upload Center", ar: "مركز الرفع", path: "/uploads", icon: "upload", roles: ["admin", "general-manager", "project-manager", "employee"] },
  { label: "AI Chat", ar: "مساعد الذكاء", path: "/ai-chat", icon: "spark", roles: ["admin", "general-manager", "project-manager", "employee"] },
  { label: "Agent Runs", ar: "تشغيل الوكيل", path: "/agent-runs", icon: "agent", roles: ["admin", "general-manager", "project-manager"] },
  { label: "Workspace Graph", ar: "خريطة العمل", path: "/workspace-graph", icon: "graph", roles: ["admin", "general-manager", "project-manager"] },
  { label: "Employees", ar: "الموظفون", path: "/employees", icon: "users", roles: ["admin", "general-manager"] },
  { label: "Reports", ar: "التقارير", path: "/reports", icon: "chart", roles: ["admin", "general-manager", "project-manager"] },
  { label: "Settings", ar: "الإعدادات", path: "/settings", icon: "settings", roles: ["admin", "general-manager"] },
  { label: "Profile", ar: "الملف الشخصي", path: "/profile", icon: "profile", roles: ["admin", "general-manager", "project-manager", "employee"] }
];

export const roles = [
  { id: "admin", label: "Company Admin", ar: "مسؤول الشركة", scope: "Full company setup, billing, users, and AI permissions." },
  { id: "general-manager", label: "General Manager", ar: "المدير العام", scope: "Company-wide visibility across projects, reports, and teams." },
  { id: "project-manager", label: "Project Manager", ar: "مدير المشاريع", scope: "Manage assigned workspaces, tasks, meetings, and uploads." },
  { id: "employee", label: "Employee", ar: "موظف", scope: "Work on assigned tasks, meetings, files, and AI answers." }
];

export const companies = [
  { name: "Taqat Digital", workspaces: 8, users: 64, plan: "Enterprise" },
  { name: "North Star Labs", workspaces: 5, users: 38, plan: "Business" },
  { name: "Afaq Consulting", workspaces: 3, users: 21, plan: "Starter" }
];

export const publicCopy = {
  eyebrow: "AI Workspace Management Platform",
  headline: "Teamoria",
  description: "One secure platform for projects, tasks, meetings, files, people, and permission-aware AI knowledge.",
  arDescription: "منصة آمنة تجمع المشاريع والمهام والاجتماعات والملفات والموظفين ومساعد ذكاء اصطناعي يعرف صلاحيات كل مستخدم.",
  workflow: ["Create company", "Invite team", "Upload knowledge", "Ask AI", "Track delivery"]
};

export const dashboardStats = [
  { label: "Active Workspaces", ar: "مساحات نشطة", value: "12", trend: "4 added this month", direction: "up", icon: "folder" },
  { label: "Tasks Completed", ar: "مهام منجزة", value: "286", trend: "18% from last week", direction: "up", icon: "check" },
  { label: "AI Answers", ar: "إجابات الذكاء", value: "1.2k", trend: "94% cited", direction: "up", icon: "spark" },
  { label: "Meetings Processed", ar: "اجتماعات محللة", value: "43", trend: "43 chatbots created successfully", direction: "up", icon: "calendar" }
];

export const recentTasks = [
  ["Review roadmap action plan extracted from Roadmap meeting", "AI extracted", "Roadmap video meeting", "High", "video"],
  ["Audit new hiring policies", "HR document", "Human Resources PDF", "Medium", "pdf"],
  ["Upload sprint planning recording", "Mobile App", "Jun 26", "High"],
  ["Validate RAG sources for onboarding policy", "HR Knowledge", "Jun 27", "Low"],
  ["Prepare executive delivery report", "Company Reports", "Jun 28", "Medium"]
];

export const todayMeetings = [
  ["09:00", "Daily Delivery Standup", "30 min"],
  ["11:30", "AI Sprint Review", "60 min"],
  ["14:00", "Client Scope Alignment", "45 min"]
];

export const projects = [
  {
    title: "AI Platform Workspace",
    ar: "مساحة منصة الذكاء",
    description: "RAG, agent runs, upload processing, and workspace graph.",
    due: "Jul 12, 2026",
    progress: 78,
    status: "Active",
    health: "On Track",
    accent: "violet",
    icon: "AI",
    company: "Taqat Digital",
    members: 14,
    files: 128,
    team: ["AA", "FA", "AS", "RH", "+8"]
  },
  {
    title: "Client Portal Launch",
    ar: "إطلاق بوابة العملاء",
    description: "Public website, onboarding, auth, and company signup.",
    due: "Jul 28, 2026",
    progress: 62,
    status: "Active",
    health: "On Track",
    accent: "blue",
    icon: "CP",
    company: "Taqat Digital",
    members: 9,
    files: 74,
    team: ["SJ", "EB", "MR", "LC", "+4"]
  },
  {
    title: "Operations Knowledge Base",
    ar: "قاعدة معرفة العمليات",
    description: "Policies, SOPs, meeting summaries, and searchable documents.",
    due: "Aug 04, 2026",
    progress: 45,
    status: "At Risk",
    health: "At Risk",
    accent: "orange",
    icon: "KB",
    company: "Afaq Consulting",
    members: 7,
    files: 211,
    team: ["LM", "NO", "HA", "+2"]
  },
  {
    title: "Mobile Delivery Team",
    ar: "فريق تطبيق الهاتف",
    description: "Sprint board, meetings, releases, and productivity reports.",
    due: "Aug 18, 2026",
    progress: 88,
    status: "Active",
    health: "On Track",
    accent: "green",
    icon: "MD",
    company: "North Star Labs",
    members: 11,
    files: 96,
    team: ["OR", "LC", "SC", "NP", "+6"]
  }
];

export const kanbanColumns = [
  {
    title: "Open",
    ar: "مفتوحة",
    count: 5,
    tasks: [
      { title: "Create company role mapping screen", owner: "Aseel Harazeen", date: "Jun 24, 2026", priority: "High", tags: ["Auth", "Roles"] },
      { title: "Prepare upload processing empty states", owner: "Fares Namlah", date: "Jun 25, 2026", priority: "Medium", tags: ["Upload", "UX"] },
      { title: "Design AI chat source drawer", owner: "Ahmed Alyazouri", date: "Jun 26, 2026", priority: "High", tags: ["RAG", "Sources"] }
    ]
  },
  {
    title: "In Progress",
    ar: "قيد التنفيذ",
    count: 4,
    tasks: [
      { title: "Build interactive workspace graph layout", owner: "Sarah Johnson", date: "Jun 27, 2026", priority: "High", tags: ["Graph", "Workspace"], active: true },
      { title: "Add meeting transcript review panel", owner: "Liam Carter", date: "Jun 28, 2026", priority: "Medium", tags: ["Meetings", "AI"] },
      { title: "Create agent run step details page", owner: "Olivia Rhye", date: "Jun 29, 2026", priority: "Medium", tags: ["Agent", "Logs"] }
    ]
  },
  {
    title: "Done",
    ar: "منجزة",
    count: 8,
    done: true,
    tasks: [
      { title: "Define Teamoria MVP navigation", owner: "Noah Patel", date: "Jun 20, 2026", priority: "Low", tags: ["Planning", "MVP"] },
      { title: "Draft SRS screens list", owner: "Sophia Chen", date: "Jun 21, 2026", priority: "Medium", tags: ["Docs", "SRS"] },
      { title: "Create landing visual direction", owner: "Ethan Brooks", date: "Jun 22, 2026", priority: "Low", tags: ["Website", "Brand"] }
    ]
  }
];

export const meetings = [
  { title: "AI Sprint Planning", time: "09:00 - 10:00", group: "Today", participants: ["AA", "FA", "AS", "+4"], active: true },
  { title: "Upload Pipeline Review", time: "11:00 - 11:45", group: "Today", participants: ["LC", "OR", "SJ"] },
  { title: "Client Portal Scope", time: "14:00 - 14:45", group: "Tomorrow", participants: ["EB", "MR", "NP", "+2"] },
  { title: "Executive Status", time: "10:30 - 11:00", group: "Jun 25, 2026", participants: ["GM", "PM", "AD"] }
];

export const meetingSummary =
  "The team agreed to complete authentication, workspace upload, AI chat, and graph screens first. The meeting generated four tasks, two decisions, and one risk related to role-based visibility.";

export const meetingActions = [
  ["Finalize company registration fields", "Ahmed Alyazouri", "Jun 24"],
  ["Review manager and employee permissions", "Aseel Harazeen", "Jun 25"],
  ["Prepare sample meeting transcript data", "Fares Namlah", "Jun 26"],
  ["Validate graph filters for project scope", "Sarah Johnson", "Jun 27"]
];

export const meetingDecisions = [
  "Company admin can manage users, roles, settings, and all workspaces.",
  "Project managers can see assigned workspaces only.",
  "Employees see assigned tasks, meetings, uploads, and cited AI answers.",
  "AI answers must show sources when file or meeting context is used."
];

export const uploads = [
  { name: "Sprint1_Planning.docx", type: "DOCX", status: "Completed", progress: 100, summary: "Generated 8 tasks and 3 decisions." },
  { name: "Roadmap_Call.mp4", type: "Video", status: "Processing", progress: 64, summary: "Transcribing audio and detecting speakers." },
  { name: "Teamoria_SRS.pdf", type: "PDF", status: "Completed", progress: 100, summary: "Indexed 42 searchable chunks." },
  { name: "Client_Notes.png", type: "Image", status: "Uploading", progress: 32, summary: "OCR will start after upload." }
];

export const chatMessages = [
  { side: "user", text: "What tasks were assigned to Sarah in the meeting?" },
  {
    side: "ai",
    text: "Sarah was asked to validate workspace graph filters, review visible project scope, and confirm that AI answers show citations from the uploaded Sprint video. These tasks were extracted from the technical Sprint meeting bot.",
    sources: ["Technical Sprint Meeting Assistant", "Zoom video transcript", "AI-extracted action items"]
  }
];

export const agentRuns = [
  { id: "RUN-1042", title: "Summarize roadmap meeting", status: "Completed", tool: "search_meetings", duration: "28s", owner: "Project Manager" },
  { id: "RUN-1041", title: "Find blocked tasks", status: "Completed", tool: "list_tasks", duration: "12s", owner: "General Manager" },
  { id: "RUN-1040", title: "Generate workspace status", status: "Running", tool: "get_project_status", duration: "1m 04s", owner: "Company Admin" }
];

export const agentSteps = [
  ["Authorization", "Agent, user, company, and workspace scope validated.", "Completed"],
  ["Run initialization", "AgentRun created with status Running.", "Completed"],
  ["Context assembly", "Tasks, meetings, files, and profile context loaded.", "Completed"],
  ["Intent classification", "Detected meeting summary and task extraction request.", "Completed"],
  ["MCP tool execution", "Called search_meetings and list_tasks with scoped input.", "Completed"],
  ["Step logging", "Saved tool inputs, outputs, and timing.", "Completed"],
  ["Final AI synthesis", "Created grounded answer with citations.", "Completed"],
  ["Run completion", "AgentRun status changed to Completed.", "Completed"]
];

export const employees = [
  { name: "Ahmed Alyazouri", email: "ahmed@teamoria.ai", role: "Company Admin", company: "Taqat Digital", status: "Active", projects: 8 },
  { name: "Aseel Harazeen", email: "aseel@teamoria.ai", role: "General Manager", company: "Taqat Digital", status: "Active", projects: 8 },
  { name: "Fares Namlah", email: "fares@teamoria.ai", role: "Project Manager", company: "Taqat Digital", status: "Active", projects: 3 },
  { name: "Sarah Johnson", email: "sarah@teamoria.ai", role: "Employee", company: "Taqat Digital", status: "Invited", projects: 2 }
];

export const reports = [
  ["Project Performance", "88%", "Workspaces on schedule"],
  ["Employee Productivity", "74%", "Average completion score"],
  ["Task Completion Trend", "286", "Completed this month"],
  ["AI Insight Accuracy", "94%", "Answers with cited sources"]
];

export const aiToolingMap = [
  ["LLM Completion", "llm_service.py", "OpenAI Chat Completions", "Prompt-based generation"],
  ["Embeddings", "embedding_service.py", "OpenAI Embeddings", "Text-to-vector embedding"],
  ["Vector Search", "vector_store.py", "Pinecone REST API", "Chunking and semantic search"],
  ["RAG Chat", "rag_service.py", "OpenAI + Pinecone", "Retrieval-augmented generation"],
  ["Transcription", "transcriber.py", "FFmpeg + Groq Whisper", "Audio chunking and speech recognition"],
  ["Upload Processing", "upload_processor.py", "PDF/DOCX/OCR libraries", "Classification and knowledge extraction"],
  ["Task Extraction", "task_extractor.py", "Internal Python rules", "Keyword-based extraction"],
  ["Agent System", "agent_service.py", "OpenAI + MCP tools", "Tool-oriented agent workflow"],
  ["MCP Integration", "mcp_service.py", "MCP JSON-RPC", "Dynamic tool discovery"],
  ["Workspace Graph", "workspace_graph_service.py", "SQLAlchemy + React SVG", "Graph construction"]
];

export const aiArchitectureFlows = [
  {
    title: "High-Level AI Architecture",
    summary: "Frontend requests move through the backend into upload processing, RAG chat, agent execution, and graph services.",
    nodes: ["React Frontend", "PHP Backend", "Upload Processing", "Workspace Chat", "Agent Service", "Workspace Graph"]
  },
  {
    title: "Upload Processing Algorithm",
    summary: "Files become extracted text, summaries, tasks, PostgreSQL records, and Pinecone-searchable knowledge.",
    nodes: ["Upload", "Store File", "Detect Source", "Extract Content", "Transcribe", "Clean Transcript", "Classify", "Generate Title", "Summarize", "Extract Tasks", "Store", "Index"]
  },
  {
    title: "RAG Chat Algorithm",
    summary: "Questions are answered from scoped workspace context with deterministic shortcuts and semantic search when needed.",
    nodes: ["Question", "Access Scope", "Visible Records", "Quick Check", "Search Decision", "Pinecone Search", "Security Filter", "Build Context", "Grounded LLM", "Answer"]
  },
  {
    title: "Vector Search Algorithm",
    summary: "Meeting summaries and transcripts become searchable chunks, then filtered context for grounded answers.",
    nodes: ["Meeting Content", "Summary Chunk", "Transcript Chunks", "NDJSON Records", "Pinecone Upsert", "Query", "Top-K Matches", "Permission Filter"]
  },
  {
    title: "Agent Workflow",
    summary: "Agents validate scope, build local context, execute MCP tools, log steps, and synthesize a final response.",
    nodes: ["Validate", "Create Run", "Build Context", "Determine Intent", "Execute Tools", "Store Logs", "AI Synthesis", "Complete"]
  },
  {
    title: "Transcription Algorithm",
    summary: "Audio and video files are normalized, chunked, sent to Groq Whisper, retried, merged, and cleaned.",
    nodes: ["Receive File", "Verify Provider", "FFmpeg", "Chunk Audio", "Whisper", "Retry", "Merge", "Cleanup", "Transcript"]
  },
  {
    title: "Workspace Graph Algorithm",
    summary: "The system authenticates users, builds scope, loads workspace entities, and renders relationships in SVG.",
    nodes: ["JWT Auth", "Access Scope", "Load Tasks", "Load Files", "Load Notes", "Dependencies", "Projects", "Graph Response", "React SVG"]
  }
];

export const mcpToolCatalog = [
  ["list_tasks", "Returns visible tasks filtered by project and status."],
  ["search_meetings", "Searches meeting title, summary, and transcript."],
  ["get_project_status", "Returns project information, task counts, and status distribution."],
  ["echo", "Returns provided arguments for tool execution testing."]
];

export const aiLimitations = [
  ["Task Extraction", "Currently rule-based and should move to structured LLM extraction."],
  ["Pinecone Dependency", "Vector search is skipped when Pinecone is not configured."],
  ["Missing OpenAI Key", "LLM service returns placeholder responses without a configured key."],
  ["Arabic Encoding", "Some backend files contain mojibake Arabic text and need cleanup."],
  ["Agent Routing", "Intent routing is keyword-based and should become classifier-driven."]
];

export const aiFutureImprovements = [
  "Intelligent task extraction with GPT-4o structured outputs",
  "Hybrid search across vector search, SQL search, and metadata filters",
  "Graph database integration with Neo4j or Memgraph",
  "Persistent agent memory per user, workspace, and agent",
  "Multi-agent collaboration for PM, meeting, risk, and scheduling assistants",
  "Advanced RAG with query rewriting, re-ranking, citations, and validation"
];
