"use client";

import { RequireAuth } from "@/features/auth/components";
import { RedeemLicenseView } from "@/features/commercialization/components";

export default function HostRedeemLicensePage() {
  return (
    <RequireAuth allowedRoles={["HOST_ADMIN"]}>
      <RedeemLicenseView />
    </RequireAuth>
  );
}
