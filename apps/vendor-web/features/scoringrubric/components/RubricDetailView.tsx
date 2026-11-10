"use client";

import { useState, type ReactElement } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Badge, DashboardCard, ErrorState, LoadingState, TabPanel, Tabs, useDashboardBreadcrumbLabel, useLocale, type TabItem } from "@pte/ui";
import { useScoreTemplates } from "@/features/scoretemplate/api";
import { useRubricTaskType, useRubricVersions } from "../api";
import { RUBRIC_VERSION_PARAM } from "../constants";
import { useScoringRubricText } from "../hooks/useScoringRubricText";
import { findTemplateWeights, resolveSelectedTemplate } from "../rubricView";
import { RubricOverviewTab } from "./_RubricOverviewTab";
import { SkillWeightPanel } from "./_SkillWeightPanel";
import { TemplatePicker } from "./_TemplatePicker";
import { TraitCards } from "./_TraitCards";
import { TraitLevelsTab } from "./_TraitLevelsTab";

interface RubricDetailViewProps {
  taskType: string;
}

import { RUBRIC_EDIT_TEXT, versionDetailHref } from "../versionConstants";
const TAB_PARAM = "tab";
const TABS_ID = "scoring-rubric-detail-tabs";
type DetailTab = "overview" | "criteria" | "levels" | "weights";
const DETAIL_TABS: readonly DetailTab[] = ["overview", "criteria", "levels", "weights"];
const isDetailTab = (value: string | null): value is DetailTab =>
  value !== null && (DETAIL_TABS as readonly string[]).includes(value);

/**
 * Rubric of one task type, split into tabs that each answer one question: how the item score is built, what each
 * trait is, what a level means, and how much the task type weighs in an exam template. The open tab lives in the URL.
 * Everything shown is read from the rubric API and the template; nothing is recomputed.
 */
export const RubricDetailView = ({ taskType }: RubricDetailViewProps): ReactElement => {
  const { messages: M, codeLabel } = useScoringRubricText();
  const { locale } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const templatesQuery = useScoreTemplates();
  const versionsQuery = useRubricVersions();
  const versionParam = searchParams.get(RUBRIC_VERSION_PARAM);
  const openedFrom = versionsQuery.data?.find((version) => version.publicId === versionParam);
  // Opened from a version: the trail goes through it, so the way back is one click.
  useDashboardBreadcrumbLabel(pathname, taskType, openedFrom
    ? [{ label: `${RUBRIC_EDIT_TEXT[locale === "vi" ? "vi" : "en"].title} ${openedFrom.versionNo}`, href: versionDetailHref(openedFrom.publicId) }]
    : undefined);
  const templates = templatesQuery.data ?? [];
  const selected = resolveSelectedTemplate(templates, selectedId);
  const rubricQuery = useRubricTaskType(taskType, versionParam ?? selected?.rubricVersionPublicId ?? null, versionParam !== null || !templatesQuery.isLoading);
  const rubric = rubricQuery.data;

  const isObjective = Boolean(rubric?.objectiveRule);
  const available: readonly DetailTab[] = isObjective ? ["overview", "weights"] : DETAIL_TABS;
  const requested = searchParams.get(TAB_PARAM);
  const activeTab: DetailTab = isDetailTab(requested) && available.includes(requested) ? requested : "overview";
  const labels: Record<DetailTab, string> = {
    overview: M.tabOverview,
    criteria: M.tabCriteria,
    levels: M.tabLevels,
    weights: M.tabWeights,
  };
  const items: TabItem[] = available.map((tab) => ({ id: tab, label: labels[tab] }));

  const selectTab = (tab: string): void => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(TAB_PARAM, tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <DashboardCard className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-mono text-2xl font-semibold text-[var(--ink-primary)]">{taskType}</h1>
        {rubric && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--ink-secondary)]">
            {rubric.skills.map((skill) => (
              <Badge key={skill} variant="info">
                {codeLabel("skill", skill)}
              </Badge>
            ))}
            <span aria-hidden="true">·</span>
            <Badge variant="neutral">{`v${rubric.versionNo}`}</Badge>
          </div>
        )}
      </header>

      {(templatesQuery.isLoading || rubricQuery.isLoading) && <LoadingState rows={6} />}
      {rubricQuery.isError && <ErrorState title={M.detailError} />}

      {rubric && (
        <>
          <Tabs id={TABS_ID} items={items} value={activeTab} onChange={selectTab} variant="minimal" ariaLabel={M.tabsLabel} />
          <TabPanel id={`${TABS_ID}-overview`} active={activeTab === "overview"}>
            <RubricOverviewTab rubric={rubric} />
          </TabPanel>
          <TabPanel id={`${TABS_ID}-criteria`} active={activeTab === "criteria"}>
            <TraitCards rubric={rubric} />
          </TabPanel>
          <TabPanel id={`${TABS_ID}-levels`} active={activeTab === "levels"}>
            <TraitLevelsTab rubric={rubric} />
          </TabPanel>
          <TabPanel id={`${TABS_ID}-weights`} active={activeTab === "weights"} className="space-y-5">
            <TemplatePicker
              templates={templates}
              selected={selected}
              versions={versionsQuery.data ?? []}
              templatesFailed={templatesQuery.isError}
              onSelect={setSelectedId}
            />
            <SkillWeightPanel weights={selected ? findTemplateWeights(selected, taskType) : undefined} />
          </TabPanel>
        </>
      )}
    </DashboardCard>
  );
};
