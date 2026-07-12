export const appCopy = {
  ar: {
    brandTagline: "نظام تشغيل الفريق",
    skip: "تجاوز إلى المحتوى",
    workspace: "مساحة الشركة",
    search: "ابحث عن صفحة أو إجراء",
    searchHint: "بحث",
    openMenu: "فتح قائمة التنقل",
    closeMenu: "إغلاق قائمة التنقل",
    theme: "تبديل المظهر",
    language: "Switch to English",
    notifications: "الإشعارات",
    account: "الحساب",
    signOut: "تسجيل الخروج",
    connected: "متصل لحظيًا",
    connecting: "جارٍ الاتصال",
    offline: "التحديث اللحظي غير متاح",
    navigation: "التنقل الرئيسي",
    overview: "نظرة عامة",
    operations: "العمل",
    intelligence: "المعرفة",
    administration: "الإدارة",
    profile: "الملف الشخصي",
    dashboard: "نظرة عامة",
    projects: "المشاريع",
    tasks: "المهام",
    meetings: "الاجتماعات",
    uploads: "الملفات",
    assistant: "مساعد Teamoria",
    employees: "الفريق",
    reports: "التقارير",
    agentRuns: "عمليات الوكلاء",
    workspaceGraph: "خريطة المعرفة",
    companies: "الشركات",
    users: "المستخدمون",
    payments: "المدفوعات",
    settings: "الإعدادات",
    platform: "إدارة المنصة",
    newProject: "مشروع جديد",
    newTask: "مهمة جديدة",
    inviteMember: "دعوة عضو",
    uploadFile: "رفع ملف",
    create: "إنشاء",
    save: "حفظ",
    cancel: "إلغاء",
    retry: "إعادة المحاولة",
    loading: "جارٍ تحميل البيانات",
    noData: "لا توجد بيانات مطابقة بعد.",
    all: "الكل",
    active: "نشط",
    pending: "قيد الانتظار",
    completed: "مكتمل",
    blocked: "متوقف",
    searchResults: "نتائج البحث",
    tableView: "عرض جدولي",
    gridView: "عرض شبكي",
    filters: "عوامل التصفية",
    view: "عرض",
    details: "التفاصيل",
    status: "الحالة",
    owner: "المسؤول",
    date: "التاريخ",
    progress: "التقدّم",
    priority: "الأولوية",
    actions: "الإجراءات",
    name: "الاسم",
    email: "البريد الإلكتروني",
    role: "الدور",
    type: "النوع",
    size: "الحجم",
    updated: "آخر تحديث",
    description: "الوصف",
    title: "العنوان",
    password: "كلمة المرور",
    low: "منخفضة",
    medium: "متوسطة",
    high: "عالية",
    todo: "للبدء",
    inProgress: "قيد التنفيذ",
    done: "منجزة",
    successSave: "تم حفظ التغييرات.",
    failedLoad: "تعذر تحميل البيانات. أعد المحاولة.",
    failedSave: "تعذر حفظ التغييرات. راجع البيانات وحاول مجددًا.",
    demoData: "بيانات عرض توضيحي"
  },
  en: {
    brandTagline: "Team operating system",
    skip: "Skip to content",
    workspace: "Company workspace",
    search: "Search pages and actions",
    searchHint: "Search",
    openMenu: "Open navigation",
    closeMenu: "Close navigation",
    theme: "Switch appearance",
    language: "التبديل إلى العربية",
    notifications: "Notifications",
    account: "Account",
    signOut: "Sign out",
    connected: "Live connection",
    connecting: "Connecting",
    offline: "Realtime unavailable",
    navigation: "Primary navigation",
    overview: "Overview",
    operations: "Work",
    intelligence: "Knowledge",
    administration: "Administration",
    profile: "Profile",
    dashboard: "Overview",
    projects: "Projects",
    tasks: "Tasks",
    meetings: "Meetings",
    uploads: "Files",
    assistant: "Teamoria assistant",
    employees: "Team",
    reports: "Reports",
    agentRuns: "Agent runs",
    workspaceGraph: "Knowledge graph",
    companies: "Companies",
    users: "Users",
    payments: "Payments",
    settings: "Settings",
    platform: "Platform admin",
    newProject: "New project",
    newTask: "New task",
    inviteMember: "Invite member",
    uploadFile: "Upload file",
    create: "Create",
    save: "Save",
    cancel: "Cancel",
    retry: "Retry",
    loading: "Loading data",
    noData: "No matching data yet.",
    all: "All",
    active: "Active",
    pending: "Pending",
    completed: "Completed",
    blocked: "Blocked",
    searchResults: "Search results",
    tableView: "Table view",
    gridView: "Grid view",
    filters: "Filters",
    view: "View",
    details: "Details",
    status: "Status",
    owner: "Owner",
    date: "Date",
    progress: "Progress",
    priority: "Priority",
    actions: "Actions",
    name: "Name",
    email: "Email",
    role: "Role",
    type: "Type",
    size: "Size",
    updated: "Updated",
    description: "Description",
    title: "Title",
    password: "Password",
    low: "Low",
    medium: "Medium",
    high: "High",
    todo: "To do",
    inProgress: "In progress",
    done: "Done",
    successSave: "Changes saved.",
    failedLoad: "Could not load data. Try again.",
    failedSave: "Could not save changes. Check the details and try again.",
    demoData: "Demo data"
  }
};

