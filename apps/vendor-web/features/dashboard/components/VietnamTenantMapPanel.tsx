"use client";

import type { ReactElement } from "react";
import { DashboardPanel } from "@pte/ui";
import { useAdminDashboardText } from "../hooks/useAdminDashboardText";

export interface VietnamTenantMapPanelProps {
  className?: string;
}

/**
 * Geographic distribution panel.
 * Until Phase 10 (backend province capture), it displays an honest empty state with no fabricated pins.
 */
export const VietnamTenantMapPanel = ({ className }: VietnamTenantMapPanelProps): ReactElement => {
  const { messages } = useAdminDashboardText();

  return (
    <DashboardPanel
      title={messages.mapTitle}
      subtitle={messages.mapSubtitle}
      className={className}
      contentClassName="flex-1 flex flex-col justify-center"
      status="empty"
      empty={{
        title: messages.mapEmptyTitle,
        description: messages.mapEmpty,
      }}
    />
  );
};
