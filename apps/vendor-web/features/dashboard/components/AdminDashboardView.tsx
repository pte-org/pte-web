"use client";

import { useState, type ReactElement } from "react";
import { getUserFacingApiErrorMessage } from "@pte/api-client";
import { Button, DashboardLoadingState, ErrorState } from "@pte/ui";
import { useCurrentUser } from "@/features/auth/api";
import { canManagePlatformOperations } from "@/features/auth/permissions";
import { useAdminDashboard } from "../api";
import { useAdminDashboardText } from "../hooks/useAdminDashboardText";
import { AcademicDashboardLayout } from "./AcademicDashboardLayout";
import { AdminDashboardGrid } from "./AdminDashboardGrid";
import { TenantDetailModal } from "./TenantDetailModal";

export const AdminDashboardView = (): ReactElement => {
  const { messages } = useAdminDashboardText();
  const { data: currentUser } = useCurrentUser();
  const { data, error, isPending, isFetching, refetch } = useAdminDashboard();
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  const onRetry = (): void => {
    void refetch();
  };

  const isOpsManager = canManagePlatformOperations(currentUser?.roles);

  if (isPending) {
    return <DashboardLoadingState variant="overview" label={messages.loadingTitle} />;
  }

  if (error || !data) {
    return (
      <ErrorState
        title={messages.errorTitle}
        description={getUserFacingApiErrorMessage(error, messages.errorDescription)}
        action={
          <Button variant="danger" appearance="outline" isLoading={isFetching} onClick={onRetry}>
            {messages.retry}
          </Button>
        }
      />
    );
  }

  // Academic roles (and legacy PLATFORM_AUTHOR) receive a compact content-only layout
  if (!isOpsManager) {
    return (
      <AcademicDashboardLayout
        dashboard={data}
        onRetry={onRetry}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminDashboardGrid
        dashboard={data}
        onRetry={onRetry}
        onViewTenant={setSelectedTenantId}
      />

      <TenantDetailModal
        tenantId={selectedTenantId}
        onClose={() => setSelectedTenantId(null)}
      />
    </div>
  );
};