export const routeMeta = {
  "/dashboard": {
    key: "dashboard",
    title: { ar: "مركز العمل", en: "Work center" },
    subtitle: { ar: "الأولويات والقرارات والإشارات التي تحتاج انتباهك اليوم.", en: "Priorities, decisions, and signals that need your attention today." }
  },
  "/projects": {
    key: "projects",
    title: { ar: "المشاريع", en: "Projects" },
    subtitle: { ar: "تابع نطاق العمل والتقدّم والمخاطر من مكان واحد.", en: "Track scope, progress, and delivery risk in one place." },
    action: "newProject"
  },
  "/owner/projects": {
    key: "projects",
    title: { ar: "المشاريع", en: "Projects" },
    subtitle: { ar: "تابع نطاق العمل والتقدّم والمخاطر من مكان واحد.", en: "Track scope, progress, and delivery risk in one place." },
    action: "newProject"
  },
  "/tasks": {
    key: "tasks",
    title: { ar: "المهام", en: "Tasks" },
    subtitle: { ar: "رتّب التنفيذ حسب الأولوية والموعد والمسؤول.", en: "Organize execution by priority, due date, and owner." },
    action: "newTask"
  },
  "/meetings": {
    key: "meetings",
    title: { ar: "الاجتماعات", en: "Meetings" },
    subtitle: { ar: "حوّل النقاشات إلى قرارات ومهام قابلة للتتبع.", en: "Turn conversations into traceable decisions and tasks." }
  },
  "/workspace": {
    key: "workspace",
    title: { ar: "مساحة العمل", en: "Workspace" },
    subtitle: { ar: "نظرة موحّدة على سياق المشروع وأعضائه وملفاته.", en: "A unified view of project context, people, and files." }
  },
  "/uploads": {
    key: "uploads",
    title: { ar: "مركز الملفات", en: "File center" },
    subtitle: { ar: "ارفع المعرفة وراقب معالجتها وصلاحياتها.", en: "Upload knowledge and track processing and access." },
    action: "uploadFile"
  },
  "/owner/uploads": {
    key: "uploads",
    title: { ar: "مركز الملفات", en: "File center" },
    subtitle: { ar: "ارفع المعرفة وراقب معالجتها وصلاحياتها.", en: "Upload knowledge and track processing and access." },
    action: "uploadFile"
  },
  "/owner/uploads/files": {
    key: "uploads",
    title: { ar: "الملفات المرفوعة", en: "Uploaded files" },
    subtitle: { ar: "كل الملفات التي أضيفت إلى معرفة الشركة.", en: "Every file added to company knowledge." },
    action: "uploadFile"
  },
  "/agent-runs": {
    key: "agentRuns",
    title: { ar: "عمليات الوكلاء", en: "Agent runs" },
    subtitle: { ar: "راجع ما نفّذه المساعد ومصادره وحالته.", en: "Review assistant work, sources, and run status." }
  },
  "/agent-run-details": {
    key: "agentDetails",
    title: { ar: "تفاصيل العملية", en: "Run details" },
    subtitle: { ar: "تسلسل واضح من المصدر إلى النتيجة.", en: "A clear trace from source to result." }
  },
  "/ai-chat": {
    key: "assistant",
    title: { ar: "مساعد Teamoria", en: "Teamoria assistant" },
    subtitle: { ar: "أسئلة مرتبطة بسياق العمل ومصادره.", en: "Questions grounded in work context and sources." }
  },
  "/workspace-graph": {
    key: "workspaceGraph",
    title: { ar: "خريطة المعرفة", en: "Knowledge graph" },
    subtitle: { ar: "اكتشف الروابط بين الأشخاص والملفات والقرارات.", en: "Explore links between people, files, and decisions." }
  },
  "/employees": {
    key: "employees",
    title: { ar: "الفريق والصلاحيات", en: "Team and access" },
    subtitle: { ar: "أدر الأعضاء والأدوار والوصول إلى مساحة الشركة.", en: "Manage members, roles, and company access." },
    action: "inviteMember"
  },
  "/team-performance": {
    key: "reports",
    title: { ar: "أداء الفريق", en: "Team performance" },
    subtitle: { ar: "مؤشرات قابلة للمراجعة عن التدفق والإنجاز والحمل.", en: "Reviewable signals for flow, delivery, and workload." }
  },
  "/owner/team-performance": {
    key: "reports",
    title: { ar: "أداء الفريق", en: "Team performance" },
    subtitle: { ar: "مؤشرات قابلة للمراجعة عن التدفق والإنجاز والحمل.", en: "Reviewable signals for flow, delivery, and workload." }
  },
  "/reports": {
    key: "reports",
    title: { ar: "التقارير", en: "Reports" },
    subtitle: { ar: "ملخصات تنفيذية يمكن تصديرها ومشاركتها.", en: "Executive summaries ready to export and share." }
  },
  "/notifications": {
    key: "notifications",
    title: { ar: "الإشعارات", en: "Notifications" },
    subtitle: { ar: "التحديثات التي تغيّر أولويات عملك.", en: "Updates that change your work priorities." }
  },
  "/profile": {
    key: "profile",
    title: { ar: "الملف الشخصي", en: "Profile" },
    subtitle: { ar: "بيانات الحساب وتفضيلات العرض.", en: "Account details and display preferences." }
  },
  "/super-admin": {
    key: "platform",
    title: { ar: "حالة المنصة", en: "Platform health" },
    subtitle: { ar: "الشركات والمستخدمون والمدفوعات في صورة تشغيلية واحدة.", en: "Companies, users, and billing in one operational view." }
  },
  "/super-admin/companies": {
    key: "companies",
    title: { ar: "الشركات", en: "Companies" },
    subtitle: { ar: "إدارة المستأجرين وحالتهم وملفاتهم الأساسية.", en: "Manage tenants, status, and core company profiles." }
  },
  "/super-admin/users": {
    key: "users",
    title: { ar: "المستخدمون", en: "Users" },
    subtitle: { ar: "إدارة الحسابات والأدوار وحالة الوصول.", en: "Manage accounts, roles, and access state." }
  },
  "/super-admin/payments": {
    key: "payments",
    title: { ar: "المدفوعات", en: "Payments" },
    subtitle: { ar: "مراجعة الاشتراكات والتحويلات المعلّقة.", en: "Review subscriptions and pending transfers." }
  },
  "/super-admin/notifications": {
    key: "notifications",
    title: { ar: "إشعارات المنصة", en: "Platform notifications" },
    subtitle: { ar: "أحداث التشغيل والتنبيهات الإدارية.", en: "Operational events and administrator alerts." }
  },
  "/super-admin/profile": {
    key: "profile",
    title: { ar: "الملف الشخصي", en: "Profile" },
    subtitle: { ar: "بيانات حساب مدير المنصة وتفضيلاته.", en: "Platform administrator details and preferences." }
  }
};

