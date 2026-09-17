"use client";

import { DashboardChrome } from "@/features/auth/components";
import { RedeemLicenseView } from "@/features/commercialization/components";
import { useOrgLabels } from "@/features/orgLabels/useOrgLabels";
import { buildHostNav } from "@/lib/navigation";

export default function HostRedeemLicensePage() {
  const labels = useOrgLabels();

  return (
      <DashboardChrome navItems={buildHostNav(labels)} allowedRoles={["HOST_ADMIN"]}>
      <RedeemLicenseView />
    </DashboardChrome>
  );
}
