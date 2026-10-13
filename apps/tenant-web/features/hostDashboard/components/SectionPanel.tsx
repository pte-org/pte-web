"use client";

import type { ReactElement, ReactNode } from "react";
import type { DashboardSection } from "@pte/api-client";
import { DashboardPanel, type DashboardPanelEmptyProps } from "@pte/ui";
import { useHostDashboardText } from "../hooks/useHostDashboardText";

interface SectionPanelProps<T> {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  section: DashboardSection<T>;
  /** Refetches the single dashboard query. */
  onRetry: () => void;
  className?: string;
  /** Return the empty-state copy when the loaded data has nothing to show; zero counts are not empty. */
  emptyWhen?: (data: T) => DashboardPanelEmptyProps | null;
  children: (data: T) => ReactNode;
}

/**
 * Maps one section's status to its panel: FORBIDDEN is hidden, ERROR shows this panel's own error
 * state with a retry, OK renders the content. Discriminating on `status` narrows `data`.
 */
export const SectionPanel = <T,>({
  title,
  subtitle,
  actions,
  section,
  onRetry,
  className,
  emptyWhen,
  children,
}: SectionPanelProps<T>): ReactElement | null => {
  const { messages } = useHostDashboardText();

  if (section.status !== "OK") {
    if (section.status === "FORBIDDEN") return null;
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

  const empty = emptyWhen?.(section.data) ?? null;
  return (
    <DashboardPanel
      title={title}
      subtitle={subtitle}
      actions={actions}
      className={className}
      status={empty ? "empty" : "content"}
      empty={empty ?? undefined}
    >
      {children(section.data)}
    </DashboardPanel>
  );
};