export const demoRows = {
  projects: [
    { id: "p-1", name: "إطلاق بوابة العملاء", nameEn: "Client portal launch", owner: "ليان خالد", ownerEn: "Layan Khaled", status: "in_progress", progress: 72, updated_at: "2026-07-10" },
    { id: "p-2", name: "ترحيل قاعدة المعرفة", nameEn: "Knowledge migration", owner: "محمد عادل", ownerEn: "Mohammed Adel", status: "active", progress: 48, updated_at: "2026-07-09" },
    { id: "p-3", name: "تجربة الموظف الجديدة", nameEn: "Employee experience", owner: "نور سمير", ownerEn: "Noor Samir", status: "blocked", progress: 31, updated_at: "2026-07-08" },
    { id: "p-4", name: "تقارير الربع الثالث", nameEn: "Q3 reporting", owner: "فريق العمليات", ownerEn: "Operations", status: "completed", progress: 100, updated_at: "2026-07-07" }
  ],
  tasks: [
    { id: "t-1", title: "اعتماد نطاق الإصدار", titleEn: "Approve release scope", owner: "أحمد", ownerEn: "Ahmed", status: "in_progress", priority: "high", due_date: "2026-07-12", progress: 65 },
    { id: "t-2", title: "مراجعة صلاحيات الملفات", titleEn: "Review file permissions", owner: "سارة", ownerEn: "Sarah", status: "todo", priority: "medium", due_date: "2026-07-13", progress: 10 },
    { id: "t-3", title: "تلخيص اجتماع المنتج", titleEn: "Summarize product meeting", owner: "مساعد Teamoria", ownerEn: "Teamoria assistant", status: "completed", priority: "low", due_date: "2026-07-11", progress: 100 },
    { id: "t-4", title: "حل تعارض واجهة الدفع", titleEn: "Resolve billing UI conflict", owner: "رامي", ownerEn: "Rami", status: "blocked", priority: "high", due_date: "2026-07-11", progress: 35 }
  ],
  meetings: [
    { id: "m-1", title: "مراجعة التسليم الأسبوعي", titleEn: "Weekly delivery review", owner: "فريق المنتج", ownerEn: "Product team", status: "active", date: "2026-07-12 10:00", decisions: 3 },
    { id: "m-2", title: "مزامنة التصميم والهندسة", titleEn: "Design and engineering sync", owner: "مساحة البوابة", ownerEn: "Portal workspace", status: "completed", date: "2026-07-10 14:30", decisions: 5 },
    { id: "m-3", title: "تخطيط الربع الثالث", titleEn: "Q3 planning", owner: "الإدارة", ownerEn: "Leadership", status: "pending", date: "2026-07-14 09:00", decisions: 0 }
  ],
  uploads: [
    { id: "f-1", name: "Q3_product_roadmap.pdf", type: "PDF", size: "2.4 MB", status: "completed", updated_at: "2026-07-11" },
    { id: "f-2", name: "customer-research-notes.docx", type: "DOCX", size: "820 KB", status: "active", updated_at: "2026-07-10" },
    { id: "f-3", name: "release-budget.xlsx", type: "XLSX", size: "1.1 MB", status: "pending", updated_at: "2026-07-09" }
  ],
  employees: [
    { id: "u-1", name: "أحمد اليازوري", nameEn: "Ahmed Alyazouri", email: "ahmed@teamoria.demo", role: "company_owner", status: "active", updated_at: "2026-07-11" },
    { id: "u-2", name: "أسيل حرازين", nameEn: "Aseel Harazeen", email: "aseel@teamoria.demo", role: "company_manager", status: "active", updated_at: "2026-07-10" },
    { id: "u-3", name: "سارة جونسون", nameEn: "Sarah Johnson", email: "sarah@teamoria.demo", role: "company_member", status: "pending", updated_at: "2026-07-09" }
  ],
  companies: [
    { id: "c-1", name: "NexuTech Solutions", industry: "Enterprise software", status: "active", users_count: 48, updated_at: "2026-07-11" },
    { id: "c-2", name: "Quantum Labs", industry: "AI research", status: "active", users_count: 31, updated_at: "2026-07-10" },
    { id: "c-3", name: "Velo Analytics", industry: "Business intelligence", status: "pending", users_count: 12, updated_at: "2026-07-08" }
  ],
  users: [
    { id: "au-1", name: "Super Admin", email: "superadmin@teamoria.demo", role: "admin", status: "active", updated_at: "2026-07-11" },
    { id: "au-2", name: "Ahmed Alyazouri", email: "admin@teamoria.demo", role: "company_owner", status: "active", updated_at: "2026-07-10" },
    { id: "au-3", name: "Sarah Johnson", email: "member@teamoria.demo", role: "company_member", status: "pending", updated_at: "2026-07-09" }
  ],
  payments: [
    { id: "pay-1", name: "NexuTech Solutions", plan: "Scale", amount: "$249", status: "completed", updated_at: "2026-07-10" },
    { id: "pay-2", name: "Quantum Labs", plan: "Team", amount: "$99", status: "pending", updated_at: "2026-07-09" },
    { id: "pay-3", name: "Velo Analytics", plan: "Team", amount: "$99", status: "active", updated_at: "2026-07-08" }
  ],
  notifications: [
    { id: "n-1", title: "اكتملت معالجة خارطة المنتج", titleEn: "Product roadmap processing completed", type: "file", status: "active", updated_at: "2026-07-11T10:20:00Z" },
    { id: "n-2", title: "تحتاج مهمة اعتماد النطاق إلى قرار", titleEn: "Release scope needs a decision", type: "task", status: "pending", updated_at: "2026-07-11T08:15:00Z" },
    { id: "n-3", title: "انضم عضو جديد إلى مساحة الشركة", titleEn: "A new member joined the company", type: "member", status: "completed", updated_at: "2026-07-10T16:45:00Z" }
  ],
  agentRuns: [
    { id: "r-1", title: "تلخيص ملفات الإصدار", titleEn: "Summarize release files", owner: "مساعد Teamoria", ownerEn: "Teamoria assistant", status: "completed", progress: 100, updated_at: "2026-07-11" },
    { id: "r-2", title: "استخراج قرارات الاجتماع", titleEn: "Extract meeting decisions", owner: "مساعد Teamoria", ownerEn: "Teamoria assistant", status: "active", progress: 68, updated_at: "2026-07-11" },
    { id: "r-3", title: "تحليل مخاطر المشروع", titleEn: "Analyze project risk", owner: "مساعد Teamoria", ownerEn: "Teamoria assistant", status: "pending", progress: 15, updated_at: "2026-07-10" }
  ]
};

