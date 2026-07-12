import {
  FiAlertTriangle,
  FiArrowRight,
  FiBookOpen,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiDownload,
  FiPlus,
  FiShield,
  FiStar,
  FiTrendingUp,
  FiUsers,
  FiZap
} from "react-icons/fi";
import "../styles/dashboard.css";
import { useEffect, useState } from "react";
import {
  ActivityOverviewChart,
  AIInsightCard,
  DashboardMetricCard,
  ProjectProgressChart,
  TaskDistributionChart,
  WorkspaceActivityFeed
} from "../components/dashboard/DashboardComponents.jsx";
import { aiInsights, dashboardCharts, workspaceActivities } from "../data/dashboardInsights.js";
import AppShell, { AppPageLayout, AppSidebar } from "../components/app/AppShell.jsx";
import AppHeader from "../components/app/AppHeader.jsx";
import { useAuth } from "../lib/AuthContext.jsx";
import {
  getCompanyDashboard,
  getPayloadData,
  listCompanyProjects,
  listStaff,
  listTasks,
  listUploads
} from "../lib/api.js";
import { normalizeRole } from "../lib/authRoles.js";
import { getDemoRole, getHashSearchParams, isDemoMode } from "../lib/demoMode.js";
import { usePreferences } from "../lib/PreferencesContext.jsx";

const roleProfiles = {
  owner: { label: "Company Owner", initials: "CO", dashboard: "owner" },
  "general-manager": { label: "General Manager", initials: "GM", dashboard: "owner" },
  "project-manager": { label: "Project Manager", initials: "PM", dashboard: "execution" },
  employee: { label: "Employee", initials: "EM", dashboard: "employee" }
};

const execMetrics = [
  { label: "Team Velocity", value: "48.2 pts", detail: "+12% vs last week", icon: FiTrendingUp, tone: "primary" },
  { label: "Sprint Progress", value: "64%", detail: "Sprint", icon: FiClock, tone: "secondary", progress: 64 },
  { label: "Workload Avg.", value: "82%", detail: "3 over 90%", icon: FiUsers, tone: "tertiary", progress: 82 },
  { label: "Critical Alerts", value: "3 Blocks", detail: "Immediate attention", icon: FiAlertTriangle, tone: "alert" }
];

const ownerMetrics = [
  { label: "Company Spend Utilization", value: "$142.8K", detail: "Mock data", icon: FiCreditCard, tone: "primary", progress: 65 },
  { label: "Company Project Health", value: "94.2%", detail: "Mock data", icon: FiShield, tone: "secondary", progress: 75 },
  { label: "Company Workforce", value: "43", detail: "Mock data", icon: FiUsers, tone: "neutral", progress: 84 },
  { label: "AI Efficiency Estimate", value: "128h Saved", detail: "Mock data", icon: FiZap, tone: "ai", progress: 92 }
];

const ownerTeams = [
  ["ENG", "Engineering", "Company workspace", "142 pts", "Elite", "primary", 3, 92],
  ["OPS", "Operations", "Company workspace", "118 pts", "Stable", "green", 2, 74],
  ["FIN", "Finance", "Company workspace", "94 pts", "Caution", "amber", 1, 48]
];

const overdueTasks = [
  ["API Auth Integration", "Leon R.", "2 Days"],
  ["Client Feedback Loop", "Emily T.", "1 Day"],
  ["Documentation V2", "System", "4 Hours"]
];

const ownerDashboardCopy = {
  ar: {
    overview: (company) => `نظرة عامة على ${company}`,
    subtitleLive: "إشارات مباشرة للمشاريع والمهام والملفات والفريق من واجهة لوحة الشركة.",
    subtitleFallback: "مؤشرات مجمعة من خدمات مساحة العمل إلى حين توفر ملخص اللوحة.",
    subtitlePreview: "بيانات تجريبية توضّح تجربة مالك الشركة.",
    subtitleError: "تعذر الوصول إلى بيانات لوحة الشركة الآن.",
    subtitleEmpty: "لم تصل بيانات لوحة الشركة بعد.",
    view: (role) => `عرض ${role}`,
    loading: "جارٍ تحميل مؤشرات الشركة…",
    empty: "استجابت واجهة اللوحة، لكنها لم ترجع مؤشرات المشاريع أو المهام أو الملفات بعد.",
    topTeams: "أبرز المشاريع أداءً",
    viewUnits: "عرض كل المشاريع",
    department: "المشروع",
    velocity: "التقدّم",
    health: "حالة المشروع",
    ai: "تكامل المعرفة",
    noProjects: "لا توجد مشاريع شركة بعد.",
    aiHub: "مركز إشارات الشركة",
    aiLive: "إشارات مباشرة مع توصيات مرتبطة بالسياق",
    aiWaiting: "المؤشرات متاحة والتوصيات تنتظر بيانات الملخص",
    aiPreview: "اقتراحات استراتيجية تجريبية",
    aiEmpty: "بانتظار نشاط مساحة العمل",
    recommendationsEmpty: "ستظهر التوصيات بعد وصول نشاط المشاريع والمهام.",
    projection: "تصوّر مستقبلي",
    staffing: "خطة توزيع الفريق",
    projectionPreview: "نموذج تجريبي يوضح كيف ترتبط احتياجات الفريق بنشاط المشاريع والمهام.",
    projectionLive: "يعتمد التصور على نشاط المشاريع والمهام الذي أعادته الواجهة.",
    generateRoadmap: "إنشاء مسودة للخطة",
    noProgress: "لا توجد بيانات تقدّم مشاريع بعد.",
    noActivity: "لا توجد بيانات نشاط بعد.",
    risks: [
      { action: "فتح المهام", badge: "قادمة", title: "تركيز المهام القادمة", text: "لا توجد مهام قادمة في بيانات اللوحة." },
      { action: "مراجعة المشاريع", badge: "API مباشر", title: "تغطية المشاريع", text: "تتزامن المشاريع الحديثة وحالاتها من واجهة لوحة الشركة." }
    ]
  },
  en: {
    overview: (company) => `${company} Overview`,
    subtitleLive: "Live metrics are synced from the company dashboard API.",
    subtitleFallback: "Live metrics are assembled from workspace APIs while the overview endpoint is unavailable.",
    subtitlePreview: "Preview data illustrates the company-owner experience.",
    subtitleError: "The company dashboard API is currently unavailable.",
    subtitleEmpty: "No company dashboard data has been returned yet.",
    view: (role) => `${role} View`,
    loading: "Loading company signals…",
    empty: "The dashboard API responded, but it did not include projects, tasks, or file signals yet.",
    topTeams: "Top performing projects",
    viewUnits: "View all projects",
    department: "Project",
    velocity: "Progress",
    health: "Project health",
    ai: "Knowledge integration",
    noProjects: "No company projects yet.",
    aiHub: "Company signal hub",
    aiLive: "Live workspace signals with contextual recommendations",
    aiWaiting: "Metrics are available; recommendations are waiting for overview data",
    aiPreview: "Preview strategic suggestions",
    aiEmpty: "Waiting for workspace activity",
    recommendationsEmpty: "Recommendations appear after project and task activity arrives.",
    projection: "Projection",
    staffing: "Team allocation plan",
    projectionPreview: "Preview model connecting team needs to project and task activity.",
    projectionLive: "The projection is based on returned project and task activity.",
    generateRoadmap: "Generate plan draft",
    noProgress: "No project progress data yet.",
    noActivity: "No activity data yet.",
    risks: null
  }
};

