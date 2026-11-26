/** Detail routes whose parent page is opened outside the sidebar. */
export const BREADCRUMB_PARENT_ROUTES = [
  { prefix: "/host/notifications", href: "/host/notifications", labelKey: "common.notifications" },
  { prefix: "/host/checkout", href: "/host/billing", labelKey: "nav.plansBilling" },
] as const;
