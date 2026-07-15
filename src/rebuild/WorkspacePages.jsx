import { useEffect, useMemo, useState } from "react";
import {
  FiActivity,
  FiAlertTriangle,
  FiArrowLeft,
  FiArrowRight,
  FiBarChart2,
  FiBell,
  FiBookOpen,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiCloud,
  FiDownload,
  FiFile,
  FiFileText,
  FiFilter,
  FiFolder,
  FiGlobe,
  FiGrid,
  FiInbox,
  FiLayers,
  FiList,
  FiLock,
  FiMail,
  FiMessageSquare,
  FiMoreHorizontal,
  FiPaperclip,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiSend,
  FiSettings,
  FiShield,
  FiSliders,
  FiTrendingUp,
  FiUser,
  FiUsers,
  FiZap
} from "react-icons/fi";
import { useAuth } from "../lib/AuthContext.jsx";
import {
  extractRows,
  getAdminDashboard,
  getCompanyDashboard,
  getPayloadData,
  listCompanyProjects,
  listStaff,
  listTasks,
  listUploads,
  listAdminPayments,
  listChatSessionMessages,
  listChatSessions,
  listCompanies,
  listNotifications,
  listUsers,
  sendChatMessage,
  updateProfile
} from "../lib/api.js";
import { isDemoMode } from "../lib/demoMode.js";
import { usePreferences } from "../lib/PreferencesContext.jsx";
import ProjectsResourcePage from "./pages/ProjectsResourcePage.jsx";
import TasksResourcePage from "./pages/TasksResourcePage.jsx";
import EmployeesResourcePage from "./pages/EmployeesResourcePage.jsx";
import UploadsResourcePage from "./pages/UploadsResourcePage.jsx";
import NotificationsResourcePage from "./pages/NotificationsResourcePage.jsx";
import AiChatResourcePage from "./pages/AiChatResourcePage.jsx";
import {
  appCopy,
  demoRows,
  formatDate,
  ownerName,
  routeMeta,
  rowName,
  statusKey,
  textFor
} from "./appData.js";
import {
  AddButton,
  Button,
  EmptyState,
  ErrorState,
  Field,
  IconButton,
  LoadingState,
  Metric,
  Modal,
  PageHeader,
  Panel,
  Progress,
  SectionHeader,
  SelectControl,
  SkeletonTable,
  StatusBadge
} from "./ui.jsx";

const pageCopy = {
  ar: {
    focus: "تركيز اليوم",
    focusTitle: "قرارات تحتاج سياقًا قبل التنفيذ",
    focusText: "جمّع Teamoria نشاط المهام والملفات والاجتماعات في قائمة قصيرة قابلة للمراجعة.",
    review: "مراجعة القرارات",
    activeProjects: "مشاريع نشطة",
    dueTasks: "مهام ذات أولوية",
    knowledgeFiles: "ملفات معرفة",
    teamMembers: "أعضاء الفريق",
    openDecisions: "قرارات مفتوحة",
    workspaceHealth: "صحة مساحة العمل",
    priorities: "الأولويات الحالية",
    prioritiesText: "العمل الذي يحتاج قرارًا أو متابعة اليوم.",
    decisionQueue: "قائمة القرارات",
    decisionQueueText: "كل إشارة مرتبطة بدليل وإجراء مقترح.",
    activity: "آخر النشاط",
    activityText: "تحديثات مساحة العمل بالترتيب الزمني.",
    source: "مصدر",
    analysis: "تحليل",
    decision: "قرار",
    action: "إجراء",
    traceTitle: "مسار قرار اليوم",
    traceText: "تأخر إصدار البوابة مرتبط بمهمتين متوقفتين وملف مواصفات لم يُراجع بعد.",
    reviewFiles: "مراجعة الملفات",
    assignOwner: "تعيين مسؤول",
    openTask: "فتح المهمة",
    riskScope: "اعتماد نطاق الإصدار",
    riskScopeText: "ينتظر موافقة المالك قبل تثبيت موعد التسليم.",
    fileReady: "اكتملت معالجة خارطة المنتج",
    fileReadyText: "أصبح الملف متاحًا للبحث والاستشهاد.",
    accessReview: "مراجعة صلاحيات الملفات",
    accessReviewText: "عضوان ينتظران الوصول إلى مجلد المشروع.",
    justNow: "قبل قليل",
    twoHours: "قبل ساعتين",
    yesterday: "أمس",
    records: "سجل",
    clearFilters: "مسح التصفية",
    createTitle: "إنشاء عنصر جديد",
    createDescription: "أضف المعلومات الأساسية، ويمكن استكمال التفاصيل لاحقًا.",
    fileDrop: "اختر ملفًا من جهازك",
    fileDropHint: "PDF أو DOCX أو XLSX بحد أقصى يحدده الخادم.",
    saved: "تمت إضافة العنصر إلى مساحة العمل.",
    detailTitle: "تفاصيل العنصر",
    sources: "المصادر",
    assistantWelcome: "اسأل عن عمل شركتك",
    assistantIntro: "يمكنني تلخيص الملفات وربط القرارات بالمهام مع إظهار المصادر المستخدمة.",
    newChat: "محادثة جديدة",
    conversations: "المحادثات",
    messagePlaceholder: "اكتب سؤالًا عن المشاريع أو الملفات…",
    send: "إرسال",
    assistantThinking: "جارٍ تجهيز الإجابة",
    chatError: "تعذر إرسال الرسالة. أعد المحاولة.",
    noConversations: "لا توجد محادثات بعد.",
    accountDetails: "بيانات الحساب",
    accountDetailsText: "المعلومات المستخدمة داخل مساحة الشركة.",
    preferences: "تفضيلات العرض",
    preferencesText: "اللغة والثيم محفوظان على هذا الجهاز.",
    security: "الوصول والأمان",
    securityText: "حالة الحساب والدور المرتبط به.",
    fullName: "الاسم الكامل",
    light: "فاتح",
    dark: "داكن",
    system: "النظام",
    arabic: "العربية",
    english: "English",
    roleReadonly: "يُدار الدور من صلاحيات الشركة.",
    profileSaved: "تم تحديث الملف الشخصي.",
    graphTitle: "العلاقات النشطة في مساحة العمل",
    graphText: "تُظهر الخريطة روابط الأشخاص والملفات والمهام والقرارات.",
    runTimeline: "تسلسل العملية",
    reportSummary: "ملخص الأداء",
    noSource: "لا توجد مصادر مرتبطة بعد."
  },
  en: {
    focus: "Today’s focus",
    focusTitle: "Decisions that need context before action",
    focusText: "Teamoria condensed task, file, and meeting activity into a short reviewable queue.",
    review: "Review decisions",
    activeProjects: "Active projects",
    dueTasks: "Priority tasks",
    knowledgeFiles: "Knowledge files",
    teamMembers: "Team members",
    openDecisions: "Open decisions",
    workspaceHealth: "Workspace health",
    priorities: "Current priorities",
    prioritiesText: "Work that needs a decision or follow-up today.",
    decisionQueue: "Decision queue",
    decisionQueueText: "Every signal is tied to evidence and a proposed action.",
    activity: "Recent activity",
    activityText: "Workspace updates in chronological order.",
    source: "Source",
    analysis: "Analysis",
    decision: "Decision",
    action: "Action",
    traceTitle: "Today’s decision trace",
    traceText: "The portal release delay connects to two blocked tasks and an unreviewed specification file.",
    reviewFiles: "Review files",
    assignOwner: "Assign owner",
    openTask: "Open task",
    riskScope: "Approve release scope",
    riskScopeText: "Waiting for owner approval before the delivery date is locked.",
    fileReady: "Product roadmap processing completed",
    fileReadyText: "The file is now searchable and ready for citations.",
    accessReview: "Review file permissions",
    accessReviewText: "Two members are waiting for access to the project folder.",
    justNow: "Just now",
    twoHours: "2 hours ago",
    yesterday: "Yesterday",
    records: "records",
    clearFilters: "Clear filters",
    createTitle: "Create a new item",
    createDescription: "Add the essentials now. More detail can be added later.",
    fileDrop: "Choose a file from your device",
    fileDropHint: "PDF, DOCX, or XLSX within the server file limit.",
    saved: "The item was added to the workspace.",
    detailTitle: "Item details",
    sources: "Sources",
    assistantWelcome: "Ask about company work",
    assistantIntro: "I can summarize files and connect decisions to tasks while showing the sources I used.",
    newChat: "New chat",
    conversations: "Conversations",
    messagePlaceholder: "Ask about projects or files…",
    send: "Send",
    assistantThinking: "Preparing an answer",
    chatError: "Could not send the message. Try again.",
    noConversations: "No conversations yet.",
    accountDetails: "Account details",
    accountDetailsText: "Information used across your company workspace.",
    preferences: "Display preferences",
    preferencesText: "Language and appearance are stored on this device.",
    security: "Access and security",
    securityText: "Account state and assigned role.",
    fullName: "Full name",
    light: "Light",
    dark: "Dark",
    system: "System",
    arabic: "العربية",
    english: "English",
    roleReadonly: "Your role is managed through company permissions.",
    profileSaved: "Profile updated.",
    graphTitle: "Active workspace relationships",
    graphText: "The graph shows links across people, files, tasks, and decisions.",
    runTimeline: "Run timeline",
    reportSummary: "Performance summary",
    noSource: "No sources are linked yet."
  }
};

