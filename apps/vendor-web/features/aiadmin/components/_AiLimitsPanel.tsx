import type { ReactElement } from "react";
import type { AiStatusLimits } from "@pte/api-client";
import { DashboardPanel, DescriptionList } from "@pte/ui";
import type { AiAdminCopy } from "../constants";

interface AiLimitsPanelProps {
  limits: AiStatusLimits;
  copy: AiAdminCopy;
}

export const AiLimitsPanel = ({ limits, copy }: AiLimitsPanelProps): ReactElement => (
  <DashboardPanel title={copy.LIMITS_PANEL}>
    <DescriptionList
      variant="inline"
      items={[
        { label: copy.MAX_PER_JOB, value: limits.maxItemsPerJob },
        { label: copy.MAX_PER_USER_DAY, value: limits.maxItemsPerUserPerDay },
        { label: copy.MAX_PER_DAY, value: limits.maxItemsPerDayGlobal },
        { label: copy.MAX_JOBS, value: limits.maxConcurrentJobs },
        { label: copy.MAX_CALLS, value: limits.maxCallsPerItem },
      ]}
    />
  </DashboardPanel>
);
