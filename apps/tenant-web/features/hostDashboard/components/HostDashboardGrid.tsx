"use client";

import type { ReactElement } from "react";
import type { HostDashboardResponse } from "@pte/api-client";
import { CollapsibleSection } from "@pte/ui";
import { DASHBOARD_GRID_CLASS, DASHBOARD_SLOT_CLASS } from "../constants";
import { useHostDashboardText } from "../hooks/useHostDashboardText";
import { sectionAvailability } from "../utils/sections";
import { AttemptsTrendPanel } from "./AttemptsTrendPanel";
import { CompactCards } from "./CompactCards";
import { GradingPipelinePanel } from "./GradingPipelinePanel";
import { KpiRow } from "./KpiRow";
import { LearnerSplitPanel } from "./LearnerSplitPanel";
import { NeedsAttentionPanel } from "./NeedsAttentionPanel";
import { RecentActivityPanel } from "./RecentActivityPanel";
import { SessionStatusPanel } from "./SessionStatusPanel";
import { UpcomingSessionsPanel } from "./UpcomingSessionsPanel";
import { UsagePanel } from "./UsagePanel";

interface HostDashboardGridProps {
  dashboard: HostDashboardResponse;
  onRetry: () => void;
  analysisDefaultExpanded?: boolean;
}

/**
 * Widget layout. The operational group leads the page; detail widgets stay behind a collapsible
 * analysis group while each group's DOM order remains the mobile reading order.
 */
export const HostDashboardGrid = ({
  dashboard,
  onRetry,
  analysisDefaultExpanded = false,
}: HostDashboardGridProps): ReactElement => {
  const { messages } = useHostDashboardText();
  const showDonuts =
    sectionAvailability(dashboard.exams) !== "forbidden" ||
    sectionAvailability(dashboard.learners) !== "forbidden";
  const hasOperationalContent = [
    dashboard.learners,
    dashboard.exams,
    dashboard.attempts,
    dashboard.quota,
    dashboard.subscription,
    dashboard.grading,
    dashboard.billing,
    dashboard.support,
  ].some((section) => sectionAvailability(section) !== "forbidden");
  const hasAnalysisContent = [
    dashboard.attempts,
    dashboard.recentActivity,
    dashboard.exams,
    dashboard.learners,
    dashboard.grading,
    dashboard.staff,
    dashboard.academics,
    dashboard.support,
    dashboard.billing,
  ].some((section) => sectionAvailability(section) !== "forbidden");

  return (
    <div className="flex flex-col gap-8">
      {hasOperationalContent && (
        <div className={DASHBOARD_GRID_CLASS}>
          <NeedsAttentionPanel dashboard={dashboard} onRetry={onRetry} className={DASHBOARD_SLOT_CLASS.attention} />
          <KpiRow dashboard={dashboard} onRetry={onRetry} className={DASHBOARD_SLOT_CLASS.kpis} />
          <UsagePanel dashboard={dashboard} onRetry={onRetry} className={DASHBOARD_SLOT_CLASS.usage} />
          <UpcomingSessionsPanel dashboard={dashboard} onRetry={onRetry} className={DASHBOARD_SLOT_CLASS.upcoming} />
        </div>
      )}

      {hasAnalysisContent && (
        <CollapsibleSection
          title={messages.analysisTitle}
          subtitle={messages.analysisSubtitle}
          defaultExpanded={analysisDefaultExpanded}
        >
          <div className={DASHBOARD_GRID_CLASS}>
            <AttemptsTrendPanel section={dashboard.attempts} onRetry={onRetry} className={DASHBOARD_SLOT_CLASS.trend} />
            <RecentActivityPanel dashboard={dashboard} onRetry={onRetry} className={DASHBOARD_SLOT_CLASS.activity} />
            {showDonuts && (
              <div className={DASHBOARD_SLOT_CLASS.stackedDonuts}>
                <SessionStatusPanel section={dashboard.exams} onRetry={onRetry} className={DASHBOARD_SLOT_CLASS.status} />
                <LearnerSplitPanel section={dashboard.learners} onRetry={onRetry} className={DASHBOARD_SLOT_CLASS.split} />
              </div>
            )}
            <GradingPipelinePanel section={dashboard.grading} onRetry={onRetry} className={DASHBOARD_SLOT_CLASS.grading} />
            <CompactCards dashboard={dashboard} onRetry={onRetry} className={DASHBOARD_SLOT_CLASS.compact} />
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
};
