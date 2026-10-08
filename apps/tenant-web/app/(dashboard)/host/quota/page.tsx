"use client";

import { RequireAuth } from "@/features/auth/components";
import { QuotaView } from "@/features/commercialization/components";

export default function HostQuotaPage() {
  return (
    <RequireAuth allowedRoles={["HOST_ADMIN"]}>
      <QuotaView />
    </RequireAuth>
  );
}