const dataKeys = {
  companies: ["companies"],
  users: ["users"],
  payments: ["payments", "subscriptions"]
};

const roleDashboardCopy = {
  ar: {
    ownerTitle: "مركز قيادة الشركة",
    ownerSubtitle: "نظرة تنفيذية على المشاريع والمهام والفريق والملفات ضمن صلاحيات الشركة.",
    managerTitle: "لوحة إدارة التنفيذ",
    managerSubtitle: "المشاريع والمهام والملفات التي يستطيع المدير الوصول إليها من واجهات العمل الحالية.",
    memberTitle: "مساحة عملي",
    memberSubtitle: "مهامك ومواعيدك وملفاتك المتاحة بدون عرض تحليلات الشركة العامة.",
    fallbackTitle: "لوحة العمل",
    fallbackSubtitle: "لم نتمكن من تحديد دورك بدقة. يتم عرض مؤشراتك المسموح بها فقط.",
    loadingOwner: "جاري تحميل مؤشرات الشركة...",
    loadingManager: "جاري تحميل نطاق الإدارة...",
    loadingMember: "جاري تحميل مساحة عملك...",
    retry: "إعادة المحاولة",
    totalProjects: "إجمالي المشاريع",
    accessibleProjects: "المشاريع المتاحة",
    myProjects: "مشاريعي",
    totalTasks: "إجمالي المهام",
    accessibleTasks: "مهام النطاق",
    myTasks: "مهامي",
    totalEmployees: "إجمالي الموظفين",
    uploadedFiles: "الملفات",
    overdueTasks: "مهام متأخرة",
    upcomingDeadlines: "مواعيد قادمة",
    active: "نشط",
    done: "منجز",
    files: "ملفات",
    recentProjects: "المشاريع الحديثة",
    managedProjects: "مشاريع يمكن إدارتها",
    myProjectList: "المشاريع المرتبطة بمهامي",
    recentMeetings: "الاجتماعات الحديثة",
    overdueTaskList: "المهام المتأخرة",
    myTaskList: "مهامي الحالية",
    recentFiles: "الملفات الحديثة",
    teamActivity: "نشاط الفريق",
    notifications: "الإشعارات",
    aiInsights: "إشارات AI",
    companyHealth: "صحة الشركة",
    managerFocus: "تركيز الإدارة",
    memberFocus: "ما الذي أحتاج إنجازه؟",
    noData: "لا توجد بيانات متاحة بعد.",
    noTasks: "لا توجد مهام ضمن هذا النطاق.",
    noProjects: "لا توجد مشاريع ضمن هذا النطاق.",
    noFiles: "لا توجد ملفات متاحة.",
    noNotifications: "لا توجد إشعارات حديثة.",
    viewTasks: "فتح المهام",
    viewProjects: "فتح المشاريع",
    viewFiles: "فتح الملفات",
    sourceNoteOwner: "يعتمد العرض على واجهة ملخص الشركة وواجهات المشاريع والمهام والموظفين والملفات.",
    sourceNoteScoped: "لا يتم توسيع الصلاحيات من الواجهة؛ النتائج تأتي من استجابة backend للدور الحالي.",
    backendLimit: "لا توجد واجهة Dashboard منفصلة لكل دور حاليًا؛ لذلك يتم تركيب لوحة المدير والعضو من واجهات المشاريع والمهام والملفات والإشعارات المسموح بها.",
    status: "الحالة",
    due: "الموعد",
    updated: "آخر تحديث"
  },
  en: {
    ownerTitle: "Company Command Center",
    ownerSubtitle: "Executive view of company projects, tasks, team, files, and notifications within company permissions.",
    managerTitle: "Execution Management",
    managerSubtitle: "Projects, tasks, files, and notifications available to this manager through the current APIs.",
    memberTitle: "My Work",
    memberSubtitle: "Your tasks, upcoming deadlines, projects, files, and notifications without company-wide analytics.",
    fallbackTitle: "Work Dashboard",
    fallbackSubtitle: "Your role could not be mapped exactly, so only permitted workspace signals are shown.",
    loadingOwner: "Loading company signals...",
    loadingManager: "Loading management scope...",
    loadingMember: "Loading your workspace...",
    retry: "Retry",
    totalProjects: "Total Projects",
    accessibleProjects: "Accessible Projects",
    myProjects: "My Projects",
    totalTasks: "Total Tasks",
    accessibleTasks: "Scoped Tasks",
    myTasks: "My Tasks",
    totalEmployees: "Total Employees",
    uploadedFiles: "Uploaded Files",
    overdueTasks: "Overdue Tasks",
    upcomingDeadlines: "Upcoming Deadlines",
    active: "active",
    done: "done",
    files: "files",
    recentProjects: "Recent Projects",
    managedProjects: "Managed Projects",
    myProjectList: "Projects From My Tasks",
    recentMeetings: "Recent Meetings",
    overdueTaskList: "Overdue Tasks",
    myTaskList: "My Current Tasks",
    recentFiles: "Recent Files",
    teamActivity: "Team Activity",
    notifications: "Notifications",
    aiInsights: "AI Insights",
    companyHealth: "Company Health",
    managerFocus: "Management Focus",
    memberFocus: "What needs my attention?",
    noData: "No data is available yet.",
    noTasks: "No tasks are available in this scope.",
    noProjects: "No projects are available in this scope.",
    noFiles: "No files are available.",
    noNotifications: "No recent notifications.",
    viewTasks: "Open tasks",
    viewProjects: "Open projects",
    viewFiles: "Open files",
    sourceNoteOwner: "This view uses the company dashboard plus project, task, staff, file, and notification APIs.",
    sourceNoteScoped: "The frontend does not broaden access; results come from backend responses for the current role.",
    backendLimit: "There is no separate dashboard API per company role yet, so manager and member dashboards are composed from permitted projects, tasks, uploads, and notifications.",
    status: "Status",
    due: "Due",
    updated: "Updated"
  }
};

function dataFallback(key) {
  if (demoRows[key]) return demoRows[key];
  if (key === "meetings") return demoRows.meetings;
  if (key === "agentDetails") return demoRows.agentRuns.slice(0, 1);
  if (key === "workspace") return demoRows.projects.slice(0, 3);
  if (key === "reports") return demoRows.projects;
  return [];
}

async function loadRows(key, role) {
  if (key === "companies") return listCompanies();
  if (key === "users") return listUsers();
  if (key === "payments") return listAdminPayments();
  return null;
}

function normalizeRows(key, payload) {
  const data = getPayloadData(payload);
  return extractRows(data, dataKeys[key] || []);
}

function usePageRows(key, role) {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    const fallback = dataFallback(key);
    if (isDemoMode() || !dataKeys[key]) {
      setRows(fallback);
      setStatus("ready");
      setError("");
      return () => { active = false; };
    }

    setStatus("loading");
    setError("");
    loadRows(key, role)
      .then((payload) => {
        if (!active) return;
        setRows(normalizeRows(key, payload));
        setStatus("ready");
      })
      .catch((requestError) => {
        if (!active) return;
        setRows([]);
        setError(requestError?.message || "load_failed");
        setStatus("error");
      });

    return () => { active = false; };
  }, [key, revision, role]);

  return {
    rows,
    setRows,
    status,
    error,
    reload: () => setRevision((value) => value + 1)
  };
}

