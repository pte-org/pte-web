"use client";

import { DashboardChrome } from "@/features/auth/components";
import { HOST_ROLES } from "@/features/auth/constants";
import { CheckoutView } from "@/features/commercialization/components";
import { useOrgLabels } from "@/features/orgLabels/useOrgLabels";
import { buildHostNav } from "@/lib/navigation";

export default function HostCheckoutPage() {
  const labels = useOrgLabels();

  return (
    <DashboardChrome navItems={buildHostNav(labels)} allowedRoles={HOST_ROLES}>
      <CheckoutView />
    </DashboardChrome>
  );
}
