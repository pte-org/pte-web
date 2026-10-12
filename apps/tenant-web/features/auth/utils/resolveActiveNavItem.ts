import type { NavItem } from "../components/DashboardChrome";

export function resolveActiveNavItem(
  navItems: NavItem[],
  pathname: string | null,
  searchParams: URLSearchParams | null,
): string | null {
  if (!pathname) return null;

  // 1. Host program -> classes override
  if (pathname.includes("/classes/") || pathname.endsWith("/classes")) {
    const classItem = navItems.find((item) => item.href === "/host/classes");
    if (classItem) return classItem.href;
  }

  // 2. Proctor detail routes
  if (pathname.startsWith("/proctor/attendance")) {
    const attendanceItem = navItems.find((item) => item.href === "/proctor/attendance");
    if (attendanceItem) return attendanceItem.href;
  }

  if (pathname.startsWith("/proctor/audit-log")) {
    const auditItem = navItems.find((item) => item.href === "/proctor/audit-log");
    if (auditItem) return auditItem.href;
  }

  if (pathname.startsWith("/proctor/sessions/") && pathname !== "/proctor/sessions") {
    const monitoringItem = navItems.find((item) => item.href === "/proctor/sessions?scope=ACCESSIBLE");
    if (monitoringItem) return monitoringItem.href;
    const overviewItem = navItems.find((item) => item.href === "/proctor/sessions");
    if (overviewItem) return overviewItem.href;
  }

  // 3. Examiner detail routes
  if (pathname.startsWith("/examiner/work/") && pathname !== "/examiner/work") {
    const fromStatus = searchParams?.get("fromStatus");
    if (fromStatus && ["PENDING", "IN_PROGRESS", "COMPLETED"].includes(fromStatus)) {
      const match = navItems.find((item) => item.href === `/examiner/work?status=${fromStatus}`);
      if (match) return match.href;
    }
    const overviewItem = navItems.find((item) => item.href === "/examiner/work");
    if (overviewItem) return overviewItem.href;
  }

  // 4. Query-aware exact pathname matches
  if (pathname === "/proctor/sessions") {
    const scope = searchParams?.get("scope");
    if (scope === "ACCESSIBLE") {
      const accessibleItem = navItems.find((item) => item.href === "/proctor/sessions?scope=ACCESSIBLE");
      if (accessibleItem) return accessibleItem.href;
    }
    const overviewItem = navItems.find((item) => item.href === "/proctor/sessions");
    if (overviewItem) return overviewItem.href;
  }

  if (pathname === "/examiner/work") {
    const status = searchParams?.get("status");
    if (status && ["PENDING", "IN_PROGRESS", "COMPLETED"].includes(status)) {
      const statusItem = navItems.find((item) => item.href === `/examiner/work?status=${status}`);
      if (statusItem) return statusItem.href;
    }
    const overviewItem = navItems.find((item) => item.href === "/examiner/work");
    if (overviewItem) return overviewItem.href;
  }

  // 5. General prefix match (longest prefix wins, ignoring query strings)
  let bestMatch: NavItem | null = null;
  let bestMatchLength = -1;

  for (const item of navItems) {
    const itemPath = item.href.split("?")[0];
    if (itemPath === "/") {
      if (pathname === "/" && bestMatchLength < 1) {
        bestMatch = item;
        bestMatchLength = 1;
      }
      continue;
    }

    if (itemPath === "/host/programs" && (pathname.includes("/classes/") || pathname.endsWith("/classes"))) {
      continue;
    }

    if (pathname.startsWith(itemPath)) {
      if (itemPath.length > bestMatchLength) {
        bestMatch = item;
        bestMatchLength = itemPath.length;
      }
    }
  }

  return bestMatch?.href ?? null;
}