export function DashboardPage({ admin = false }) {
  const { user, normalizedRole } = useAuth();
  const { language } = usePreferences();
  const copy = appCopy[language] || appCopy.en;
  const local = pageCopy[language] || pageCopy.en;
  const roleCopy = roleDashboardCopy[language] || roleDashboardCopy.en;
  const company = user?.company?.name || user?.company_name || copy.workspace;

  if (admin) return <AdminDashboardContent company={company} copy={copy} language={language} local={local} />;

  if (normalizedRole === "company_owner") {
    return <RoleDashboardShell company={company} copy={copy} language={language} loadingLabel={roleCopy.loadingOwner} role="owner" roleCopy={roleCopy} />;
  }

  if (normalizedRole === "company_manager") {
    return <RoleDashboardShell company={company} copy={copy} language={language} loadingLabel={roleCopy.loadingManager} role="manager" roleCopy={roleCopy} />;
  }

  if (normalizedRole === "company_member") {
    return <RoleDashboardShell company={company} copy={copy} language={language} loadingLabel={roleCopy.loadingMember} role="member" roleCopy={roleCopy} />;
  }

  return <RoleDashboardShell company={company} copy={copy} language={language} loadingLabel={roleCopy.loadingMember} role="fallback" roleCopy={roleCopy} />;
}

