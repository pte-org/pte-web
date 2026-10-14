"use client";

import type { ReactElement } from "react";
import type { HostDashboardResponse } from "@pte/api-client";
import { StatusDonutChart } from "@pte/ui";
import { HOST_DASHBOARD_ROUTES } from "../constants";
import { useHostDashboardText } from "../hooks/useHostDashboardText";
import { buildSessionStatusSlices } from "../utils/charts";
import { PanelLink } from "./PanelLink";
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
      footerAction={<PanelLink href={HOST_DASHBOARD_ROUTES.exams}>{messages.statusManage}</PanelLink>}
      section={section}
      onRetry={onRetry}
      className={className}
      contentClassName="flex-1 flex flex-col justify-center"
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
