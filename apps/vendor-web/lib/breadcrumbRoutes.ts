/** Inbox detail and the legacy exam-template alias have no matching sidebar item. */
export const BREADCRUMB_PARENT_ROUTES = [
  { prefix: "/admin/score-template", href: "/admin/exam-template", labelKey: "nav.examTemplates" },
] as const;

/** Sidebar pages that, opened from another page (named by a query parameter), get a breadcrumb back to it. */
export const BREADCRUMB_QUERY_PARENT_ROUTES = [
  {
    path: "/admin/audit-log",
    param: "from",
    value: "platform-users",
    href: "/admin/platform-users",
    labelKey: "nav.platformUsers",
  },
] as const;
