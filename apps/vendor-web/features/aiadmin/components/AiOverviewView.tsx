"use client";

import type { ReactElement } from "react";
import { DashboardPanel, Tabs, useLocale, useRememberedState, type TabItem } from "@pte/ui";
import { ChatUsageView } from "@/features/chatUsage/components";
import { useAiStatus } from "../api";
import { AI_ADMIN_COPY, type AiAdminCopy } from "../constants";
import { AiLimitsPanel } from "./_AiLimitsPanel";
import { AiStatusPanel } from "./_AiStatusPanel";
import { GenerationStatsView } from "./GenerationStatsView";

const TAB_IDS = ["overview", "generation", "chat"] as const;
type AiTab = (typeof TAB_IDS)[number];
const TABS_ID = "ai-overview-tabs";

const ConfigurationTab = ({ copy }: { copy: AiAdminCopy }): ReactElement => {
  const status = useAiStatus();
  return (
    <div className="space-y-6">
      {status.data ? (
        <>
          <AiStatusPanel status={status.data} copy={copy} />
          <AiLimitsPanel limits={status.data.limits} copy={copy} />
        </>
      ) : (
        <DashboardPanel
          title={copy.STATUS_PANEL}
          status={status.isError ? "error" : "loading"}
          loadingLabel={copy.LOADING}
          error={{
            title: copy.LOAD_ERROR_TITLE,
            retryLabel: copy.LOAD_ERROR_RETRY,
            onRetry: () => void status.refetch(),
          }}
        />
      )}
    </div>
  );
};

/** What the AI is set up to do, how question generation is going and how the chatbot is used, one tab each. */
export const AiOverviewView = (): ReactElement => {
  const { locale } = useLocale();
  const copy = AI_ADMIN_COPY[locale];
  const [tab, setTab] = useRememberedState<AiTab>("tab", "overview", TAB_IDS);
  const items: TabItem[] = [
    { id: "overview", label: copy.TAB_OVERVIEW },
    { id: "generation", label: copy.TAB_GENERATION },
    { id: "chat", label: copy.TAB_CHAT },
  ];

  return (
    <div className="space-y-6">
      <Tabs
        id={TABS_ID}
        items={items}
        value={tab}
        onChange={(value) => setTab(TAB_IDS.find((id) => id === value) ?? "overview")}
        variant="default"
        ariaLabel={copy.TABS_ARIA_LABEL}
      />
      {tab === "overview" && <ConfigurationTab copy={copy} />}
      {tab === "generation" && <GenerationStatsView />}
      {tab === "chat" && <ChatUsageView />}
    </div>
  );
};
