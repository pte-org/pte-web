/** Inbox detail and the legacy exam-template alias have no matching sidebar item. */
export const BREADCRUMB_PARENT_ROUTES = [
  { prefix: "/admin/notifications", href: "/admin/notifications", labelKey: "common.notifications" },
  { prefix: "/admin/score-template", href: "/admin/exam-template", labelKey: "nav.examTemplates" },
] as const;
