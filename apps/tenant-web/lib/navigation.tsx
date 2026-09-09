import type { NavItem } from "@/features/auth/components";
import type { OrgLabels } from "@/features/orgLabels/constants";

/** Non-label entries stay static; the Program entry's label is org-type-driven. */
export function buildHostNav(labels: OrgLabels): NavItem[] {
  return [
    { label: "Overview", href: "/host/dashboard" },
    { label: "Exams", href: "/host/exams" },
    { label: labels.program, href: "/host/programs" },
  ];
}
