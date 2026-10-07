"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

export type Locale = "vi" | "en";

export const LOCALE_STORAGE_KEY = "pte-web.locale";

type MessageValues = Record<string, string | number>;
type Messages = Record<string, string>;

const COMMON_MESSAGES: Record<Locale, Messages> = {
  vi: {
    "common.language": "Ngôn ngữ",
    "common.vietnamese": "Tiếng Việt",
    "common.english": "English",
    "common.notifications": "Thông báo",
    "common.account": "Tài khoản",
    "common.logout": "Đăng xuất",
    "common.options": "Tùy chọn",
    "common.openMenu": "Mở menu",
    "common.closeMenu": "Đóng menu",
    "common.collapseNavigation": "Thu gọn thanh điều hướng",
    "common.expandNavigation": "Mở rộng thanh điều hướng",
    "common.lightTheme": "Giao diện sáng",
    "common.darkTheme": "Giao diện tối",
    "common.collapse": "Thu gọn",
    "common.expand": "Mở rộng",
    "common.close": "Đóng",
    "common.sections": "Các khu vực",
    "common.forbiddenTitle": "Bạn không có quyền truy cập",
    "common.forbiddenDescription": "Tài khoản hiện tại không được phép thực hiện thao tác này.",
    "common.markAllRead": "Đánh dấu đã đọc",
    "common.viewAllNotifications": "Xem tất cả thông báo",
    "common.notificationsUnavailable": "Không thể tải thông báo",
    "common.retry": "Thử lại",
    "common.noNotifications": "Chưa có thông báo",
    "common.allCaughtUp": "Bạn đã xem hết thông báo",
    "brand.adminSubtitle": "Hệ thống quản trị",
    "brand.schoolSubtitle": "Cổng tổ chức",
    "common.disclaimer": "Nền tảng thi thử PTE. Không liên kết với Pearson.",
    "tenant.tabs.summary": "Tổng quan",
    "tenant.tabs.account": "Tài khoản đăng nhập",
    "tenant.tabs.organizations": "Tổ chức",
    "tenant.examTabs.overview": "Tổng quan",
    "tenant.examTabs.settings": "Cài đặt kỳ thi",
    "tenant.examTabs.participants": "Người dự thi & coi thi",
    "tenant.examTabs.submissions": "Bài nộp",
    "tenant.examTabs.examiner": "Examiner",
    "tenant.examTabs.results": "Kết quả & phát hành",
    "tenant.examTabs.ariaLabel": "Các khu vực của kỳ thi",
    "tenant.examDetails.examWindow": "Thời gian thi",
    "tenant.examDetails.capacity": "Sức chứa",
    "tenant.examDetails.schedule": "Lịch thi",
    "tenant.examDetails.opensAt": "Bắt đầu",
    "tenant.examDetails.closesAt": "Kết thúc",
    "nav.home": "Trang chủ",
    "nav.overview": "Tổng quan",
    "nav.tenants": "Tenant",
    "nav.commercial": "Thương mại",
    "nav.content": "Nội dung",
    "nav.support": "Hỗ trợ",
    "nav.applications": "Đơn đăng ký",
    "nav.planCatalog": "Danh mục gói",
    "nav.licenseCodes": "Mã bản quyền",
    "nav.platformSettings": "Cài đặt nền tảng",
    "nav.announcements": "Thông báo chung",
    "nav.questionBank": "Ngân hàng câu hỏi",
    "nav.taskTypes": "Danh mục dạng bài",
    "nav.examTemplates": "Mẫu bài thi",
    "nav.supportTickets": "Yêu cầu hỗ trợ",
    "nav.users": "Người dùng",
    "nav.delivery": "Vận hành",
    "nav.account": "Tài khoản",
    "nav.data": "Dữ liệu",
    "nav.learners": "Học viên",
    "nav.examStaff": "Nhân sự kỳ thi",
    "nav.exams": "Kỳ thi",
    "nav.plansBilling": "Gói và thanh toán",
    "nav.auditLog": "Nhật ký audit",
    "nav.examiner": "Examiner",
    "nav.markingQueue": "Hàng đợi chấm",
    "nav.student": "Học viên",
    "nav.myResults": "Kết quả của tôi",
  },
  en: {
    "common.language": "Language",
    "common.vietnamese": "Vietnamese",
    "common.english": "English",
    "common.notifications": "Notifications",
    "common.account": "Account",
    "common.logout": "Log out",
    "common.options": "Options",
    "common.openMenu": "Open menu",
    "common.closeMenu": "Close menu",
    "common.collapseNavigation": "Collapse navigation",
    "common.expandNavigation": "Expand navigation",
    "common.lightTheme": "Light theme",
    "common.darkTheme": "Dark theme",
    "common.collapse": "Collapse",
    "common.expand": "Expand",
    "common.close": "Close",
    "common.sections": "Sections",
    "common.forbiddenTitle": "You do not have access",
    "common.forbiddenDescription": "The current account is not allowed to perform this action.",
    "common.markAllRead": "Mark all read",
    "common.viewAllNotifications": "View all notifications",
    "common.notificationsUnavailable": "Notifications unavailable",
    "common.retry": "Retry",
    "common.noNotifications": "No notifications",
    "common.allCaughtUp": "You are all caught up",
    "brand.adminSubtitle": "Admin System",
    "brand.schoolSubtitle": "Organization Portal",
    "common.disclaimer": "PTE mock exam platform. Not affiliated with Pearson.",
    "tenant.tabs.summary": "Summary",
    "tenant.tabs.account": "Login account",
    "tenant.tabs.organizations": "Organizations",
    "tenant.examTabs.overview": "Overview",
    "tenant.examTabs.settings": "Exam settings",
    "tenant.examTabs.participants": "Participants & proctors",
    "tenant.examTabs.submissions": "Submissions",
    "tenant.examTabs.examiner": "Examiner",
    "tenant.examTabs.results": "Results & publication",
    "tenant.examTabs.ariaLabel": "Exam sections",
    "tenant.examDetails.examWindow": "Exam window",
    "tenant.examDetails.capacity": "Capacity",
    "tenant.examDetails.schedule": "Schedule",
    "tenant.examDetails.opensAt": "Opens at",
    "tenant.examDetails.closesAt": "Closes at",
    "nav.home": "Home",
    "nav.overview": "Overview",
    "nav.tenants": "Tenants",
    "nav.commercial": "Commercial",
    "nav.content": "Content",
    "nav.support": "Support",
    "nav.applications": "Applications",
    "nav.planCatalog": "Plan catalog",
    "nav.licenseCodes": "License codes",
    "nav.platformSettings": "Platform settings",
    "nav.announcements": "Announcements",
    "nav.questionBank": "Question Bank",
    "nav.taskTypes": "Task Type Catalog",
    "nav.examTemplates": "Exam Templates",
    "nav.supportTickets": "Support Tickets",
    "nav.users": "Users",
    "nav.delivery": "Delivery",
    "nav.account": "Account",
    "nav.data": "Data",
    "nav.learners": "Learners",
    "nav.examStaff": "Exam Staff",
    "nav.exams": "Exams",
    "nav.plansBilling": "Plans & billing",
    "nav.auditLog": "Audit Log",
    "nav.examiner": "Examiner",
    "nav.markingQueue": "Marking queue",
    "nav.student": "Student",
    "nav.myResults": "My results",
  },
};

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string, values?: MessageValues) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const readStoredLocale = (): Locale => {
  if (typeof window === "undefined") return "vi";
  try {
    return window.localStorage.getItem(LOCALE_STORAGE_KEY) === "en" ? "en" : "vi";
  } catch {
    return "vi";
  }
};

const interpolate = (message: string, values?: MessageValues): string =>
  values
    ? message.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`))
    : message;

export const LocaleProvider = ({ children }: { children: ReactNode }): ReactElement => {
  const [locale, setLocaleState] = useState<Locale>("vi");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const storedLocale = readStoredLocale();
    setLocaleState(storedLocale);
    document.documentElement.lang = storedLocale;
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    document.documentElement.lang = locale;
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // Storage can be disabled in private or embedded browser contexts.
    }
  }, [isHydrated, locale]);

  const setLocale = useCallback((nextLocale: Locale): void => {
    setLocaleState(nextLocale);
  }, []);

  const t = useCallback(
    (key: string, fallback?: string, values?: MessageValues): string =>
      interpolate(COMMON_MESSAGES[locale][key] ?? fallback ?? key, values),
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export const useLocale = (): LocaleContextValue => {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useLocale must be used inside LocaleProvider");
  return value;
};
