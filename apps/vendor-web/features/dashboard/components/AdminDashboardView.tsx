"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { getUserFacingApiErrorMessage } from "@pte/api-client";
import { Button, DashboardLoadingState, ErrorState } from "@pte/ui";
import { useCurrentUser } from "@/features/auth/api";
import { canManagePlatformOperations } from "@/features/auth/permissions";
import { CreateTenantModal } from "@/features/tenancy/components/CreateTenantModal";
import { TenantCreatedModal } from "@/features/tenancy/components/TenantCreatedModal";
import { useCreateTenantFlow } from "@/features/tenancy/hooks/useCreateTenantFlow";
import { useAdminDashboard } from "../api";
import { ADMIN_DASHBOARD_ROUTES } from "../constants";
import { useAdminDashboardText } from "../hooks/useAdminDashboardText";
import { AcademicDashboardLayout } from "./AcademicDashboardLayout";
import { AdminDashboardGrid } from "./AdminDashboardGrid";
import { AdminDashboardHeader } from "./AdminDashboardHeader";
import { TenantDetailModal } from "./TenantDetailModal";

export const AdminDashboardView = (): ReactElement => {
  const router = useRouter();
  const { messages } = useAdminDashboardText();
  const { data: currentUser } = useCurrentUser();
  const { data, error, isPending, isFetching, refetch } = useAdminDashboard();
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

  const createFlow = useCreateTenantFlow({
    onCreated: () => router.push(ADMIN_DASHBOARD_ROUTES.tenants),
  });

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
        currentUser={currentUser}
        onRetry={onRetry}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminDashboardHeader currentUser={currentUser} onAddTenant={createFlow.openModal} />
      <AdminDashboardGrid
        dashboard={data}
        onRetry={onRetry}
        onViewTenant={setSelectedTenantId}
      />

      <TenantDetailModal
        tenantId={selectedTenantId}
        onClose={() => setSelectedTenantId(null)}
      />

      <CreateTenantModal
        key={createFlow.open ? "open" : "closed"}
        open={createFlow.open}
        onClose={createFlow.closeModal}
        onSubmit={createFlow.confirmCreate}
        error={createFlow.error}
        isSubmitting={createFlow.isSubmitting}
      />

      <TenantCreatedModal
        tenant={createFlow.createdTenant}
        onClose={createFlow.closeCreatedModal}
      />
    </div>
  );
};
