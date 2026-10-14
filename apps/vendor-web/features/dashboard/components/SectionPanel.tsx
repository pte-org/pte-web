"use client";

import type { ReactElement, ReactNode } from "react";
import type { DashboardSection } from "@pte/api-client";
import { DashboardPanel } from "@pte/ui";
import { useAdminDashboardText } from "../hooks/useAdminDashboardText";
import { sectionAvailability, sectionData } from "../utils/sections";

export interface SectionPanelProps<T> {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  section: DashboardSection<T> | null | undefined;
  onRetry: () => void;
  className?: string;
  emptyWhen?: (data: T) => { title: string; description?: string } | null;
  children: (data: T) => ReactNode;
}

export function SectionPanel<T>({
  title,
  subtitle,
  actions,
  section,
  onRetry,
  className,
  emptyWhen,
  children,
}: SectionPanelProps<T>): ReactElement | null {
  const { messages } = useAdminDashboardText();

  const availability = sectionAvailability(section);
  if (availability === "forbidden") return null;

  const data = sectionData(section);
  if (availability === "error" || data === undefined) {
    return (
      <DashboardPanel
        title={title}
        subtitle={subtitle}
        className={className}
        status="error"
        error={{
          title: messages.sectionErrorTitle,
          description: messages.sectionErrorDescription,
          retryLabel: messages.retry,
          onRetry,
        }}
      />
    );
  }

  const empty = emptyWhen?.(data) ?? undefined;
  return (
    <DashboardPanel
      title={title}
      subtitle={subtitle}
      actions={actions}
      className={className}
      status="content"
      empty={empty}
    >
      {children(data)}
    </DashboardPanel>
  );
}
