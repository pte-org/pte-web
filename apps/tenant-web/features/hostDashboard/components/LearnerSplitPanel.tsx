"use client";

import type { ReactElement } from "react";
import type { HostDashboardResponse } from "@pte/api-client";
import { StatusDonutChart } from "@pte/ui";
import { HOST_DASHBOARD_ROUTES } from "../constants";
import { useHostDashboardText } from "../hooks/useHostDashboardText";
import { buildLearnerSplit } from "../utils/charts";
import { PanelLink } from "./PanelLink";
import { SectionPanel } from "./SectionPanel";

interface LearnerSplitPanelProps {
  section: HostDashboardResponse["learners"];
  onRetry: () => void;
  className?: string;
}

/** Learners placed in a class versus learners still waiting for one. */
export const LearnerSplitPanel = ({ section, onRetry, className }: LearnerSplitPanelProps): ReactElement | null => {
  const { messages } = useHostDashboardText();

  return (
    <SectionPanel
      title={messages.splitTitle}
      subtitle={messages.splitSubtitle}
      actions={<PanelLink href={HOST_DASHBOARD_ROUTES.students}>{messages.splitManage}</PanelLink>}
      section={section}
      onRetry={onRetry}
      className={className}
      contentClassName="flex-1 flex flex-col justify-center"
    >
      {(data) => {
        const split = buildLearnerSplit(data);
        return (
          <StatusDonutChart
            items={[
              { key: "assigned", label: messages.splitAssigned, value: split.assigned, tone: "success" },
              { key: "unassigned", label: messages.splitUnassigned, value: split.unassigned, tone: "warning" },
            ]}
            totalLabel={messages.splitTotal}
            emptyLabel={messages.splitEmpty}
            ariaLabel={messages.splitAria}
          />
        );
      }}
    </SectionPanel>
  );
};