function AdminDashboardContent({ company, copy, language, local }) {
  const [apiState, setApiState] = useState({ loading: !isDemoMode(), error: "", data: null });

  useEffect(() => {
    if (isDemoMode()) {
      setApiState({ loading: false, error: "", data: null });
      return;
    }
    let active = true;
    setApiState({ loading: true, error: "", data: null });
    getAdminDashboard()
      .then((payload) => active && setApiState({ loading: false, error: "", data: getPayloadData(payload) }))
      .catch((error) => active && setApiState({ loading: false, error: error?.message || copy.failedLoad, data: null }));
    return () => { active = false; };
  }, [copy.failedLoad]);

  const metrics = [
    [FiBriefcase, local.activeProjects, apiState.data?.companies_count ?? demoRows.companies.length, "+1", "primary", 78],
    [FiUsers, copy.users, apiState.data?.users_count ?? demoRows.users.length, "+8%", "teal", 64],
    [FiClock, copy.pending, apiState.data?.pending_payments_count ?? 1, copy.payments, "amber", 32],
    [FiShield, local.workspaceHealth, "99.9%", copy.active, "success", 99]
  ];

  return (
    <div className="t2-page">
      <PageHeader
        eyebrow={copy.platform}
        title={textFor(language, routeMeta["/super-admin"].title)}
        subtitle={textFor(language, routeMeta["/super-admin"].subtitle)}
        action={<Button icon={FiCheckCircle} onClick={() => { window.location.hash = "/super-admin/companies"; }}>{local.review}</Button>}
      />

      {apiState.error ? <div className="t2-inline-alert" role="status"><FiAlertTriangle /><span>{copy.failedLoad}</span></div> : null}

      <section className="t2-focus-band">
        <div>
          <span className="t2-eyebrow">{local.focus}</span>
          <h2>{local.focusTitle}</h2>
          <p>{local.focusText}</p>
        </div>
        <div className="t2-focus-band__signal">
          <span>03</span>
          <small>{local.openDecisions}</small>
        </div>
      </section>

      <section className="t2-metric-grid" aria-label={language === "ar" ? "مؤشرات مساحة العمل" : "Workspace metrics"}>
        {apiState.loading ? Array.from({ length: 4 }).map((_, index) => <div className="t2-metric t2-metric--skeleton" key={index} />) : metrics.map(([Icon, label, value, detail, tone, progress]) => (
          <Metric detail={detail} icon={Icon} key={label} label={label} progress={progress} tone={tone} value={value} />
        ))}
      </section>

      <div className="t2-dashboard-grid">
        <Panel className="t2-priority-panel">
          <SectionHeader title={local.priorities} description={local.prioritiesText} action={<a className="t2-inline-link" href="#/tasks">{copy.view}</a>} />
          <div className="t2-priority-list">
            {demoRows.tasks.slice(0, 4).map((task) => (
              <article key={task.id}>
                <button aria-label={`${copy.view}: ${rowName(task, language)}`} onClick={() => { window.location.hash = "/tasks"; }} type="button">
                  <span className={`t2-priority-dot t2-priority-dot--${task.priority}`} />
                  <span>
                    <b>{rowName(task, language)}</b>
                    <small>{ownerName(task, language)} · {formatDate(task.due_date, language)}</small>
                  </span>
                  <StatusBadge value={task.status} />
                  <span className="t2-priority-progress"><Progress label={`${copy.progress}: ${task.progress}%`} value={task.progress} /><small>{task.progress}%</small></span>
                </button>
              </article>
            ))}
          </div>
        </Panel>

        <Panel className="t2-decision-panel">
          <SectionHeader title={local.decisionQueue} description={local.decisionQueueText} />
          <DecisionItem action={local.openTask} icon={FiAlertTriangle} text={local.riskScopeText} time={local.justNow} title={local.riskScope} tone="amber" />
          <DecisionItem action={local.reviewFiles} icon={FiFileText} text={local.fileReadyText} time={local.twoHours} title={local.fileReady} tone="teal" />
          <DecisionItem action={local.assignOwner} icon={FiLock} text={local.accessReviewText} time={local.yesterday} title={local.accessReview} tone="blue" />
        </Panel>

        <Panel className="t2-trace-panel">
          <SectionHeader title={local.traceTitle} description={local.traceText} />
          <div className="t2-trace-rail">
            {[
              [FiFileText, local.source, "Q3_product_roadmap.pdf"],
              [FiZap, local.analysis, language === "ar" ? "تعارض موعدَين" : "Two date conflicts"],
              [FiCheckCircle, local.decision, language === "ar" ? "اعتماد النطاق" : "Approve scope"],
              [FiBriefcase, local.action, language === "ar" ? "تحديث خطة التسليم" : "Update delivery plan"]
            ].map(([Icon, label, value], index) => (
              <article key={label}>
                <span><Icon aria-hidden="true" /></span>
                <div><small>0{index + 1} · {label}</small><b>{value}</b></div>
              </article>
            ))}
          </div>
        </Panel>

        <Panel className="t2-activity-panel">
          <SectionHeader title={local.activity} description={local.activityText} />
          <ol className="t2-activity-list">
            {demoRows.notifications.map((item, index) => (
              <li key={item.id}>
                <span aria-hidden="true"><FiActivity /></span>
                <div><b>{rowName(item, language)}</b><small>{index === 0 ? local.justNow : index === 1 ? local.twoHours : local.yesterday}</small></div>
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </div>
  );
}

function RoleDashboardShell({ company, copy, language, loadingLabel, role, roleCopy }) {
  const dashboard = useRoleDashboardData(role);
  const model = useMemo(() => buildRoleDashboardModel(role, dashboard.data, roleCopy, language), [dashboard.data, language, role, roleCopy]);
  const title = role === "owner" ? roleCopy.ownerTitle : role === "manager" ? roleCopy.managerTitle : role === "member" ? roleCopy.memberTitle : roleCopy.fallbackTitle;
  const subtitle = role === "owner" ? roleCopy.ownerSubtitle : role === "manager" ? roleCopy.managerSubtitle : role === "member" ? roleCopy.memberSubtitle : roleCopy.fallbackSubtitle;
  const primaryAction = role === "owner" ? "#/owner/projects" : role === "manager" ? "#/projects" : "#/tasks";

  return (
    <div className="t2-page">
      <PageHeader
        eyebrow={company}
        title={title}
        subtitle={subtitle}
        action={<Button icon={role === "member" ? FiCheckCircle : FiBriefcase} onClick={() => { window.location.hash = primaryAction; }}>{role === "member" ? roleCopy.viewTasks : roleCopy.viewProjects}</Button>}
      />

      {dashboard.status === "loading" ? <Panel><LoadingState label={loadingLabel} /></Panel> : null}
      {dashboard.status === "error" ? <Panel><ErrorState onRetry={dashboard.reload} retryLabel={roleCopy.retry} title={dashboard.error || copy.failedLoad} /></Panel> : null}
      {dashboard.status === "ready" && model.metrics.length === 0 ? <Panel><EmptyState title={roleCopy.noData} /></Panel> : null}

      {dashboard.status === "ready" ? (
        <>
          <section className="t2-focus-band">
            <div>
              <span className="t2-eyebrow">{model.focusEyebrow}</span>
              <h2>{model.focusTitle}</h2>
              <p>{model.focusText}</p>
            </div>
            <div className="t2-focus-band__signal">
              <span>{model.focusCount}</span>
              <small>{model.focusLabel}</small>
            </div>
          </section>

          <section className="t2-metric-grid" aria-label={language === "ar" ? "مؤشرات لوحة العمل" : "Dashboard metrics"}>
            {model.metrics.map((metric) => <Metric {...metric} key={metric.label} />)}
          </section>

          <div className="t2-dashboard-grid">
            <DashboardListPanel
              actionHref={model.primaryList.href}
              actionText={model.primaryList.action}
              description={model.primaryList.description}
              emptyText={model.primaryList.empty}
              items={model.primaryList.items}
              title={model.primaryList.title}
            />
            <DashboardListPanel
              actionHref="#/tasks"
              actionText={roleCopy.viewTasks}
              description={model.taskList.description}
              emptyText={model.taskList.empty}
              items={model.taskList.items}
              title={model.taskList.title}
            />
            <DashboardListPanel
              actionHref="#/uploads"
              actionText={roleCopy.viewFiles}
              description={model.fileList.description}
              emptyText={roleCopy.noFiles}
              items={model.fileList.items}
              title={model.fileList.title}
            />
            <DashboardListPanel
              actionHref="#/notifications"
              actionText={copy.view}
              description={model.activityList.description}
              emptyText={roleCopy.noNotifications}
              items={model.activityList.items}
              title={model.activityList.title}
            />
          </div>

          <Panel className="t2-trace-panel">
            <SectionHeader title={model.insight.title} description={model.insight.description} />
            <div className="t2-trace-rail">
              {model.insight.items.map(([Icon, label, value], index) => (
                <article key={`${label}-${value}`}>
                  <span><Icon aria-hidden="true" /></span>
                  <div><small>0{index + 1} · {label}</small><b>{value}</b></div>
                </article>
              ))}
            </div>
            <p className="t2-dashboard-note">{role === "owner" ? roleCopy.sourceNoteOwner : roleCopy.sourceNoteScoped}</p>
            {role !== "owner" ? <p className="t2-dashboard-note">{roleCopy.backendLimit}</p> : null}
          </Panel>
        </>
      ) : null}
    </div>
  );
}

function DashboardListPanel({ actionHref, actionText, description, emptyText, items, title }) {
  return (
    <Panel className="t2-priority-panel">
      <SectionHeader title={title} description={description} action={actionHref ? <a className="t2-inline-link" href={actionHref}>{actionText}</a> : null} />
      {items.length ? (
        <div className="t2-priority-list">
          {items.map((item) => (
            <article key={item.id}>
              <button aria-label={item.title} onClick={() => { if (item.href) window.location.hash = item.href; }} type="button">
                <span className={`t2-priority-dot t2-priority-dot--${item.tone || "medium"}`} />
                <span>
                  <b>{item.title}</b>
                  <small>{item.meta}</small>
                </span>
                {item.status ? <StatusBadge value={item.status} /> : null}
                {typeof item.progress === "number" ? <span className="t2-priority-progress"><Progress label={`${item.title}: ${item.progress}%`} value={item.progress} /><small>{item.progress}%</small></span> : null}
              </button>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title={emptyText} />
      )}
    </Panel>
  );
}

function useRoleDashboardData(role) {
  const { normalizedRole } = useAuth();
  const [state, setState] = useState({ status: "loading", error: "", data: null });
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    setState({ status: "loading", error: "", data: null });

    loadRoleDashboardData(role, normalizedRole)
      .then((data) => {
        if (active) setState({ status: "ready", error: "", data });
      })
      .catch((error) => {
        if (active) setState({ status: "error", error: error?.message || "", data: null });
      });

    return () => { active = false; };
  }, [normalizedRole, revision, role]);

  return {
    ...state,
    reload: () => setRevision((value) => value + 1)
  };
}

async function loadRoleDashboardData(role, normalizedRole) {
  if (isDemoMode()) {
    return demoDashboardData(role);
  }

  if (role === "owner") {
    const [summaryResult, projectsResult, tasksResult, staffResult, uploadsResult, notificationsResult] = await Promise.allSettled([
      getCompanyDashboard(),
      listCompanyProjects({ page: 1 }),
      listTasks({ role: normalizedRole, per_page: 50 }),
      listStaff({ page: 1 }),
      listUploads({ per_page: 8 }),
      listNotifications({ per_page: 6 })
    ]);

    return {
      summary: unwrapDashboardSummary(summaryResult),
      projects: rowsFromSettled(projectsResult, ["projects"]),
      tasks: rowsFromSettled(tasksResult, ["tasks"]),
      staff: rowsFromSettled(staffResult, ["staff", "users", "employees"]),
      uploads: rowsFromSettled(uploadsResult, ["uploads", "files", "documents"]),
      notifications: rowsFromSettled(notificationsResult, ["notifications"])
    };
  }

  if (role === "manager") {
    const [projectsResult, tasksResult, uploadsResult, notificationsResult] = await Promise.allSettled([
      listCompanyProjects({ page: 1 }),
      listTasks({ role: normalizedRole, per_page: 50 }),
      listUploads({ per_page: 8 }),
      listNotifications({ per_page: 6 })
    ]);

    return {
      projects: rowsFromSettled(projectsResult, ["projects"]),
      tasks: rowsFromSettled(tasksResult, ["tasks"]),
      uploads: rowsFromSettled(uploadsResult, ["uploads", "files", "documents"]),
      notifications: rowsFromSettled(notificationsResult, ["notifications"])
    };
  }

  const [tasksResult, uploadsResult, notificationsResult] = await Promise.allSettled([
    listTasks({ role: normalizedRole, per_page: 50 }),
    listUploads({ per_page: 8 }),
    listNotifications({ per_page: 6 })
  ]);
  const tasks = rowsFromSettled(tasksResult, ["tasks"]);

  return {
    projects: projectsFromTasks(tasks),
    tasks,
    uploads: rowsFromSettled(uploadsResult, ["uploads", "files", "documents"]),
    notifications: rowsFromSettled(notificationsResult, ["notifications"])
  };
}

function demoDashboardData(role) {
  const tasks = role === "member" ? demoRows.tasks.slice(0, 4) : demoRows.tasks;
  return {
    summary: null,
    projects: role === "member" ? projectsFromTasks(tasks) : demoRows.projects,
    tasks,
    staff: role === "owner" ? demoRows.employees : [],
    uploads: demoRows.uploads,
    notifications: demoRows.notifications
  };
}

function unwrapDashboardSummary(result) {
  if (result.status !== "fulfilled") return null;
  const data = getPayloadData(result.value);
  return data?.dashboard || data?.company_dashboard || data?.overview || data || null;
}

function rowsFromSettled(result, keys) {
  if (result.status !== "fulfilled") return [];
  const data = getPayloadData(result.value);
  const rows = extractRows(data, keys);
  if (rows.length) return rows;
  return Array.isArray(data) ? data : [];
}

function buildRoleDashboardModel(role, data = {}, copy, language) {
  const projects = normalizeDashboardCollection(data?.projects);
  const tasks = normalizeDashboardCollection(data?.tasks);
  const uploads = normalizeDashboardCollection(data?.uploads);
  const notifications = normalizeDashboardCollection(data?.notifications);
  const staff = normalizeDashboardCollection(data?.staff);
  const overdue = tasks.filter(isDashboardTaskOverdue);
  const upcoming = tasks.filter((task) => !isDashboardTaskDone(task)).slice(0, 8);
  const completedCount = tasks.filter(isDashboardTaskDone).length;
  const projectCount = Number(data?.summary?.totals?.projects ?? projects.length);
  const taskCount = Number(data?.summary?.totals?.tasks ?? tasks.length);
  const staffCount = Number(data?.summary?.totals?.users ?? staff.length);
  const uploadCount = Number(data?.summary?.totals?.uploads ?? uploads.length);
  const activeProjects = projects.filter((project) => String(project.status || "active") === "active").length;
  const doneProgress = taskCount ? Math.round((completedCount / taskCount) * 100) : 0;

  if (role === "owner") {
    return {
      focusEyebrow: copy.companyHealth,
      focusTitle: copy.ownerTitle,
      focusText: `${copy.overdueTasks}: ${overdue.length}. ${copy.sourceNoteOwner}`,
      focusCount: formatDashboardCount(overdue.length),
      focusLabel: copy.overdueTasks,
      metrics: [
        metric(FiFolder, copy.totalProjects, projectCount, `${activeProjects} ${copy.active}`, "primary", percentFrom(projectCount, activeProjects)),
        metric(FiCheckCircle, copy.totalTasks, taskCount, `${completedCount} ${copy.done}`, "amber", doneProgress),
        metric(FiUsers, copy.totalEmployees, staffCount, copy.teamMembers || copy.totalEmployees, "success", Math.min(100, staffCount * 8)),
        metric(FiFileText, copy.uploadedFiles, uploadCount, copy.files, "teal", Math.min(100, uploadCount * 10))
      ],
      primaryList: listModel(copy.recentProjects, copy.sourceNoteOwner, copy.noProjects, copy.viewProjects, "#/owner/projects", projects.map(projectItem).slice(0, 5)),
      taskList: listModel(copy.overdueTaskList, copy.overdueTasks, copy.noTasks, copy.viewTasks, "#/tasks", overdue.map(taskItem).slice(0, 5)),
      fileList: listModel(copy.recentFiles, copy.uploadedFiles, copy.noFiles, copy.viewFiles, "#/owner/uploads/files", uploads.map(fileItem).slice(0, 5)),
      activityList: listModel(copy.teamActivity, copy.notifications, copy.noNotifications, "", "#/notifications", notifications.map(notificationItem).slice(0, 5)),
      insight: insightModel(copy.aiInsights, copy.sourceNoteOwner, [
        [FiBriefcase, copy.totalProjects, formatDashboardCount(projectCount)],
        [FiAlertTriangle, copy.overdueTasks, formatDashboardCount(overdue.length)],
        [FiFileText, copy.uploadedFiles, formatDashboardCount(uploadCount)]
      ])
    };
  }

  if (role === "manager") {
    return {
      focusEyebrow: copy.managerFocus,
      focusTitle: copy.managerTitle,
      focusText: copy.sourceNoteScoped,
      focusCount: formatDashboardCount(overdue.length),
      focusLabel: copy.overdueTasks,
      metrics: [
        metric(FiFolder, copy.accessibleProjects, projects.length, `${activeProjects} ${copy.active}`, "primary", percentFrom(projects.length, activeProjects)),
        metric(FiCheckCircle, copy.accessibleTasks, tasks.length, `${completedCount} ${copy.done}`, "amber", doneProgress),
        metric(FiAlertTriangle, copy.overdueTasks, overdue.length, copy.due, overdue.length ? "amber" : "success", Math.min(100, overdue.length * 18)),
        metric(FiFileText, copy.recentFiles, uploads.length, copy.files, "teal", Math.min(100, uploads.length * 12))
      ],
      primaryList: listModel(copy.managedProjects, copy.sourceNoteScoped, copy.noProjects, copy.viewProjects, "#/projects", projects.map(projectItem).slice(0, 5)),
      taskList: listModel(copy.overdueTaskList, copy.overdueTasks, copy.noTasks, copy.viewTasks, "#/tasks", (overdue.length ? overdue : upcoming).map(taskItem).slice(0, 5)),
      fileList: listModel(copy.recentFiles, copy.uploadedFiles, copy.noFiles, copy.viewFiles, "#/uploads", uploads.map(fileItem).slice(0, 5)),
      activityList: listModel(copy.notifications, copy.sourceNoteScoped, copy.noNotifications, "", "#/notifications", notifications.map(notificationItem).slice(0, 5)),
      insight: insightModel(copy.aiInsights, copy.backendLimit, [
        [FiBriefcase, copy.accessibleProjects, formatDashboardCount(projects.length)],
        [FiCheckCircle, copy.accessibleTasks, formatDashboardCount(tasks.length)],
        [FiFileText, copy.recentFiles, formatDashboardCount(uploads.length)]
      ])
    };
  }

  return {
    focusEyebrow: copy.memberFocus,
    focusTitle: copy.memberTitle,
    focusText: copy.sourceNoteScoped,
    focusCount: formatDashboardCount(overdue.length || upcoming.length),
    focusLabel: overdue.length ? copy.overdueTasks : copy.upcomingDeadlines,
    metrics: [
      metric(FiCheckCircle, copy.myTasks, tasks.length, `${completedCount} ${copy.done}`, "primary", doneProgress),
      metric(FiAlertTriangle, copy.overdueTasks, overdue.length, copy.due, overdue.length ? "amber" : "success", Math.min(100, overdue.length * 20)),
      metric(FiClock, copy.upcomingDeadlines, upcoming.length, copy.due, "teal", Math.min(100, upcoming.length * 14)),
      metric(FiFolder, copy.myProjects, projects.length, copy.myProjects, "success", Math.min(100, projects.length * 18))
    ],
    primaryList: listModel(copy.myProjectList, copy.memberFocus, copy.noProjects, copy.viewProjects, "#/tasks", projects.map(projectItem).slice(0, 5)),
    taskList: listModel(copy.myTaskList, copy.upcomingDeadlines, copy.noTasks, copy.viewTasks, "#/tasks", (overdue.length ? overdue : upcoming).map(taskItem).slice(0, 5)),
    fileList: listModel(copy.recentFiles, copy.uploadedFiles, copy.noFiles, copy.viewFiles, "#/uploads", uploads.map(fileItem).slice(0, 5)),
    activityList: listModel(copy.notifications, copy.sourceNoteScoped, copy.noNotifications, "", "#/notifications", notifications.map(notificationItem).slice(0, 5)),
    insight: insightModel(copy.aiInsights, copy.backendLimit, [
      [FiCheckCircle, copy.myTasks, formatDashboardCount(tasks.length)],
      [FiClock, copy.upcomingDeadlines, formatDashboardCount(upcoming.length)],
      [FiFileText, copy.recentFiles, formatDashboardCount(uploads.length)]
    ])
  };
}

function metric(icon, label, value, detail, tone, progress) {
  return { icon, label, value: formatDashboardCount(value), detail, tone, progress };
}

function listModel(title, description, empty, action, href, items) {
  return { title, description, empty, action, href, items };
}

function insightModel(title, description, items) {
  return { title, description, items };
}

function projectItem(project) {
  return {
    id: project.id || project.project_id || project.name,
    title: project.name || project.title || "Untitled project",
    meta: project.status || "active",
    status: project.status || "active",
    progress: clampDashboardPercent(project.progress ?? (project.status === "completed" ? 100 : 0)),
    tone: project.status === "completed" ? "high" : "medium",
    href: "#/projects"
  };
}

function taskItem(task) {
  return {
    id: task.id || task.task_id || task.title,
    title: task.title || task.name || "Untitled task",
    meta: [task.project?.name || task.project_name, task.due_date ? formatDate(task.due_date) : ""].filter(Boolean).join(" · ") || task.priority || "",
    status: task.status || "todo",
    progress: clampDashboardPercent(task.progress ?? (isDashboardTaskDone(task) ? 100 : 0)),
    tone: isDashboardTaskOverdue(task) ? "high" : task.priority || "medium",
    href: "#/tasks"
  };
}

function fileItem(file) {
  return {
    id: file.id || file.upload_id || file.file_id || file.file_name || file.name,
    title: file.original_name || file.file_name || file.name || "Untitled file",
    meta: [file.scope, file.visibility, file.updated_at ? formatDate(file.updated_at) : ""].filter(Boolean).join(" · "),
    status: file.processing_status || file.status || "active",
    tone: "medium",
    href: "#/uploads"
  };
}

function notificationItem(notification) {
  return {
    id: notification.id || notification.title,
    title: notification.title || notification.name || notification.message || "Notification",
    meta: notification.created_at || notification.updated_at ? formatDate(notification.created_at || notification.updated_at) : "",
    status: notification.status || "active",
    tone: "medium",
    href: "#/notifications"
  };
}

function projectsFromTasks(tasks) {
  const map = new Map();
  tasks.forEach((task) => {
    const project = task.project || {};
    const id = task.project_id || project.id || project.project_id || project.name || task.project_name;
    if (!id) return;
    map.set(String(id), {
      id,
      name: project.name || task.project_name || project.title || "Project",
      status: project.status || "active",
      progress: project.progress
    });
  });
  return Array.from(map.values());
}

function normalizeDashboardCollection(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

function isDashboardTaskDone(task) {
  return ["done", "completed", "complete"].includes(String(task?.status || "").toLowerCase());
}

function isDashboardTaskOverdue(task) {
  if (!task?.due_date || isDashboardTaskDone(task)) return false;
  const dueDate = new Date(task.due_date);
  return !Number.isNaN(dueDate.getTime()) && dueDate < new Date();
}

function percentFrom(total, value) {
  return total ? clampDashboardPercent((Number(value || 0) / Number(total || 1)) * 100) : 0;
}

function clampDashboardPercent(value) {
  return Math.max(0, Math.min(100, Math.round(Number(value || 0))));
}

function formatDashboardCount(value) {
  return Number(value || 0).toLocaleString();
}

function DecisionItem({ action, icon: Icon, text, time, title, tone }) {
  return (
    <article className="t2-decision-item">
      <span className={`t2-decision-item__icon is-${tone}`}><Icon aria-hidden="true" /></span>
      <div><small>{time}</small><h3>{title}</h3><p>{text}</p><button type="button">{action}</button></div>
    </article>
  );
}

export function ResourcePage({ path }) {
  if (routeMeta[path]?.key === "projects") return <ProjectsResourcePage path={path} />;
  if (routeMeta[path]?.key === "tasks") return <TasksResourcePage path={path} />;
  if (routeMeta[path]?.key === "employees") return <EmployeesResourcePage path={path} />;
  if (routeMeta[path]?.key === "uploads") return <UploadsResourcePage path={path} />;
  if (routeMeta[path]?.key === "notifications") return <NotificationsResourcePage path={path} />;

  const { normalizedRole } = useAuth();
  const { language } = usePreferences();
  const copy = appCopy[language] || appCopy.en;
  const local = pageCopy[language] || pageCopy.en;
  const meta = routeMeta[path] || routeMeta["/projects"];
  const key = meta.key;
  const pageRows = usePageRows(key, normalizedRole);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState(() => window.matchMedia?.("(max-width: 700px)").matches ? "grid" : "table");
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState("");

  const filteredRows = useMemo(() => pageRows.rows.filter((row) => {
    const searchable = `${rowName(row, language)} ${ownerName(row, language)} ${row.email || ""} ${row.industry || ""}`.toLowerCase();
    const matchesQuery = searchable.includes(query.trim().toLowerCase());
    const matchesFilter = filter === "all" || statusKey(row.status) === filter;
    return matchesQuery && matchesFilter;
  }), [filter, language, pageRows.rows, query]);

  const actionLabel = meta.action ? copy[meta.action] : "";

  function handleSaved(row) {
    if (row) pageRows.setRows((current) => [row, ...current]);
    setCreateOpen(false);
    setToast(local.saved);
    window.setTimeout(() => setToast(""), 3500);
    if (!isDemoMode()) pageRows.reload();
  }

  return (
    <div className="t2-page">
      <PageHeader
        title={textFor(language, meta.title)}
        subtitle={textFor(language, meta.subtitle)}
        action={actionLabel ? <AddButton onClick={() => setCreateOpen(true)}>{actionLabel}</AddButton> : null}
      />

      {toast ? <div className="t2-toast" role="status"><FiCheckCircle aria-hidden="true" /><span>{toast}</span></div> : null}

      <div className="t2-resource-toolbar">
        <label className="t2-resource-search">
          <FiSearch aria-hidden="true" />
          <span className="t2-sr-only">{copy.search}</span>
          <input placeholder={copy.search} type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <SelectControl label={copy.filters} value={filter} onChange={(event) => setFilter(event.target.value)}>
          <option value="all">{copy.all}</option>
          <option value="active">{copy.active}</option>
          <option value="pending">{copy.pending}</option>
          <option value="completed">{copy.completed}</option>
          <option value="blocked">{copy.blocked}</option>
        </SelectControl>
        <span className="t2-resource-count">{filteredRows.length} {local.records}</span>
        <div className="t2-view-toggle" role="group" aria-label={copy.view}>
          <IconButton className={view === "table" ? "is-active" : ""} label={copy.tableView} onClick={() => setView("table")}><FiList /></IconButton>
          <IconButton className={view === "grid" ? "is-active" : ""} label={copy.gridView} onClick={() => setView("grid")}><FiGrid /></IconButton>
        </div>
      </div>

      {pageRows.status === "loading" ? <Panel><SkeletonTable rows={6} /></Panel> : null}
      {pageRows.status === "error" ? <Panel><ErrorState onRetry={pageRows.reload} retryLabel={copy.retry} title={copy.failedLoad} /></Panel> : null}
      {pageRows.status === "ready" && !filteredRows.length ? (
        <Panel><EmptyState title={copy.noData} action={query || filter !== "all" ? <Button icon={FiRefreshCw} onClick={() => { setQuery(""); setFilter("all"); }} tone="secondary">{local.clearFilters}</Button> : actionLabel ? <AddButton onClick={() => setCreateOpen(true)}>{actionLabel}</AddButton> : null} /></Panel>
      ) : null}
      {pageRows.status === "ready" && filteredRows.length && view === "table" ? <ResourceTable copy={copy} keyName={key} language={language} onSelect={setSelected} rows={filteredRows} /> : null}
      {pageRows.status === "ready" && filteredRows.length && view === "grid" ? <ResourceGrid copy={copy} keyName={key} language={language} onSelect={setSelected} rows={filteredRows} /> : null}

      <Modal description={local.createDescription} onClose={() => setCreateOpen(false)} open={createOpen} title={actionLabel || local.createTitle}>
        <CreateResourceForm copy={copy} keyName={key} language={language} local={local} onCancel={() => setCreateOpen(false)} onSaved={handleSaved} role={normalizedRole} />
      </Modal>

      <Modal onClose={() => setSelected(null)} open={Boolean(selected)} title={local.detailTitle}>
        {selected ? <ResourceDetails copy={copy} keyName={key} language={language} row={selected} /> : null}
      </Modal>
    </div>
  );
}

function ResourceTable({ copy, keyName, language, onSelect, rows }) {
  const columns = columnsFor(keyName, copy);
  return (
    <Panel className="t2-table-panel">
      <div className="t2-table-scroll">
        <table className="t2-table">
          <thead><tr>{columns.map((column) => <th key={column.key} scope="col">{column.label}</th>)}<th className="t2-table__actions" scope="col"><span className="t2-sr-only">{copy.actions}</span></th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id || row.uuid || row.email || rowName(row, language)}>
                {columns.map((column) => <td key={column.key}>{renderCell(column.key, row, language, copy)}</td>)}
                <td className="t2-table__actions"><IconButton label={`${copy.details}: ${rowName(row, language)}`} onClick={() => onSelect(row)}><FiMoreHorizontal /></IconButton></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function ResourceGrid({ copy, keyName, language, onSelect, rows }) {
  const Icon = iconForKey(keyName);
  return (
    <div className="t2-resource-grid">
      {rows.map((row) => (
        <article className="t2-resource-card" key={row.id || row.uuid || row.email || rowName(row, language)}>
          <header><span><Icon aria-hidden="true" /></span><StatusBadge value={row.status} /></header>
          <h2>{rowName(row, language)}</h2>
          <p>{row.description || row.industry || row.email || ownerName(row, language)}</p>
          {typeof row.progress === "number" ? <div className="t2-resource-card__progress"><Progress label={`${copy.progress}: ${row.progress}%`} value={row.progress} /><small>{row.progress}%</small></div> : null}
          <footer><small>{formatDate(row.updated_at || row.date || row.due_date, language)}</small><Button onClick={() => onSelect(row)} tone="ghost">{copy.details}</Button></footer>
        </article>
      ))}
    </div>
  );
}

function columnsFor(key, copy) {
  if (key === "workspace" || key === "reports") return [
    { key: "name", label: copy.name }, { key: "owner", label: copy.owner }, { key: "status", label: copy.status }, { key: "progress", label: copy.progress }, { key: "updated", label: copy.updated }
  ];
  if (key === "users") return [
    { key: "name", label: copy.name }, { key: "email", label: copy.email }, { key: "role", label: copy.role }, { key: "status", label: copy.status }, { key: "updated", label: copy.updated }
  ];
  if (key === "companies") return [
    { key: "name", label: copy.name }, { key: "industry", label: copy.type }, { key: "members", label: copy.users }, { key: "status", label: copy.status }, { key: "updated", label: copy.updated }
  ];
  if (key === "payments") return [
    { key: "name", label: copy.name }, { key: "plan", label: copy.type }, { key: "amount", label: copy.payments }, { key: "status", label: copy.status }, { key: "updated", label: copy.updated }
  ];
  if (key === "meetings") return [
    { key: "name", label: copy.title }, { key: "owner", label: copy.owner }, { key: "date", label: copy.date }, { key: "status", label: copy.status }
  ];
  return [
    { key: "name", label: copy.title }, { key: "type", label: copy.type }, { key: "status", label: copy.status }, { key: "updated", label: copy.updated }
  ];
}

function renderCell(key, row, language, copy) {
  if (key === "name") return <span className="t2-table-name"><b>{rowName(row, language)}</b>{row.description ? <small>{row.description}</small> : null}</span>;
  if (key === "owner") return <span className="t2-person-cell"><i>{ownerName(row, language).slice(0, 1)}</i><span>{ownerName(row, language)}</span></span>;
  if (key === "status") return <StatusBadge value={row.status} />;
  if (key === "progress") return <span className="t2-progress-cell"><Progress label={`${copy.progress}: ${row.progress || 0}%`} value={row.progress || 0} /><small>{row.progress || 0}%</small></span>;
  if (key === "priority") return <span className={`t2-priority-label is-${row.priority || "medium"}`}>{copy[row.priority] || row.priority || copy.medium}</span>;
  if (key === "date") return formatDate(row.due_date || row.date, language);
  if (key === "updated") return formatDate(row.updated_at || row.created_at, language);
  if (key === "email") return <bdi>{row.email || "—"}</bdi>;
  if (key === "role") return roleText(row.role, language);
  if (key === "type") return row.type || row.mime_type || row.category || "—";
  if (key === "size") return row.size || row.file_size || "—";
  if (key === "industry") return row.industry || "—";
  if (key === "members") return row.users_count ?? row.members_count ?? "—";
  if (key === "plan") return row.plan || row.plan_name || "—";
  if (key === "amount") return row.amount || row.total || "—";
  return row[key] || "—";
}

function iconForKey(key) {
  if (key === "users") return FiUsers;
  if (key === "companies") return FiBriefcase;
  if (key === "payments") return FiBarChart2;
  if (key === "notifications") return FiBell;
  if (key === "meetings") return FiCalendar;
  return FiActivity;
}

function roleText(role, language) {
  const roles = {
    admin: { ar: "مدير المنصة", en: "Platform admin" },
    company_owner: { ar: "مالك الشركة", en: "Company owner" },
    company_manager: { ar: "مدير الشركة", en: "Company manager" },
    company_member: { ar: "عضو الفريق", en: "Team member" }
  };
  return roles[role]?.[language] || role || "—";
}

function CreateResourceForm({ copy, keyName, language, local, onCancel, onSaved, role }) {
  const [form, setForm] = useState({
    name: "",
    title: "",
    description: "",
    email: "",
    password: "",
    role: "company_member",
    status: "active",
    priority: "medium"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (!(form.name || form.title).trim()) {
      setError(copy.name);
      return;
    }
    setLoading(true);
    try {
      const payload = { data: { id: `local-${Date.now()}`, ...form } };

      const data = getPayloadData(payload);
      const created = data?.project || data?.task || data?.staff || data?.user || data?.upload || data?.file || data;
      onSaved(created && typeof created === "object" ? created : null);
    } catch (requestError) {
      if (isDemoMode()) {
        onSaved({ id: `demo-${Date.now()}`, ...form, name: form.name || form.title, title: form.title || form.name, progress: 0, updated_at: new Date().toISOString() });
      } else {
        setError(requestError?.message || copy.failedSave);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="t2-create-form" onSubmit={submit}>
      {error ? <p className="t2-form-alert is-error" role="alert">{error}</p> : null}
      <Field label={copy.name} required><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
      <Field label={copy.description}><textarea rows="4" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></Field>
      <div className="t2-modal-actions"><Button onClick={onCancel} tone="secondary">{copy.cancel}</Button><Button loading={loading} loadingLabel={copy.loading} type="submit">{copy.create}</Button></div>
    </form>
  );
}

function ResourceDetails({ copy, keyName, language, row }) {
  const Icon = iconForKey(keyName);
  return (
    <div className="t2-resource-details">
      <span className="t2-resource-details__icon"><Icon aria-hidden="true" /></span>
      <div><small>{copy.name}</small><h3>{rowName(row, language)}</h3></div>
      <dl>
        <div><dt>{copy.status}</dt><dd><StatusBadge value={row.status} /></dd></div>
        <div><dt>{copy.owner}</dt><dd>{ownerName(row, language)}</dd></div>
        <div><dt>{copy.updated}</dt><dd>{formatDate(row.updated_at || row.date || row.due_date, language)}</dd></div>
        {typeof row.progress === "number" ? <div><dt>{copy.progress}</dt><dd>{row.progress}%</dd></div> : null}
      </dl>
      {row.description ? <p>{row.description}</p> : null}
    </div>
  );
}

export function AiChatPage() {
  return <AiChatResourcePage />;
  /*
  const { language, direction } = usePreferences();
  const copy = appCopy[language] || appCopy.en;
  const local = pageCopy[language] || pageCopy.en;
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const Arrow = direction === "rtl" ? FiArrowLeft : FiArrowRight;

  useEffect(() => {
    let active = true;
    if (isDemoMode()) {
      const demoSessions = [
        { id: "demo-chat-1", title: language === "ar" ? "مراجعة خطة الإصدار" : "Release plan review" },
        { id: "demo-chat-2", title: language === "ar" ? "تلخيص اجتماع المنتج" : "Product meeting summary" }
      ];
      setSessions(demoSessions);
      setActiveSession(demoSessions[0].id);
      setMessages(demoChatMessages(language));
      setLoading(false);
      return () => { active = false; };
    }
    listChatSessions()
      .then((payload) => {
        if (!active) return;
        const rows = extractRows(getPayloadData(payload), ["sessions", "conversations"]);
        setSessions(rows);
        setActiveSession(rows[0]?.id || rows[0]?.session_id || "");
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setError(copy.failedLoad);
        setLoading(false);
      });
    return () => { active = false; };
  }, [copy.failedLoad, language]);

  useEffect(() => {
    if (!activeSession || isDemoMode()) return;
    let active = true;
    setLoading(true);
    listChatSessionMessages(activeSession)
      .then((payload) => active && setMessages(extractRows(getPayloadData(payload), ["messages"])))
      .catch(() => active && setError(copy.failedLoad))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [activeSession, copy.failedLoad]);

  async function send(event) {
    event.preventDefault();
    const message = input.trim();
    if (!message || sending) return;
    const userMessage = { id: `user-${Date.now()}`, role: "user", content: message, message_content: message };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setSending(true);
    setError("");
    try {
      if (isDemoMode()) {
        await new Promise((resolve) => window.setTimeout(resolve, 450));
        setMessages((current) => [...current, demoAssistantReply(language, message)]);
      } else {
        const payload = await sendChatMessage({ session_id: activeSession, message_content: message });
        const data = getPayloadData(payload);
        const reply = data?.message || data?.assistant_message || data;
        if (reply) setMessages((current) => [...current, reply]);
      }
    } catch {
      setError(local.chatError);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="t2-page t2-page--chat">
      <PageHeader title={copy.assistant} subtitle={textFor(language, { ar: "اسأل ضمن سياق ملفات ومشاريع شركتك، مع مصادر قابلة للمراجعة.", en: "Ask within company file and project context, with reviewable sources." })} />
      <div className="t2-chat-layout">
        <aside className="t2-chat-sidebar">
          <Button icon={FiPlus} onClick={() => { setActiveSession(""); setMessages([]); }} tone="secondary">{local.newChat}</Button>
          <h2>{local.conversations}</h2>
          <div className="t2-chat-sessions">
            {sessions.length ? sessions.map((session) => {
              const id = session.id || session.session_id;
              return <button className={id === activeSession ? "is-active" : ""} key={id} onClick={() => setActiveSession(id)} type="button"><FiMessageSquare /><span>{session.title || session.name || local.newChat}</span><Arrow /></button>;
            }) : <p>{local.noConversations}</p>}
          </div>
        </aside>
        <section className="t2-chat-thread">
          <header className="t2-chat-thread__header"><div><span><FiZap /></span><div><b>{copy.assistant}</b><small>{copy.active}</small></div></div><IconButton label={copy.settings}><FiSliders /></IconButton></header>
          <div className="t2-chat-messages" aria-live="polite">
            {!messages.length && !loading ? <div className="t2-chat-welcome"><span><FiMessageSquare /></span><h2>{local.assistantWelcome}</h2><p>{local.assistantIntro}</p></div> : null}
            {messages.map((message, index) => <ChatMessage key={message.id || index} language={language} local={local} message={message} />)}
            {loading ? <LoadingState label={copy.loading} /> : null}
            {sending ? <div className="t2-chat-typing"><span /><span /><span /><small>{local.assistantThinking}</small></div> : null}
            {error ? <p className="t2-form-alert is-error" role="alert">{error}</p> : null}
          </div>
          <form className="t2-chat-composer" onSubmit={send}>
            <IconButton label={copy.uploadFile}><FiPaperclip /></IconButton>
            <textarea aria-label={local.messagePlaceholder} placeholder={local.messagePlaceholder} rows="1" value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form.requestSubmit(); } }} />
            <IconButton className="t2-chat-send" disabled={!input.trim() || sending} label={local.send}><FiSend /></IconButton>
          </form>
        </section>
      </div>
    </div>
  );
  */
}

function ChatMessage({ language, local, message }) {
  const isUser = message.role === "user" || message.sender === "user" || message.type === "user";
  const content = message.content || message.message_content || message.text || "";
  const sources = message.sources || message.citations || [];
  return (
    <article className={`t2-chat-message ${isUser ? "is-user" : "is-assistant"}`}>
      <span className="t2-chat-message__avatar">{isUser ? <FiUser /> : <FiZap />}</span>
      <div>
        <p dir="auto">{content}</p>
        {!isUser && sources.length ? <div className="t2-chat-sources"><small>{local.sources}</small>{sources.map((source, index) => <button key={source.id || index} type="button"><FiFileText /><span>{source.title || source.name || `Source ${index + 1}`}</span></button>)}</div> : null}
        {!isUser && !sources.length && message.showEmptySource ? <small className="t2-chat-no-source">{local.noSource}</small> : null}
      </div>
    </article>
  );
}

function demoChatMessages(language) {
  return [
    {
      id: "assistant-1",
      role: "assistant",
      content: language === "ar" ? "راجعت آخر تحديثات المشروع. المخاطرة الأوضح هي أن اعتماد نطاق الإصدار لم يُحسم بعد، بينما يعتمد عليه موعدا مهمتين." : "I reviewed the latest project updates. The clearest risk is that release scope is still unapproved while two task dates depend on it.",
      sources: [{ id: "s1", title: "Q3_product_roadmap.pdf" }, { id: "s2", title: language === "ar" ? "اجتماع مراجعة التسليم" : "Delivery review meeting" }]
    }
  ];
}

function demoAssistantReply(language, question) {
  return {
    id: `assistant-${Date.now()}`,
    role: "assistant",
    content: language === "ar" ? `بناءً على سياق مساحة العرض، يرتبط سؤالك «${question}» بخطة الإصدار ومهمتي الاعتماد والمراجعة. أقترح مراجعة النطاق أولًا ثم تحديث موعد التسليم.` : `Based on the demo workspace, “${question}” connects to the release plan and the approval and review tasks. Review scope first, then update the delivery date.`,
    sources: [{ id: "s1", title: "Q3_product_roadmap.pdf" }]
  };
}

export function ProfilePage({ admin = false }) {
  const { user, normalizedRole, login } = useAuth();
  const { language, setLanguage, setTheme, theme } = usePreferences();
  const copy = appCopy[language] || appCopy.en;
  const local = pageCopy[language] || pageCopy.en;
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    setForm({ name: user?.name || "", email: user?.email || "" });
  }, [user?.email, user?.name]);

  async function save(event) {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });
    try {
      if (!isDemoMode()) await updateProfile({ name: form.name, email: form.email });
      login({ ...user, ...form });
      setStatus({ type: "success", message: local.profileSaved });
    } catch (error) {
      setStatus({ type: "error", message: error?.message || copy.failedSave });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="t2-page">
      <PageHeader title={copy.profile} subtitle={textFor(language, { ar: "إدارة بيانات الحساب وتفضيلات العرض والوصول.", en: "Manage account details, display preferences, and access." })} />
      {status.message ? <div className={`t2-inline-alert is-${status.type}`} role={status.type === "error" ? "alert" : "status"}>{status.type === "success" ? <FiCheckCircle /> : <FiAlertTriangle />}<span>{status.message}</span></div> : null}
      <div className="t2-settings-layout">
        <Panel className="t2-profile-summary">
          <span className="t2-profile-avatar">{String(form.name || "T").slice(0, 2).toUpperCase()}</span>
          <h2>{form.name || "Teamoria User"}</h2>
          <p><bdi>{form.email}</bdi></p>
          <StatusBadge value="active" />
          <dl><div><dt>{copy.role}</dt><dd>{roleText(normalizedRole, language)}</dd></div><div><dt>{copy.workspace}</dt><dd>{user?.company?.name || copy.platform}</dd></div></dl>
        </Panel>
        <div className="t2-settings-stack">
          <Panel>
            <SectionHeader title={local.accountDetails} description={local.accountDetailsText} />
            <form className="t2-settings-form" onSubmit={save}>
              <Field label={local.fullName}><div className="t2-input"><FiUser /><input autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></div></Field>
              <Field label={copy.email}><div className="t2-input"><FiMail /><input autoComplete="email" inputMode="email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></div></Field>
              <Button loading={loading} loadingLabel={copy.loading} type="submit">{copy.save}</Button>
            </form>
          </Panel>
          <Panel>
            <SectionHeader title={local.preferences} description={local.preferencesText} />
            <div className="t2-preference-row"><div><FiGlobe /><span><b>{copy.language}</b><small>{language === "ar" ? local.arabic : local.english}</small></span></div><div className="t2-segmented"><button className={language === "ar" ? "is-active" : ""} onClick={() => setLanguage("ar")} type="button">{local.arabic}</button><button className={language === "en" ? "is-active" : ""} onClick={() => setLanguage("en")} type="button">{local.english}</button></div></div>
            <div className="t2-preference-row"><div><FiSliders /><span><b>{copy.theme}</b><small>{local[theme] || local.system}</small></span></div><div className="t2-segmented"><button className={theme === "light" ? "is-active" : ""} onClick={() => setTheme("light")} type="button">{local.light}</button><button className={theme === "dark" ? "is-active" : ""} onClick={() => setTheme("dark")} type="button">{local.dark}</button><button className={theme === "system" ? "is-active" : ""} onClick={() => setTheme("system")} type="button">{local.system}</button></div></div>
          </Panel>
          <Panel>
            <SectionHeader title={local.security} description={local.securityText} />
            <div className="t2-security-row"><span><FiShield /></span><div><b>{roleText(normalizedRole, language)}</b><small>{local.roleReadonly}</small></div><StatusBadge value="active" /></div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

export function SpecialPage({ path }) {
  const { language } = usePreferences();
  const copy = appCopy[language] || appCopy.en;
  const local = pageCopy[language] || pageCopy.en;
  const meta = routeMeta[path] || routeMeta["/workspace-graph"];

  if (path === "/workspace-graph") {
    return (
      <div className="t2-page">
        <PageHeader title={textFor(language, meta.title)} subtitle={textFor(language, meta.subtitle)} />
        <Panel className="t2-graph-panel">
          <SectionHeader title={local.graphTitle} description={local.graphText} action={<Button icon={FiFilter} tone="secondary">{copy.filters}</Button>} />
          <div className="t2-knowledge-graph" aria-label={local.graphTitle}>
            <span className="t2-graph-line line-1" /><span className="t2-graph-line line-2" /><span className="t2-graph-line line-3" /><span className="t2-graph-line line-4" />
            <GraphNode className="node-center" icon={FiBriefcase} label={language === "ar" ? "إطلاق البوابة" : "Portal launch"} />
            <GraphNode className="node-files" icon={FiFileText} label={copy.uploads} />
            <GraphNode className="node-team" icon={FiUsers} label={copy.employees} />
            <GraphNode className="node-tasks" icon={FiCheckCircle} label={copy.tasks} />
            <GraphNode className="node-decisions" icon={FiZap} label={local.decision} />
          </div>
        </Panel>
      </div>
    );
  }

  if (path === "/agent-run-details") {
    return (
      <div className="t2-page">
        <PageHeader title={textFor(language, meta.title)} subtitle={textFor(language, meta.subtitle)} action={<StatusBadge value="completed" />} />
        <Panel className="t2-run-detail">
          <SectionHeader title={local.runTimeline} description={language === "ar" ? "تلخيص ملفات الإصدار" : "Summarize release files"} />
          <ol>{[[FiFileText, local.source, "Q3_product_roadmap.pdf"], [FiLayers, local.analysis, language === "ar" ? "استخراج 8 إشارات" : "Extracted 8 signals"], [FiZap, local.decision, language === "ar" ? "3 توصيات" : "3 recommendations"], [FiCheckCircle, local.action, language === "ar" ? "مسودة جاهزة" : "Draft ready"]].map(([Icon, label, text], index) => <li key={label}><span><Icon /></span><div><small>0{index + 1} · {label}</small><b>{text}</b></div></li>)}</ol>
        </Panel>
      </div>
    );
  }

  return <ResourcePage path={path} />;
}

function GraphNode({ className, icon: Icon, label }) {
  return <button className={`t2-graph-node ${className}`} type="button"><span><Icon /></span><b>{label}</b></button>;
}
