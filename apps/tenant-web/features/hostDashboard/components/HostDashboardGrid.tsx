"use client";

import type { ReactElement } from "react";
import type { HostDashboardResponse } from "@pte/api-client";
import { DASHBOARD_GRID_CLASS, DASHBOARD_SLOT_CLASS } from "../constants";
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
}

/**
 * Widget layout. DOM order is the mobile reading order (needs attention first); the slot classes
 * reorder it for two columns and for the twelve-column desktop grid.
 */
export const HostDashboardGrid = ({ dashboard, onRetry }: HostDashboardGridProps): ReactElement => (
  <div className={DASHBOARD_GRID_CLASS}>
    <NeedsAttentionPanel dashboard={dashboard} onRetry={onRetry} className={DASHBOARD_SLOT_CLASS.attention} />
    <KpiRow dashboard={dashboard} onRetry={onRetry} className={DASHBOARD_SLOT_CLASS.kpis} />
    <UsagePanel dashboard={dashboard} onRetry={onRetry} className={DASHBOARD_SLOT_CLASS.usage} />
    <AttemptsTrendPanel section={dashboard.attempts} onRetry={onRetry} className={DASHBOARD_SLOT_CLASS.trend} />
    <UpcomingSessionsPanel dashboard={dashboard} onRetry={onRetry} className={DASHBOARD_SLOT_CLASS.upcoming} />
    <RecentActivityPanel dashboard={dashboard} onRetry={onRetry} className={DASHBOARD_SLOT_CLASS.activity} />
    <SessionStatusPanel section={dashboard.exams} onRetry={onRetry} className={DASHBOARD_SLOT_CLASS.status} />
    <LearnerSplitPanel section={dashboard.learners} onRetry={onRetry} className={DASHBOARD_SLOT_CLASS.split} />
    <GradingPipelinePanel section={dashboard.grading} onRetry={onRetry} className={DASHBOARD_SLOT_CLASS.grading} />
    <CompactCards dashboard={dashboard} onRetry={onRetry} className={DASHBOARD_SLOT_CLASS.compact} />
  </div>
);