export function textFor(language, value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[language] || value.en || value.ar || "";
}

export function rowName(row, language) {
  return language === "ar"
    ? row.title || row.name || row.label || row.file_name || "—"
    : row.titleEn || row.nameEn || row.title || row.name || row.label || row.file_name || "—";
}

export function ownerName(row, language) {
  const owner = row.owner || row.assignee?.name || row.created_by?.name || row.user?.name || "—";
  return language === "ar" ? owner : row.ownerEn || owner;
}

export function statusKey(value = "") {
  const normalized = String(value).toLowerCase().replace(/[\s-]+/g, "_");
  if (["done", "complete", "completed", "success", "processed", "confirmed"].includes(normalized)) return "completed";
  if (["in_progress", "processing", "running", "connected"].includes(normalized)) return "active";
  if (["blocked", "failed", "error", "suspended", "cancelled"].includes(normalized)) return "blocked";
  if (["todo", "pending", "queued", "draft", "invited"].includes(normalized)) return "pending";
  return normalized || "active";
}

export function localizedStatus(copy, value) {
  const key = statusKey(value);
  return copy[key] || value || copy.active;
}

export function formatDate(value, language, options = {}) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en-US", {
    day: "numeric",
    month: "short",
    year: options.year === false ? undefined : "numeric",
    ...options
  }).format(date);
}
