"use client";

import type { ReactElement } from "react";
import type { HostDashboardResponse } from "@pte/api-client";
import { StatusDonutChart } from "@pte/ui";
import { useHostDashboardText } from "../hooks/useHostDashboardText";
import { buildSessionStatusSlices } from "../utils/charts";
import { SectionPanel } from "./SectionPanel";

interface SessionStatusPanelProps {
  section: HostDashboardResponse["exams"];
  onRetry: () => void;
  className?: string;
}

export const SessionStatusPanel = ({ section, onRetry, className }: SessionStatusPanelProps): ReactElement | null => {
  const { messages } = useHostDashboardText();

  return (
    <SectionPanel
      title={messages.statusTitle}
      subtitle={messages.statusSubtitle}
      section={section}
      onRetry={onRetry}
      className={className}
    >
      {(data) => (
        <StatusDonutChart
          items={buildSessionStatusSlices(data.byStatus).map((slice) => ({
            key: slice.key,
            label: messages[slice.labelKey],
            value: slice.value,
            tone: slice.tone,
          }))}
          totalLabel={messages.statusTotal}
          emptyLabel={messages.statusEmpty}
          ariaLabel={messages.statusAria}
        />
      )}
    </SectionPanel>
  );
};
