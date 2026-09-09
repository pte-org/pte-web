"use client";

import { DashboardChrome } from "@/features/auth/components";
import { HOST_ROLES } from "@/features/auth/constants";
import { useOrgLabels } from "@/features/orgLabels/useOrgLabels";
import { buildHostNav } from "@/lib/navigation";

/**
 * Skeleton only — Phase 7 of `ninh-multi-type-organization` fills in the
 * real Program/Class CRUD UI. Establishes the pattern later phases
 * continue: section headings sourced from `useOrgLabels()`, never a
 * hardcoded "Khối"/"Khóa" string.
 */
export default function ProgramsPage() {
  const labels = useOrgLabels();

  return (
    <DashboardChrome navItems={buildHostNav(labels)} allowedRoles={HOST_ROLES}>
      <div className="flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-gray-900">
          {labels.isLoading ? "..." : `Quản lý ${labels.program}`}
        </h1>
        <p className="text-gray-600">
          {`Danh sách ${labels.program.toLowerCase()} và ${labels.class.toLowerCase()} sẽ hiển thị ở đây.`}
        </p>
      </div>
    </DashboardChrome>
  );
}