const executionDashboardCopy = {
  ar: {
    hub: "مركز ذكاء التنفيذ",
    subtitle: (role) => `تحليل تشغيلي لحظي وإشارات استباقية لصحة المشاريع لعرض ${role}.`,
    export: "تصدير التقرير",
    sprint: "إدارة الدورة",
    risks: "المخاطر الحرجة",
    active: "3 نشطة",
    riskRegister: "عرض سجل المخاطر",
    strategic: "إشارات استراتيجية",
    recommendations: "إجراءات مقترحة",
    riskCards: [
      { detail: "تكامل دورة العمل 24", level: "خطر مرتفع", progress: 85, text: "ارتفع احتمال التأخير 14٪ بسبب انتظار توثيق واجهات الربط من فريق الباك اند.", title: "احتمال تأخير: الواجهة", tone: "error" },
      { detail: "إعادة هيكلة مسار البيانات", level: "متوسط", progress: 40, text: "توزيع العمل الحالي يتجاوز السعة المتاحة عبر ثلاثة مسارات متوازية عالية الأولوية.", title: "تعارض في الموارد", tone: "secondary" }
    ],
    insights: [
      { eyebrow: "تحليل هيكلي", title: "عنق زجاجة في الموارد", text: "رُصد تباطؤ في دورة المراجعة ضمن مجموعة التسليم؛ المراجعة أبطأ من المتوسط وتحتاج إعادة توزيع.", variant: "flow" },
      { eyebrow: "اتجاه سرعة الإنجاز", title: "تحسن الإنتاجية", text: "ارتفعت سرعة الإنجاز بمساعدة الذكاء الاصطناعي خلال آخر 30 يومًا مع فرصة لتقديم المحطة التالية مبكرًا.", variant: "bars" }
    ],
    recommendationCards: [
      { action: "تطبيق الآن", detail: "أعد توزيع مهمتين فرعيتين لموازنة حمل الفريق.", secondaryAction: "التفاصيل", title: "إعادة إسناد مهمتين" },
      { action: "إعادة الجدولة", detail: "انقل المهمة إلى الدورة التالية لاستيعاب التأخير الحالي.", secondaryAction: "تجاهل", title: "تأجيل الاختبار النهائي" },
      { action: "جدولة تلقائية", detail: "رتّب لقاءً قصيرًا مع فريق التصميم لإزالة عائق الواجهة.", secondaryAction: "استبعاد", title: "اجتماع مزامنة مطلوب" }
    ]
  },
  en: {
    hub: "AI Intelligence Hub",
    subtitle: (role) => `Real-time operational analysis and predictive project health indicators for ${role}.`,
    export: "Export Report",
    sprint: "Manage Sprint",
    risks: "Critical Risks",
    active: "3 Active",
    riskRegister: "View Risk Register",
    strategic: "Strategic Insights",
    recommendations: "Actionable Recommendations",
    riskCards: [
      { detail: "Sprint 24 Integration", level: "HIGH RISK", progress: 85, text: "Probability of delay increased by 14% due to pending API documentation from backend team.", title: "Potential Delay: Frontend", tone: "error" },
      { detail: "Data Pipeline Refactor", level: "MEDIUM", progress: 40, text: "Current allocation exceeds available capacity across three parallel high-priority streams.", title: "Resource Conflict", tone: "secondary" }
    ],
    insights: [
      { eyebrow: "Structural Analytics", title: "Resource Bottleneck", text: "A delivery review cycle is 42% slower than average and needs rebalancing.", variant: "flow" },
      { eyebrow: "Velocity Trends", title: "Productivity Uplift", text: "AI-assisted work improved velocity over the last 30 days, creating an early-delivery opportunity.", variant: "bars" }
    ],
    recommendationCards: [
      { action: "Apply Now", detail: "Reassign two subtasks to balance team workload.", secondaryAction: "Details", title: "Reassign 2 Sub-tasks" },
      { action: "Reschedule", detail: "Move the task to the next sprint to accommodate the current delay.", secondaryAction: "Ignore", title: "Shift Final QA" },
      { action: "Auto-Schedule", detail: "Schedule a short huddle with Design to unblock the frontend.", secondaryAction: "Dismiss", title: "Sync Meeting Needed" }
    ]
  }
};

const employeeDashboardCopy = {
  ar: {
    workspace: "مساحة الموظف",
    welcome: (name) => `مرحبًا بعودتك، ${name}.`,
    previewSummary: "لديك أربع أولويات رئيسية اليوم، ومؤشر تركيزك يتحسن هذا الأسبوع.",
    liveSummary: (count) => `لديك ${count} من المهام المعادة من مساحة الشركة.`,
    waitingSummary: "مساحة الشركة جاهزة، وستظهر البيانات هنا فور أن تعيدها الواجهة.",
    statusLabel: "حالة العمل اليوم",
    onTrack: "المسار سليم",
    productivityScore: "مؤشر التركيز",
    taskCompletion: "إنجاز المهام",
    loading: "جارٍ تحميل لوحة العمل…",
    kpiLabel: "مؤشرات لوحة الموظف",
    tasksToday: "مهامي لليوم",
    remaining: (count) => `${count} متبقية`,
    noTasks: "لا توجد مهام في مساحة الشركة الآن.",
    viewAllTasks: "عرض كل المهام",
    aiPreview: "أستطيع تلخيص ملفاتك أو تحليل سير عمل الفريق.",
    aiLive: "اسأل عن الملفات والمهام بعد وصول بيانات مساحة الشركة.",
    noAi: "لا توجد توصيات شخصية بعد.",
    askAi: "اسأل Teamoria عن مهامك أو ملفاتك",
    upcoming: "القادم",
    today: "اليوم",
    noMeetings: "لا توجد اجتماعات قادمة.",
    recentFiles: "أحدث الملفات",
    noFiles: "لا توجد ملفات حديثة في مساحة الشركة.",
    openUploads: "فتح مركز الملفات",
    productivity: "مؤشرات الإنتاجية",
    weekly: "أسبوعي",
    deepWork: "عمل مركّز",
    taskFocus: "تركيز المهام",
    reviewLoad: "عبء المراجعة",
    items: "عناصر",
    schedule: "جدول العمل",
    noSchedule: "لم تصل بيانات الجدول",
    day: "يوم",
    week: "أسبوع",
    month: "شهر",
    createTask: "إنشاء مهمة",
    moreFileActions: (name) => `إجراءات إضافية للملف ${name}`,
    previewTasks: [
      ["إنهاء مراجعة خارطة الربع", "قبل 2:00 م", "عالية", 82],
      ["مزامنة نظام التصميم", "قبل 4:30 م", "فريق المنصة", 58],
      ["مراجعة سرعة الدورة", "بلا موعد نهائي", "تشغيلية", 34]
    ],
    previewMeetings: [["10:00", "ص", "اللقاء الشهري", "قاعة الاجتماعات"], ["01:30", "م", "مراجعة التصميم", "اجتماع افتراضي"]],
    previewFiles: [["Q3_Roadmap_Draft.pdf", "عُدّل قبل ساعتين", "doc"], ["Budget_Allocation_Final.xlsx", "عُدّل أمس", "sheet"], ["Team_Velocity_Q2.report", "عُدّل قبل 3 أيام", "report"]],
    previewKpis: [
      { label: "مهام اليوم", value: "4", detail: "3 أولويات مركّزة", icon: FiClock, progress: 72, tone: "primary" },
      { label: "المهام المنجزة", value: "9", detail: "+2 عن أمس", icon: FiCheckCircle, progress: 68, tone: "success" },
      { label: "مؤشر الإنتاجية", value: "88", detail: "+12٪ هذا الأسبوع", icon: FiTrendingUp, progress: 88, tone: "score" },
      { label: "الاجتماعات القادمة", value: "2", detail: "التالي عند 10:00 ص", icon: FiCalendar, progress: 45, tone: "meeting" }
    ]
  },
  en: {
    workspace: "Employee workspace",
    welcome: (name) => `Welcome back, ${name}.`,
    previewSummary: "You have four primary priorities today, and your focus score is improving this week.",
    liveSummary: (count) => `You have ${count} tasks returned from your company workspace.`,
    waitingSummary: "Your company workspace is ready. Live data will appear when the API returns it.",
    statusLabel: "Today's work status",
    onTrack: "On track",
    productivityScore: "Focus score",
    taskCompletion: "Task completion",
    loading: "Loading dashboard from API…",
    kpiLabel: "Employee dashboard KPIs",
    tasksToday: "My Tasks for Today",
    remaining: (count) => `${count} Remaining`,
    noTasks: "No tasks returned for your company workspace.",
    viewAllTasks: "View all tasks",
    aiPreview: "I can summarize your docs or analyze team velocity.",
    aiLive: "Ask about files and tasks once your company workspace has data.",
    noAi: "No personal AI recommendations returned yet.",
    askAi: "Ask Teamoria AI about your tasks or files",
    upcoming: "Upcoming",
    today: "Today",
    noMeetings: "No meetings returned yet.",
    recentFiles: "Recent Files",
    noFiles: "No recent files returned for your company workspace.",
    openUploads: "Open Upload Center",
    productivity: "Productivity Insights",
    weekly: "Weekly",
    deepWork: "Deep work",
    taskFocus: "Task focus",
    reviewLoad: "Review load",
    items: "items",
    schedule: "Work Schedule",
    noSchedule: "No schedule returned",
    day: "Day",
    week: "Week",
    month: "Month",
    createTask: "Create task",
    moreFileActions: (name) => `More actions for ${name}`,
    previewTasks: [["Finalize Q3 roadmap review", "Due by 2:00 PM", "High", 82], ["Sync with Design System team", "Due by 4:30 PM", "Teamoria Alpha", 58], ["Review sprint velocity data", "No deadline", "Operational", 34]],
    previewMeetings: [["10:00", "AM", "Stakeholder Monthly", "Main Conference Room"], ["01:30", "PM", "Design Review", "Virtual Link"]],
    previewFiles: [["Q3_Roadmap_Draft.pdf", "Modified 2h ago", "doc"], ["Budget_Allocation_Final.xlsx", "Modified yesterday", "sheet"], ["Team_Velocity_Q2.report", "Modified 3d ago", "report"]],
    previewKpis: [
      { label: "Tasks Today", value: "4", detail: "3 focused priorities", icon: FiClock, progress: 72, tone: "primary" },
      { label: "Completed Tasks", value: "9", detail: "+2 vs yesterday", icon: FiCheckCircle, progress: 68, tone: "success" },
      { label: "Productivity Score", value: "88", detail: "+12% this week", icon: FiTrendingUp, progress: 88, tone: "score" },
      { label: "Upcoming Meetings", value: "2", detail: "Next at 10:00 AM", icon: FiCalendar, progress: 45, tone: "meeting" }
    ]
  }
};

