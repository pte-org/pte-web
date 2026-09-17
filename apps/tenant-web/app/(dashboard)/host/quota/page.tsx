"use client";

import { DashboardChrome } from "@/features/auth/components";
import { QuotaView } from "@/features/commercialization/components";
import { useOrgLabels } from "@/features/orgLabels/useOrgLabels";
import { buildHostNav } from "@/lib/navigation";

export default function HostQuotaPage() {
  const labels = useOrgLabels();

  return (
      <DashboardChrome navItems={buildHostNav(labels)} allowedRoles={["HOST_ADMIN"]}>
      <QuotaView />
    </DashboardChrome>
  );
}
