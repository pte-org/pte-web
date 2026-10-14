"use client";

import type { ReactElement, ReactNode } from "react";
import type { DashboardSection } from "@pte/api-client";
import { DashboardPanel, type DashboardPanelEmptyProps } from "@pte/ui";
import { useHostDashboardText } from "../hooks/useHostDashboardText";
import { sectionAvailability, sectionData } from "../utils/sections";

interface SectionPanelProps<T> {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  /** Typed as present by the contract; `undefined` (payload drift) is hidden like FORBIDDEN. */
  section: DashboardSection<T> | undefined;
  /** Refetches the single dashboard query. */
  onRetry: () => void;
  className?: string;
  contentClassName?: string;
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
  contentClassName,
  emptyWhen,
  children,
}: SectionPanelProps<T>): ReactElement | null => {
  const { messages } = useHostDashboardText();

  const availability = sectionAvailability(section);
  if (availability === "forbidden") return null;
  const data = sectionData(section);
  if (availability === "error" || data === undefined) {
    return (
      <DashboardPanel
        title={title}
        subtitle={subtitle}
        className={className}
        contentClassName={contentClassName}
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

  const empty = emptyWhen?.(data) ?? null;
  return (
    <DashboardPanel
      title={title}
      subtitle={subtitle}
      actions={actions}
      className={className}
      contentClassName={contentClassName}
      status={empty ? "empty" : "content"}
      empty={empty ?? undefined}
    >
      {children(data)}
    </DashboardPanel>
  );
};