const dashboardArabicLabels = {
  "Company Spend Utilization": "استخدام ميزانية الشركة",
  "Company Project Health": "صحة مشاريع الشركة",
  "Company Workforce": "أعضاء الشركة",
  "AI Efficiency Estimate": "أثر المساعد المتوقع",
  "Company Projects": "مشاريع الشركة",
  "Project Health": "صحة المشاريع",
  "Task Completion": "إنجاز المهام",
  "Mock data": "بيانات تجريبية",
  "No projects returned": "لا توجد مشاريع",
  "No completed projects": "لا توجد مشاريع مكتملة",
  "No users returned": "لا يوجد أعضاء بعد",
  "No tasks returned": "لا توجد مهام",
  "Todo": "للبدء",
  "In progress": "قيد التنفيذ",
  "Blocked": "متوقفة",
  "Done": "منجزة",
  "Elite": "ممتاز",
  "Stable": "مستقر",
  "Caution": "يحتاج انتباهًا",
  "Company workspace": "مساحة الشركة"
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [roleId, setRoleId] = useState(getDashboardRole);
  const profile = roleProfiles[roleId] || roleProfiles["project-manager"];
  const isPreview = !user || isDemoMode();

  useEffect(() => {
    const previewRole = mapDemoRoleToDashboardRole(getDemoRole());
    if (previewRole) {
      setRoleId(previewRole);
      return;
    }

    const dashboardRole = mapApiRoleToDashboardRole(user?.role);
    if (dashboardRole) {
      setRoleId(dashboardRole);
    }
  }, [user?.role]);

  function handleRoleChange(newRoleId) {
    if (!isPreview) return;
    localStorage.setItem("teamoria_preview_role", newRoleId);
    setRoleId(newRoleId);
  }

  if (profile.dashboard === "owner") {
    return <OwnerDashboard authUser={user} roleId={roleId} profile={profile} onRoleChange={handleRoleChange} />;
  }

  if (profile.dashboard === "employee") {
    return <EmployeeDashboard authUser={user} isPreview={isPreview} roleId={roleId} profile={profile} onRoleChange={handleRoleChange} />;
  }

  return <ExecutionDashboard isPreview={isPreview} roleId={roleId} profile={profile} onRoleChange={handleRoleChange} />;
}
function OwnerDashboard({ authUser, roleId, profile, onRoleChange }) {
  const { language, label } = usePreferences();
  const copy = ownerDashboardCopy[language] || ownerDashboardCopy.en;
  const isPreview = !authUser || isDemoMode();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [dashboardStatus, setDashboardStatus] = useState({ loading: false, error: "" });
  const companyName = authUser?.company?.name || "Your Company";
  const hasLiveDashboard = hasDashboardData(dashboard);
  const liveMetrics = (hasLiveDashboard ? getOwnerMetricsFromDashboard(dashboard) : isPreview ? ownerMetrics : getEmptyOwnerMetrics())
    .map((metric) => localizeDashboardMetric(metric, language));
  const liveTeams = (hasLiveDashboard ? getOwnerTeamsFromDashboard(dashboard) : isPreview ? ownerTeams : [])
    .map((team) => localizeDashboardTeam(team, language));
  const liveRisks = language === "ar" && !hasLiveDashboard
    ? copy.risks
    : getOwnerRisksFromDashboard(hasLiveDashboard ? dashboard : null);
  const projectProgress = hasLiveDashboard ? getProjectProgressFromDashboard(dashboard) : isPreview ? dashboardCharts.projectProgress : [];
  const activityOverview = hasLiveDashboard ? getActivityOverviewFromDashboard(dashboard) : isPreview ? dashboardCharts.activityOverview : [];
  const liveStatusSummary = getStatusSummaryFromDashboard(dashboard).map((item) => ({
    ...item,
    label: localizeDashboardLabel(item.label, language)
  }));
  const hasOverviewDashboard = hasLiveDashboard && dashboard?.source !== "fallback";
  const dashboardUnavailable = !isPreview && !dashboardStatus.loading && !hasLiveDashboard;

  useEffect(() => {
    if (isPreview || isDemoMode()) return;

    let isMounted = true;
    setDashboardStatus({ loading: true, error: "" });

    loadCompanyDashboard()
      .then((nextDashboard) => {
        if (!isMounted) return;
        setDashboard(nextDashboard);
        setDashboardStatus({ loading: false, error: "" });
      })
      .catch((error) => {
        if (!isMounted) return;
        setDashboard(null);
        setDashboardStatus({ loading: false, error: getDashboardErrorMessage(error, language) });
      });

    return () => {
      isMounted = false;
    };
  }, [isPreview, language]);

  return (
    <main className="owner-dashboard">
      <AppSidebar active="Dashboard" roleId={roleId} />
      <section className="owner-content">
        <AppHeader classNamePrefix="owner" profile={profile} onMobileNavToggle={() => setMobileNavOpen((value) => !value)} />

        <AppPageLayout
          className="owner-page"
          title={copy.overview(companyName)}
          subtitle={hasOverviewDashboard ? copy.subtitleLive : hasLiveDashboard ? copy.subtitleFallback : isPreview ? copy.subtitlePreview : dashboardStatus.error ? copy.subtitleError : copy.subtitleEmpty}
          actions={(
            <div className="owner-period">
              <FiCalendar aria-hidden="true" />
              <span>{copy.view(label(profile.label))}</span>
            </div>
          )}
        >

          {isPreview ? <RoleSwitcher activeRole={roleId} variant="owner" onRoleChange={onRoleChange} /> : null}
          {!isPreview && dashboardStatus.loading ? <p className="dashboard-api-state">{copy.loading}</p> : null}
          {!isPreview && dashboardStatus.error ? <p className="dashboard-api-state dashboard-api-state--error">{dashboardStatus.error}</p> : null}
          {dashboardUnavailable && !dashboardStatus.error ? <p className="dashboard-api-state">{copy.empty}</p> : null}

          <section className="owner-metrics-grid">
            {liveMetrics.map((metric, index) => (
              <DashboardMetricCard classNamePrefix="owner" key={metric.label} index={index} {...metric} />
            ))}
          </section>

          <section className="owner-insights-grid">
            <div className="owner-main-column">
              <section className="owner-panel owner-table-panel">
                <div className="owner-panel-head">
                  <h3><FiStar aria-hidden="true" />{copy.topTeams}</h3>
                  <a href="#/reports">{copy.viewUnits}</a>
                </div>
                <div className="owner-table-wrap">
                  <div className="container--scroll-x">
                    <table>
                      <thead>
                        <tr>
                          <th>{copy.department}</th>
                          <th>{copy.velocity}</th>
                          <th>{copy.health}</th>
                          <th>{copy.ai}</th>
                        </tr>
                      </thead>
                      <tbody>
                  {liveTeams.length === 0 ? (
                    <tr>
                      <td colSpan="4">{copy.noProjects}</td>
                    </tr>
                  ) : null}
                  {liveTeams.map(([code, name, office, velocity, health, tone, avatars, progress]) => (
                          <tr key={name}>
                            <td>
                              <div className={`owner-team-code tone-${tone}`}>{code}</div>
                              <div>
                                <b>{name}</b>
                                <span>{office}</span>
                              </div>
                            </td>
                            <td>
                              <strong className="owner-team-value">{velocity}</strong>
                              <div className="owner-team-progress" aria-label={`${name} progress ${progress}%`}>
                                <i style={{ "--progress-value": `${progress}%`, width: `${progress}%` }} />
                              </div>
                            </td>
                            <td>
                              <span className={`owner-health tone-${tone}`}>
                                {health === "Elite" ? <FiCheckCircle /> : health === "Stable" ? <FiTrendingUp /> : <FiAlertTriangle />}
                                {health}
                              </span>
                            </td>
                            <td>
                              <div className="owner-avatar-stack">
                                {Array.from({ length: avatars }).map((_, index) => <i key={`${name}-${index}`} />)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              <section className="owner-risk-grid">
                <RiskCard
                  action={liveRisks[0].action}
                  badge={liveRisks[0].badge}
                  classNamePrefix="owner"
                  icon={<FiAlertTriangle />}
                  text={liveRisks[0].text}
                  title={liveRisks[0].title}
                  tone="error"
                />
                <RiskCard
                  action={liveRisks[1].action}
                  badge={liveRisks[1].badge}
                  classNamePrefix="owner"
                  icon={<FiBriefcase />}
                  text={liveRisks[1].text}
                  title={liveRisks[1].title}
                  tone="secondary"
                />
              </section>
            </div>

            <aside className="owner-right-rail">
              <section className="owner-ai-panel">
                <div className="owner-ai-head">
                  <span><FiZap aria-hidden="true" /></span>
                  <div>
                  <h3>{copy.aiHub}</h3>
                    <p>{hasOverviewDashboard ? copy.aiLive : hasLiveDashboard ? copy.aiWaiting : isPreview ? copy.aiPreview : copy.aiEmpty}</p>
                  </div>
                </div>
                <div className="owner-ai-status-strip" aria-label="Dashboard status summary">
                  {liveStatusSummary.map((item) => (
                    <span className={`tone-${item.tone}`} key={item.label}>
                      <b>{item.value}</b>
                      {item.label}
                    </span>
                  ))}
                </div>
                <div className="owner-ai-suggestions">
                  {(hasOverviewDashboard || isPreview) ? aiInsights.filter((insight) => insight.scope === "company").map((insight) => (
                    <AIInsightCard classNamePrefix="owner" insight={insight} key={insight.id} />
                  )) : <p className="owner-live-empty">{copy.recommendationsEmpty}</p>}
                </div>
                {(hasOverviewDashboard || isPreview) ? (
                  <article className="owner-projection-card">
                    <span>{copy.projection}</span>
                    <h4>{copy.staffing}</h4>
                    <p>{isPreview ? copy.projectionPreview : copy.projectionLive}</p>
                    <button type="button">{copy.generateRoadmap}</button>
                  </article>
                ) : null}
              </section>
              <section className="owner-dashboard-charts">
                {projectProgress.length ? <ProjectProgressChart classNamePrefix="owner" data={projectProgress} /> : <p className="owner-live-empty">{copy.noProgress}</p>}
                {activityOverview.length ? <ActivityOverviewChart classNamePrefix="owner" data={activityOverview} /> : <p className="owner-live-empty">{copy.noActivity}</p>}
              </section>
            </aside>
          </section>
        </AppPageLayout>
        {mobileNavOpen ? (
          <div className="mobile-nav-overlay is-open" role="presentation" onClick={() => setMobileNavOpen(false)}>
            <div className="mobile-nav-panel" role="dialog" aria-label="Navigation menu" onClick={(event) => event.stopPropagation()}>
              <AppSidebar active="Dashboard" roleId={roleId} onNavigate={() => setMobileNavOpen(false)} />
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function ExecutionDashboard({ isPreview, roleId, profile, onRoleChange }) {
  const { language, label } = usePreferences();
  const copy = executionDashboardCopy[language] || executionDashboardCopy.en;
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <main className="execution-dashboard">
      <AppSidebar active="Dashboard" roleId={roleId} />
      <section className="exec-shell">
        <AppHeader classNamePrefix="exec" profile={profile} onMobileNavToggle={() => setMobileNavOpen((value) => !value)} />

        <div className="exec-page">
          <section className="manager-hub-head">
            <div className="manager-hub-title">
              <span><FiZap aria-hidden="true" /></span>
              <div>
                <h2>{copy.hub}</h2>
                <p>{copy.subtitle(label(profile.label))}</p>
              </div>
            </div>
            <div className="exec-page-actions">
              <button className="exec-secondary-button" type="button">
                <FiDownload aria-hidden="true" />
                <span>{copy.export}</span>
              </button>
              <button className="exec-primary-button" type="button">{copy.sprint}</button>
            </div>
          </section>

          {isPreview ? <RoleSwitcher activeRole={roleId} variant="exec" onRoleChange={onRoleChange} /> : null}

          <section className="manager-intel-grid">
            <section className="manager-risks-column">
              <div className="manager-section-title">
                <h3><FiAlertTriangle aria-hidden="true" />{copy.risks}</h3>
                <span>{copy.active}</span>
              </div>
              {copy.riskCards.map((risk) => <RiskSignalCard key={risk.title} {...risk} />)}
              <a className="manager-text-link" href="#/reports">{copy.riskRegister} <FiArrowRight aria-hidden="true" /></a>
            </section>

            <section className="manager-strategic-column">
              <div className="manager-section-title manager-section-title--plain">
                <h3><FiTrendingUp aria-hidden="true" />{copy.strategic}</h3>
              </div>
              <div className="manager-insight-grid">
                {copy.insights.map((insight, index) => (
                  <StrategicInsightCard
                    {...insight}
                    icon={index === 0 ? <FiBriefcase /> : <FiTrendingUp />}
                    key={insight.title}
                  />
                ))}
              </div>
            </section>

            <section className="manager-recommendations">
              <div className="manager-section-title manager-section-title--plain">
                <h3><FiZap aria-hidden="true" />{copy.recommendations}</h3>
              </div>
              <div className="manager-recommendation-grid">
                {copy.recommendationCards.map((recommendation, index) => (
                  <RecommendationCard
                    {...recommendation}
                    icon={index === 0 ? <FiArrowRight /> : index === 1 ? <FiCalendar /> : <FiUsers />}
                    key={recommendation.title}
                  />
                ))}
              </div>
            </section>
          </section>
        </div>

        <AiHelper classNamePrefix="exec" />
      </section>
    </main>
  );
}

function RiskSignalCard({ detail, level, progress, text, title, tone }) {
  return (
    <article className={`manager-risk-card tone-${tone}`}>
      <div className="manager-risk-head">
        <div>
          <h4>{title}</h4>
          <p>{detail}</p>
        </div>
        <span>{level}</span>
      </div>
      <div className="manager-risk-progress">
        <i style={{ width: `${progress}%` }} />
      </div>
      <p>{text}</p>
    </article>
  );
}

function StrategicInsightCard({ eyebrow, icon, text, title, variant }) {
  return (
    <article className="manager-strategic-card">
      <div>
        <div className="manager-card-eyebrow">
          {icon}
          <span>{eyebrow}</span>
        </div>
        <h4>{title}</h4>
        <p>{text}</p>
      </div>
      {variant === "flow" ? <FlowVisual /> : <TrendBars />}
    </article>
  );
}

function RecommendationCard({ action, detail, icon, secondaryAction, title }) {
  return (
    <article className="manager-recommendation-card">
      <span>{icon}</span>
      <div>
        <h4>{title}</h4>
        <p>{detail}</p>
        <div>
          <button type="button">{action}</button>
          <button type="button">{secondaryAction}</button>
        </div>
      </div>
    </article>
  );
}

function FlowVisual() {
  return (
    <div className="manager-flow-visual" aria-hidden="true">
      <span />
      <span />
      <span />
      <i />
    </div>
  );
}

function TrendBars() {
  return (
    <div className="manager-trend-bars" aria-hidden="true">
      {[40, 60, 55, 90].map((height) => <i style={{ height: `${height}%` }} key={height} />)}
    </div>
  );
}

function EmployeeDashboard({ authUser, isPreview, roleId, profile, onRoleChange }) {
  const { language } = usePreferences();
  const copy = employeeDashboardCopy[language] || employeeDashboardCopy.en;
  const firstName = (authUser?.name || authUser?.email || (language === "ar" ? "زميلنا" : "there")).split(/\s|@/).filter(Boolean)[0];
  const shellUser = authUser?.name || authUser?.email || profile.label;
  const [dashboard, setDashboard] = useState(null);
  const [dashboardStatus, setDashboardStatus] = useState({ loading: false, error: "" });
  const taskItems = isPreview ? copy.previewTasks : getEmployeeTasksFromDashboard(dashboard, language);
  const meetingItems = isPreview ? copy.previewMeetings : [];
  const recentFiles = isPreview ? copy.previewFiles : getEmployeeFilesFromDashboard(dashboard, language);
  const kpis = isPreview ? copy.previewKpis : getEmployeeKpisFromDashboard(dashboard, language);
  const remainingTasks = taskItems.length;
  const completionScore = getEmployeeCompletionScore(dashboard);
  const summary = isPreview ? copy.previewSummary : dashboard ? copy.liveSummary(remainingTasks) : copy.waitingSummary;
  const baseAiInsight = aiInsights.find((insight) => insight.id === "insight-employee-focus");
  const aiInsight = language === "ar" && baseAiInsight
    ? {
      ...baseAiInsight,
      actions: [{ href: "#/ai-chat", label: "افتح المساعد" }],
      scope: "شخصي",
      sources: [{ href: "#/tasks", label: "مهامك" }, { href: "#/uploads", label: "ملفاتك" }],
      summary: "أفضل فرصة لإنهاء الأولويات الحالية هي تجميع المراجعات في نافذة عمل مركّز قبل نهاية اليوم.",
      title: "نافذة تركيز مقترحة"
    }
    : baseAiInsight;
  const insightRows = isPreview ? [
    [copy.deepWork, language === "ar" ? "6.4س" : "6.4h", 74],
    [copy.taskFocus, "88%", 88],
    [copy.reviewLoad, language === "ar" ? "3 عناصر" : "3 items", 42]
  ] : [
    [copy.deepWork, "-", 0],
    [copy.taskFocus, `${completionScore}%`, completionScore],
    [copy.reviewLoad, `${taskItems.length} ${copy.items}`, clampPercent(taskItems.length * 10)]
  ];
  const scheduleRows = isPreview ? (
    language === "ar"
      ? [["8:00 ص", "الوقوف اليومي", "فريق Teamoria", "primary"], ["9:00 ص", "", "", ""], ["10:00 ص", "اللقاء الشهري", "", "secondary"], ["11:00 ص", "وقت تركيز", "", "focus"]]
      : [["8:00 AM", "Daily Standup", "Teamoria Squad", "primary"], ["9:00 AM", "", "", ""], ["10:00 AM", "Stakeholder Monthly", "", "secondary"], ["11:00 AM", "Focus Block", "", "focus"]]
  ) : [["", copy.noSchedule, "", "focus"]];

  useEffect(() => {
    if (isPreview || isDemoMode()) return;

    let isMounted = true;
    setDashboardStatus({ loading: true, error: "" });

    loadCompanyDashboard()
      .then((nextDashboard) => {
        if (!isMounted) return;
        setDashboard(nextDashboard);
        setDashboardStatus({ loading: false, error: "" });
      })
      .catch((error) => {
        if (!isMounted) return;
        setDashboard(null);
        setDashboardStatus({ loading: false, error: getDashboardErrorMessage(error, language) });
      });

    return () => {
      isMounted = false;
    };
  }, [isPreview, language]);

  return (
    <AppShell active="Dashboard" user={shellUser} role={profile.label} roleId={roleId}>
      <AppPageLayout className="employee-page">
        <div className="employee-dashboard-content">
          <section className="employee-hero-card">
            <div>
              <span className="employee-eyebrow">{copy.workspace}</span>
              <h2>{copy.welcome(firstName)}</h2>
              <p>{summary}</p>
            </div>
            <div className="employee-hero-status" aria-label={copy.statusLabel}>
              <span><FiCheckCircle aria-hidden="true" /> {copy.onTrack}</span>
              <strong>{isPreview ? "88%" : `${completionScore}%`}</strong>
              <small>{isPreview ? copy.productivityScore : copy.taskCompletion}</small>
            </div>
          </section>

          {isPreview ? <RoleSwitcher activeRole={roleId} variant="employee" onRoleChange={onRoleChange} /> : null}
          {!isPreview && dashboardStatus.loading ? <p className="dashboard-api-state">{copy.loading}</p> : null}
          {!isPreview && dashboardStatus.error ? <p className="dashboard-api-state dashboard-api-state--error">{dashboardStatus.error}</p> : null}

          <section className="employee-kpi-grid" aria-label={copy.kpiLabel}>
            {kpis.map((item, index) => {
              const Icon = item.icon;
              return (
                <article className={`employee-kpi-card tone-${item.tone}`} style={{ "--card-index": index }} key={item.label}>
                  <div className="employee-kpi-head">
                    <span><Icon aria-hidden="true" /></span>
                    <em>{item.detail}</em>
                  </div>
                  <p>{item.label}</p>
                  <strong>{item.value}</strong>
                  <div className="employee-kpi-progress" aria-label={`${item.label} ${item.progress}%`}>
                    <i style={{ width: `${item.progress}%` }} />
                  </div>
                </article>
              );
            })}
          </section>

          <section className="employee-bento-grid employee-analytics-grid">
            <article className="employee-panel employee-task-panel">
              <div className="employee-panel-head">
                <h3><FiBriefcase aria-hidden="true" />{copy.tasksToday}</h3>
                <span>{copy.remaining(remainingTasks)}</span>
              </div>
              <div className="employee-task-list">
                {!dashboardStatus.loading && taskItems.length === 0 ? <p className="tasks-empty-state">{copy.noTasks}</p> : null}
                {taskItems.map(([title, due, status, progress]) => (
                  <label className="employee-task-item" key={title}>
                    <input type="checkbox" />
                    <span>
                      <b>{title}</b>
                      <small>{due}</small>
                      <i aria-hidden="true"><span style={{ width: `${progress}%` }} /></i>
                    </span>
                    <em>{status}</em>
                  </label>
                ))}
              </div>
              <a className="employee-text-link" href="#/tasks">{copy.viewAllTasks} <FiArrowRight aria-hidden="true" /></a>
            </article>

            <article className="employee-ai-card">
              <div className="employee-ai-head">
                <span><FiZap aria-hidden="true" /></span>
                <div>
                  <h3>Teamoria AI</h3>
                  <p>{isPreview ? copy.aiPreview : copy.aiLive}</p>
                </div>
              </div>
              <div className="employee-ai-message">
                {isPreview ? (
                  <AIInsightCard
                    classNamePrefix="employee"
                    insight={aiInsight}
                  />
                ) : (
                  <p className="tasks-empty-state">{copy.noAi}</p>
                )}
              </div>
              <label className="employee-ai-input">
                <input placeholder={copy.askAi} />
                <button type="button"><FiArrowRight aria-hidden="true" /></button>
              </label>
            </article>

            <aside className="employee-side-column">
              <article className="employee-panel employee-upcoming-panel">
                <div className="employee-panel-head">
                  <h3><FiCalendar aria-hidden="true" />{copy.upcoming}</h3>
                  <span>{copy.today}</span>
                </div>
                <div className="employee-meeting-list">
                  {!isPreview && meetingItems.length === 0 ? <p className="tasks-empty-state">{copy.noMeetings}</p> : null}
                  {meetingItems.map(([time, meridiem, title, place]) => (
                    <article key={title}>
                      <time><span>{time}</span><b>{meridiem}</b></time>
                      <div>
                        <b>{title}</b>
                        <small>{place}</small>
                      </div>
                    </article>
                  ))}
                </div>
              </article>

              <article className="employee-panel employee-files-panel">
                <div className="employee-panel-head">
                  <h3><FiBookOpen aria-hidden="true" />{copy.recentFiles}</h3>
                </div>
                <div className="employee-file-list">
                  {!isPreview && recentFiles.length === 0 ? <p className="tasks-empty-state">{copy.noFiles}</p> : null}
                  {recentFiles.map(([name, meta, type]) => (
                    <article className={`file-${type}`} key={name}>
                      <span><FiBookOpen aria-hidden="true" /></span>
                      <div>
                        <b>{name}</b>
                        <small>{meta}</small>
                      </div>
                      <button type="button" aria-label={copy.moreFileActions(name)}>...</button>
                    </article>
                  ))}
                </div>
                <a className="employee-secondary-link" href="#/uploads">{copy.openUploads}</a>
              </article>
            </aside>

            <article className="employee-panel employee-insights-panel">
              <div className="employee-panel-head">
                <h3><FiTrendingUp aria-hidden="true" />{copy.productivity}</h3>
                <span>{copy.weekly}</span>
              </div>
              <div className="employee-insight-grid">
                {insightRows.map(([label, value, progress]) => (
                  <div className="employee-insight-row" key={label}>
                    <div>
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                    <i aria-hidden="true"><span style={{ width: `${progress}%` }} /></i>
                  </div>
                ))}
              </div>
            </article>

            <article className="employee-panel employee-schedule-panel">
              <div className="employee-schedule-head">
                <div>
                  <h3>{copy.schedule}</h3>
                  <span>{isPreview ? (language === "ar" ? "الجمعة، 14 يونيو" : "Friday, June 14") : copy.noSchedule}</span>
                </div>
                <div>
                  <button className="active" type="button">{copy.day}</button>
                  <button type="button">{copy.week}</button>
                  <button type="button">{copy.month}</button>
                </div>
              </div>
              <div className="employee-timeline">
                {scheduleRows.map(([time, title, subtitle, tone]) => (
                  <div className="employee-time-row" key={time}>
                    <span>{time}</span>
                    <div>
                      {title ? (
                        <article className={`tone-${tone}`}>
                          <b>{title}</b>
                          {subtitle ? <small>{subtitle}</small> : null}
                        </article>
                      ) : null}
                    </div>
                  </div>
                ))}
                <div className="employee-now-line">
                  <span>11:45</span>
                  <i />
                </div>
              </div>
            </article>
          </section>
        </div>

        <AiHelper classNamePrefix="employee" />
        <a className="employee-fab" href="#/tasks" aria-label={copy.createTask}><FiPlus aria-hidden="true" /></a>
      </AppPageLayout>
    </AppShell>
  );
}

function RoleSwitcher({ activeRole, variant, onRoleChange }) {
  const { label, language } = usePreferences();

  return (
    <div
      className={`dashboard-role-switcher dashboard-role-switcher--${variant}`}
      aria-label={language === "ar" ? "معاينة لوحة حسب الدور" : "Preview dashboard role"}
    >
      {Object.entries(roleProfiles).map(([id, role]) => (
        <button className={activeRole === id ? "active" : ""} type="button" key={id} onClick={() => onRoleChange(id)}>
          {label(role.label)}
        </button>
      ))}
    </div>
  );
}

function RiskCard({ action, badge, classNamePrefix, icon, text, title, tone }) {
  return (
    <article className={`${classNamePrefix}-risk-card tone-${tone}`}>
      <h3>{icon}{title}</h3>
      <p>{text}</p>
      <div>
        <span>{badge}</span>
        <a href="#/reports">{action}</a>
      </div>
    </article>
  );
}

function AiHelper({ classNamePrefix }) {
  const { language } = usePreferences();
  const items = language === "ar"
    ? [["المساعد", FiZap, true], ["المصادر", FiBookOpen, false], ["التوثيق", FiCheckCircle, false], ["السجل", FiClock, false]]
    : [["AI Assistant", FiZap, true], ["Ask Source", FiBookOpen, false], ["Cite", FiCheckCircle, false], ["History", FiClock, false]];

  return (
    <nav className={`${classNamePrefix}-ai-helper`} aria-label={language === "ar" ? "تنقل مساعد الذكاء" : "AI helper navigation"}>
      {items.map(([label, Icon, active]) => (
        <a className={active ? "active" : ""} href="#/ai-chat" key={label}>
          <Icon aria-hidden="true" />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}

async function loadCompanyDashboard() {
  try {
    const payload = await getCompanyDashboard();
    const dashboard = normalizeCompanyDashboardPayload(payload);
    if (dashboard) return dashboard;
  } catch (error) {
    const fallbackDashboard = await loadCompanyDashboardFallback();
    if (fallbackDashboard) return fallbackDashboard;
    throw error;
  }

  const fallbackDashboard = await loadCompanyDashboardFallback();
  if (fallbackDashboard) return fallbackDashboard;

  return null;
}

async function loadCompanyDashboardFallback() {
  const [projectsResult, staffResult, tasksResult, uploadsResult] = await Promise.allSettled([
    listCompanyProjects({ page: 1 }),
    listStaff({ page: 1 }),
    listTasks({ role: "company_owner", per_page: 50 }),
    listUploads({ per_page: 5 })
  ]);

  const projects = getRowsFromSettledPayload(projectsResult, ["projects"]);
  const staff = getRowsFromSettledPayload(staffResult, ["staff", "users"]);
  const tasks = getRowsFromSettledPayload(tasksResult, ["tasks"]);
  const uploads = getRowsFromSettledPayload(uploadsResult, ["uploads", "files"]);

  if (!projects.length && !staff.length && !tasks.length && !uploads.length) {
    return null;
  }

  return {
    totals: {
      projects: getTotalFromSettledPayload(projectsResult, projects.length),
      users: getTotalFromSettledPayload(staffResult, staff.length),
      tasks: getTotalFromSettledPayload(tasksResult, tasks.length),
      overdue_tasks: tasks.filter(isOverdueTask).length
    },
    project_statuses: countByStatus(projects, "active"),
    task_statuses: countByStatus(tasks, "todo"),
    recent_projects: projects,
    upcoming_tasks: tasks.filter((task) => String(task.status || "") !== "done").slice(0, 5),
    recent_uploads: uploads,
    source: "fallback"
  };
}

function normalizeCompanyDashboardPayload(payload) {
  const data = getPayloadData(payload);
  const dashboard = data?.dashboard || data?.company_dashboard || data?.overview || data;
  return hasDashboardData(dashboard) ? dashboard : null;
}

function hasDashboardData(dashboard) {
  if (!dashboard || typeof dashboard !== "object") return false;

  return Boolean(
    hasObjectValues(dashboard.totals) ||
    hasObjectValues(dashboard.project_statuses) ||
    hasObjectValues(dashboard.task_statuses) ||
    normalizeCollection(dashboard.recent_projects).length ||
    normalizeCollection(dashboard.upcoming_tasks).length ||
    normalizeCollection(dashboard.recent_uploads || dashboard.uploads || dashboard.recent_files).length
  );
}

function hasObjectValues(value) {
  return Boolean(value && typeof value === "object" && Object.values(value).some((item) => Number(item || 0) > 0));
}

function getDashboardErrorMessage(error, language = "en") {
  const message = error?.message || "";

  if (/unexpected error occurred/i.test(message)) {
    if (language === "ar") {
      return "أعادت واجهة لوحة الشركة خطأ من الخادم. المشاريع والمهام والملفات قد تعمل، لكن نقطة overview تحتاج بيانات أو إصلاحًا من الباك اند.";
    }

    return "Company dashboard API returned a server error. Projects, tasks, and uploads may still work, but the overview endpoint needs backend data or a backend fix.";
  }

  return message || (language === "ar" ? "تعذر تحميل بيانات لوحة التحكم." : "Unable to load dashboard data.");
}

function getRowsFromSettledPayload(result, keys) {
  if (result.status !== "fulfilled") return [];
  return extractDashboardRows(getPayloadData(result.value), keys);
}

function getTotalFromSettledPayload(result, fallback) {
  if (result.status !== "fulfilled") return fallback;
  const data = getPayloadData(result.value);
  return Number(data?.pagination?.total || data?.meta?.total || result.value?.pagination?.total || fallback || 0);
}

function extractDashboardRows(data, keys) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(data?.data?.[key])) return data.data[key];
  }

  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function countByStatus(items, defaultStatus) {
  return items.reduce((counts, item) => {
    const status = String(item.status || defaultStatus);
    counts[status] = Number(counts[status] || 0) + 1;
    return counts;
  }, {});
}

function isOverdueTask(task) {
  if (!task?.due_date || String(task.status || "") === "done") return false;
  const dueDate = new Date(task.due_date);
  return !Number.isNaN(dueDate.getTime()) && dueDate < new Date();
}

function localizeDashboardLabel(value, language) {
  return language === "ar" ? dashboardArabicLabels[value] || value : value;
}

function localizeDashboardMetric(metric, language) {
  if (language !== "ar") return metric;
  return {
    ...metric,
    label: localizeDashboardLabel(metric.label, language),
    detail: localizeDashboardLabel(metric.detail, language)
  };
}

function localizeDashboardTeam(team, language) {
  if (language !== "ar") return team;
  const next = [...team];
  next[2] = localizeDashboardLabel(next[2], language);
  next[4] = localizeDashboardLabel(next[4], language);
  return next;
}

function getOwnerMetricsFromDashboard(dashboard) {
  if (!dashboard?.totals) return getEmptyOwnerMetrics();

  const totals = dashboard.totals;
  const projectStatuses = dashboard.project_statuses || {};
  const taskStatuses = dashboard.task_statuses || {};
  const completedProjects = Number(projectStatuses.completed || 0);
  const totalProjects = Number(totals.projects || 0);
  const doneTasks = Number(taskStatuses.done || 0);
  const totalTasks = Number(totals.tasks || 0);
  const activeProjects = Number(projectStatuses.active || 0);
  const health = totalProjects ? Math.round((completedProjects / totalProjects) * 100) : 0;
  const taskCompletion = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return [
    {
      label: "Company Projects",
      value: formatNumber(totals.projects),
      detail: `${activeProjects} active`,
      icon: FiBriefcase,
      tone: "primary",
      progress: clampPercent(totalProjects ? (activeProjects / totalProjects) * 100 : 0)
    },
    {
      label: "Project Health",
      value: `${health}%`,
      detail: `${completedProjects} completed`,
      icon: FiShield,
      tone: "secondary",
      progress: health
    },
    {
      label: "Company Workforce",
      value: formatNumber(totals.users),
      detail: "Company users",
      icon: FiUsers,
      tone: "neutral",
      progress: clampPercent(Number(totals.users || 0) * 8)
    },
    {
      label: "Task Completion",
      value: `${taskCompletion}%`,
      detail: `${formatNumber(totals.overdue_tasks)} overdue`,
      icon: FiZap,
      tone: Number(totals.overdue_tasks || 0) ? "alert" : "ai",
      progress: taskCompletion
    }
  ];
}

function getEmptyOwnerMetrics() {
  return [
    { label: "Company Projects", value: "0", detail: "No projects returned", icon: FiBriefcase, tone: "primary", progress: 0 },
    { label: "Project Health", value: "0%", detail: "No completed projects", icon: FiShield, tone: "secondary", progress: 0 },
    { label: "Company Workforce", value: "0", detail: "No users returned", icon: FiUsers, tone: "neutral", progress: 0 },
    { label: "Task Completion", value: "0%", detail: "No tasks returned", icon: FiZap, tone: "ai", progress: 0 }
  ];
}

function getEmployeeKpisFromDashboard(dashboard, language = "en") {
  const totals = dashboard?.totals || {};
  const taskStatuses = dashboard?.task_statuses || {};
  const totalTasks = Number(totals.tasks || 0);
  const doneTasks = Number(taskStatuses.done || 0);
  const upcomingTasks = normalizeCollection(dashboard?.upcoming_tasks);
  const completion = getEmployeeCompletionScore(dashboard);
  const ar = language === "ar";

  return [
    { label: ar ? "مهام اليوم" : "Tasks Today", value: formatNumber(upcomingTasks.length), detail: ar ? "من لوحة الشركة" : "From company dashboard", icon: FiClock, progress: clampPercent(upcomingTasks.length * 12), tone: "primary" },
    { label: ar ? "المهام المنجزة" : "Completed Tasks", value: formatNumber(doneTasks), detail: ar ? "مهام مكتملة" : "Done tasks", icon: FiCheckCircle, progress: completion, tone: "success" },
    { label: ar ? "إنجاز المهام" : "Task Completion", value: `${completion}%`, detail: ar ? `${formatNumber(totalTasks)} إجمالي المهام` : `${formatNumber(totalTasks)} total tasks`, icon: FiTrendingUp, progress: completion, tone: "score" },
    { label: ar ? "الاجتماعات القادمة" : "Upcoming Meetings", value: "0", detail: ar ? "لم تصل واجهة الاجتماعات" : "No meetings API returned", icon: FiCalendar, progress: 0, tone: "meeting" }
  ];
}

function getEmployeeTasksFromDashboard(dashboard, language = "en") {
  return normalizeCollection(dashboard?.upcoming_tasks).slice(0, 5).map((task) => {
    const status = formatTaskStatus(task.status || task.priority || "todo", language);
    return [
      task.title || (language === "ar" ? "مهمة بدون عنوان" : "Untitled task"),
      task.due_date ? `${language === "ar" ? "الموعد" : "Due"} ${formatDate(task.due_date)}` : (language === "ar" ? "بلا موعد نهائي" : "No deadline"),
      status,
      getTaskProgress(task)
    ];
  });
}

function getEmployeeFilesFromDashboard(dashboard, language = "en") {
  const files = normalizeCollection(dashboard?.recent_uploads || dashboard?.uploads || dashboard?.recent_files);

  return files.slice(0, 5).map((file) => [
    file.original_name || file.file_name || file.name || (language === "ar" ? "ملف بدون اسم" : "Untitled file"),
    file.updated_at || file.created_at
      ? `${language === "ar" ? "عُدّل" : "Modified"} ${formatDate(file.updated_at || file.created_at)}`
      : (language === "ar" ? "لا يوجد تاريخ تعديل" : "No modified date"),
    getFileTone(file)
  ]);
}

function getEmployeeCompletionScore(dashboard) {
  const statuses = dashboard?.task_statuses || {};
  const total = Number(dashboard?.totals?.tasks || Object.values(statuses).reduce((sum, value) => sum + Number(value || 0), 0));
  const done = Number(statuses.done || 0);
  return total ? clampPercent((done / total) * 100) : 0;
}

function getTaskProgress(task) {
  if (task.progress !== undefined) return clampPercent(task.progress);
  if (task.status === "done") return 100;
  if (task.status === "review") return 80;
  if (task.status === "in_progress") return 55;
  if (task.status === "blocked") return 20;
  return 0;
}

function getFileTone(file) {
  const type = String(file.file_type || file.category || file.original_name || file.file_name || "").toLowerCase();
  if (type.includes("sheet") || type.includes("xls")) return "sheet";
  if (type.includes("report")) return "report";
  return "doc";
}

function getOwnerTeamsFromDashboard(dashboard) {
  const projects = normalizeCollection(dashboard?.recent_projects);
  if (!projects.length) return [];

  return projects.slice(0, 5).map((project, index) => {
    const progress = Number(project.progress ?? 0);
    const status = String(project.status || "active");
    const tone = getProjectTone(status, progress);
    return [
      getProjectCode(project.name, index),
      project.name || "Untitled Project",
      project.company?.name || "Company workspace",
      `${progress || 0}%`,
      formatProjectHealth(status, progress),
      tone,
      Math.min(4, Math.max(1, Number(project.users?.length || 1))),
      clampPercent(progress)
    ];
  });
}

function getOwnerRisksFromDashboard(dashboard) {
  const upcomingTasks = normalizeCollection(dashboard?.upcoming_tasks);
  const overdueCount = Number(dashboard?.totals?.overdue_tasks || 0);
  const firstTask = upcomingTasks[0];
  const secondTask = upcomingTasks[1];

  return [
    {
      action: "Open Tasks",
      badge: overdueCount ? `${overdueCount} Overdue` : "Upcoming",
      title: overdueCount ? "Overdue Task Risk" : "Upcoming Task Focus",
      text: firstTask
        ? `${firstTask.title} is due ${formatDate(firstTask.due_date)} in ${firstTask.project?.name || "company workspace"}.`
        : "No upcoming tasks returned by the dashboard API."
    },
    {
      action: "Review Projects",
      badge: secondTask ? formatTaskStatus(secondTask.status) : "Live API",
      title: secondTask ? "Next Delivery Item" : "Project Coverage",
      text: secondTask
        ? `${secondTask.title} is currently ${formatTaskStatus(secondTask.status).toLowerCase()} and assigned to ${formatAssigneeList(secondTask.assignees)}.`
        : "Recent projects and status charts are synced from the company dashboard endpoint."
    }
  ];
}

function getProjectProgressFromDashboard(dashboard) {
  const projects = normalizeCollection(dashboard?.recent_projects);
  if (!projects.length) return [];

  return projects.slice(0, 5).map((project) => ({
    label: project.name || "Project",
    value: clampPercent(Number(project.progress ?? (project.status === "completed" ? 100 : 0)))
  }));
}

function getActivityOverviewFromDashboard(dashboard) {
  const statuses = dashboard?.task_statuses;
  if (!statuses) return [];

  const rows = [
    ["Todo", statuses.todo],
    ["Progress", statuses.in_progress],
    ["Blocked", statuses.blocked],
    ["Done", statuses.done]
  ];
  const maxValue = Math.max(...rows.map(([, value]) => Number(value || 0)), 1);

  return rows.map(([label, value]) => ({
    label,
    value: Math.round((Number(value || 0) / maxValue) * 100)
  }));
}

function getStatusSummaryFromDashboard(dashboard) {
  const statuses = dashboard?.task_statuses || {};

  return [
    { label: "Todo", value: formatNumber(statuses.todo), tone: "neutral" },
    { label: "In progress", value: formatNumber(statuses.in_progress), tone: "primary" },
    { label: "Blocked", value: formatNumber(statuses.blocked), tone: "danger" },
    { label: "Done", value: formatNumber(statuses.done), tone: "success" }
  ];
}

function normalizeCollection(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

function getProjectCode(name, index) {
  const letters = String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
  return letters || `P${index + 1}`;
}

function getProjectTone(status, progress) {
  if (status === "completed" || progress >= 80) return "primary";
  if (status === "active" || progress >= 45) return "green";
  return "amber";
}

function formatProjectHealth(status, progress) {
  if (status === "completed" || progress >= 80) return "Elite";
  if (status === "active" || progress >= 45) return "Stable";
  return "Caution";
}

function formatTaskStatus(status, language = "en") {
  const normalized = String(status || "todo");
  const arabicStatuses = {
    active: "نشطة",
    blocked: "متوقفة",
    completed: "مكتملة",
    done: "منجزة",
    high: "عالية",
    in_progress: "قيد التنفيذ",
    low: "منخفضة",
    medium: "متوسطة",
    review: "مراجعة",
    todo: "للبدء"
  };

  if (language === "ar" && arabicStatuses[normalized]) return arabicStatuses[normalized];

  return normalized
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatAssigneeList(assignees) {
  const list = normalizeCollection(assignees);
  if (!list.length) return "the team";
  return list.map((assignee) => assignee.name || assignee.email).filter(Boolean).slice(0, 2).join(", ") || "the team";
}

function formatDate(value) {
  if (!value) return "soon";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, Math.round(Number(value || 0))));
}

function getDashboardRole() {
  const params = getHashSearchParams();
  const hashRole = params.get("role");
  const urlRole = new URLSearchParams(window.location.search).get("role");
  const storedRole = localStorage.getItem("teamoria_preview_role");
  const role = mapDemoRoleToDashboardRole(hashRole || urlRole) || storedRole || "project-manager";
  return roleProfiles[role] ? role : "project-manager";
}

function mapDemoRoleToDashboardRole(role) {
  const normalizedRole = String(role || "").toLowerCase();

  if (["admin", "owner", "company-admin", "company_admin", "company-owner", "company_owner"].includes(normalizedRole)) return "owner";
  if (["manager", "general-manager", "general_manager"].includes(normalizedRole)) return "general-manager";
  if (["project-manager", "project_manager"].includes(normalizedRole)) return "project-manager";
  if (["employee", "member", "company_member"].includes(normalizedRole)) return "employee";
  return "";
}

function mapApiRoleToDashboardRole(role) {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === "company_owner") return "owner";
  if (normalizedRole === "company_manager") return "general-manager";
  if (normalizedRole === "company_member") return "employee";
  return "";
}
