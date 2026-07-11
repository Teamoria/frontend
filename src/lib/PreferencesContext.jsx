import { createContext, useContext, useEffect, useMemo, useState } from "react";

const LANGUAGE_KEY = "teamoria_language";
const THEME_KEY = "teamoria_theme";

const copy = {
  ar: {
    languageName: "العربية",
    switchLanguage: "التبديل إلى الإنجليزية",
    switchTheme: "تبديل المظهر",
    lightTheme: "الوضع الفاتح",
    darkTheme: "الوضع الداكن",
    navigation: "التنقل في مساحة العمل",
    workspace: "مساحة العمل",
    management: "الإدارة",
    ai: "الذكاء الاصطناعي",
    account: "الحساب",
    tools: "الأدوات",
    newProject: "مشروع جديد",
    search: "ابحث في مساحة العمل…",
    searchHint: "بحث سريع",
    notifications: "الإشعارات",
    markAllRead: "تحديد الكل كمقروء",
    viewAllNotifications: "عرض كل الإشعارات",
    noNotifications: "لا توجد إشعارات بعد",
    notificationEmptyText: "ستظهر هنا تحديثات المهام والملفات ونشاط المساعد الذكي.",
    notificationError: "تعذر تحميل الإشعارات",
    retry: "إعادة المحاولة",
    profile: "الملف الشخصي",
    signOut: "تسجيل الخروج",
    openNavigation: "فتح قائمة التنقل",
    openAccount: "فتح قائمة الحساب",
    realtimeConnected: "متصل لحظيًا",
    realtimeConnecting: "جارٍ الاتصال",
    realtimeUnavailable: "التحديث اللحظي غير مفعّل",
    realtimeDisconnected: "الاتصال اللحظي متوقف",
    today: "اليوم",
    yesterday: "أمس",
    earlier: "سابقًا",
    live: "مباشر"
  },
  en: {
    languageName: "English",
    switchLanguage: "Switch to Arabic",
    switchTheme: "Switch theme",
    lightTheme: "Light mode",
    darkTheme: "Dark mode",
    navigation: "Workspace navigation",
    workspace: "Workspace",
    management: "Management",
    ai: "AI",
    account: "Account",
    tools: "Tools",
    newProject: "New project",
    search: "Search your workspace…",
    searchHint: "Quick search",
    notifications: "Notifications",
    markAllRead: "Mark all as read",
    viewAllNotifications: "View all notifications",
    noNotifications: "No notifications yet",
    notificationEmptyText: "Task, file, and AI activity updates will appear here.",
    notificationError: "Could not load notifications",
    retry: "Retry",
    profile: "Profile",
    signOut: "Sign out",
    openNavigation: "Open navigation menu",
    openAccount: "Open account menu",
    realtimeConnected: "Live connection",
    realtimeConnecting: "Connecting",
    realtimeUnavailable: "Realtime is not configured",
    realtimeDisconnected: "Realtime is offline",
    today: "Today",
    yesterday: "Yesterday",
    earlier: "Earlier",
    live: "Live"
  }
};

const arabicLabels = {
  "Dashboard": "نظرة عامة",
  "Employees": "الفريق",
  "Projects": "المشاريع",
  "Tasks": "المهام",
  "My Tasks": "مهامي",
  "Meetings": "الاجتماعات",
  "Workspace": "مساحة العمل",
  "Upload Center": "مركز الملفات",
  "Shared Files": "الملفات المشتركة",
  "AI Chat": "مساعد Teamoria",
  "Agent Runs": "عمليات الوكلاء",
  "Workspace Graph": "خريطة المعرفة",
  "Reports": "التقارير",
  "Team Performance": "أداء الفريق",
  "Profile": "الملف الشخصي",
  "Notifications": "الإشعارات",
  "Super Admin": "إدارة المنصة",
  "Companies": "الشركات",
  "Users": "المستخدمون",
  "Payments": "المدفوعات",
  "Company Owner": "مالك الشركة",
  "Company Manager": "مدير الشركة",
  "Company Member": "عضو في الشركة",
  "Project Manager": "مدير مشروع",
  "General Manager": "المدير العام",
  "Employee": "موظف",
  "Platform Admin": "مدير المنصة",
  "Workspace Member": "عضو في مساحة العمل",
  "Teamoria User": "مستخدم Teamoria"
};

const PreferencesContext = createContext({
  language: "ar",
  direction: "rtl",
  theme: "system",
  resolvedTheme: "light",
  setLanguage: () => {},
  toggleLanguage: () => {},
  setTheme: () => {},
  toggleTheme: () => {},
  t: (key) => copy.ar[key] || key,
  label: (value) => arabicLabels[value] || value
});

function readPreference(key, fallback) {
  if (typeof window === "undefined") return fallback;

  try {
    return window.localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function getSystemTheme() {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function PreferencesProvider({ children }) {
  const [language, setLanguageState] = useState(() => readPreference(LANGUAGE_KEY, "ar"));
  const [theme, setThemeState] = useState(() => readPreference(THEME_KEY, "system"));
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);
  const resolvedTheme = theme === "system" ? systemTheme : theme;
  const direction = language === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!media) return undefined;

    const updateSystemTheme = (event) => setSystemTheme(event.matches ? "dark" : "light");
    media.addEventListener?.("change", updateSystemTheme);
    return () => media.removeEventListener?.("change", updateSystemTheme);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = language;
    root.dir = direction;
    root.dataset.theme = resolvedTheme;
    root.dataset.themePreference = theme;
    root.style.colorScheme = resolvedTheme;
  }, [direction, language, resolvedTheme, theme]);

  function setLanguage(nextLanguage) {
    const normalized = nextLanguage === "en" ? "en" : "ar";
    setLanguageState(normalized);
    try {
      window.localStorage.setItem(LANGUAGE_KEY, normalized);
    } catch {
      // Preferences still work for the current page when storage is unavailable.
    }
  }

  function setTheme(nextTheme) {
    const normalized = ["light", "dark", "system"].includes(nextTheme) ? nextTheme : "system";
    setThemeState(normalized);
    try {
      window.localStorage.setItem(THEME_KEY, normalized);
    } catch {
      // Preferences still work for the current page when storage is unavailable.
    }
  }

  function toggleLanguage() {
    setLanguage(language === "ar" ? "en" : "ar");
  }

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  const value = useMemo(() => ({
    language,
    direction,
    theme,
    resolvedTheme,
    setLanguage,
    toggleLanguage,
    setTheme,
    toggleTheme,
    t: (key) => copy[language]?.[key] || copy.en[key] || key,
    label: (valueToTranslate) => language === "ar" ? arabicLabels[valueToTranslate] || valueToTranslate : valueToTranslate
  }), [direction, language, resolvedTheme, theme]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  return useContext(PreferencesContext);
}
