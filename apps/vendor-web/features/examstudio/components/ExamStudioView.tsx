"use client";

import Link from "next/link";
import { useMemo, useState, type ReactElement } from "react";
import {
  DashboardCard,
  EmptyState,
  ErrorState,
  LoadingState,
  Tabs,
  useToast,
  type TabItem,
} from "@pte/ui";
import { useCurrentUser } from "@/features/auth/api";
import { canReviewAcademic } from "@/features/auth/permissions";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { useQuestions } from "@/features/questionbank/api";
import { useTaskTypes } from "@/features/questiontemplate/api";
import {
  useCloneScoreTemplate,
  useScoreTemplateFeasibility,
  useScoreTemplates,
} from "@/features/scoretemplate/api";
import { EXAM_TEMPLATE_BASE_PATH } from "@/features/scoretemplate/constants";
import { buildStudioModel } from "../buildStudioModel";
import { EXAM_STUDIO_TEXT, STUDIO_TABS } from "../constants";
import { useStudioLocation } from "../hooks/useStudioLocation";
import type { StudioTab } from "../types";
import { isEditableTemplate, pickWorkingTemplate, selectableTemplates } from "../workingTemplate";
import { ComposeTab } from "./ComposeTab";
import { SERVER_STATUS } from "./questionStatus";
import { BoardTab } from "./BoardTab";
import { StudioDrawer } from "./StudioDrawer";
import { TimelineTab } from "./TimelineTab";
import { CoverageTab } from "./_CoverageTab";
import { PendingReviewNotice } from "./_PendingReviewNotice";

const TABS_ID = "exam-studio-tabs";

/** The task type catalog, the working template and the question bank, as four views of one exam. */
export const ExamStudioView = (): ReactElement => {
  const text = useAdminCopy(EXAM_STUDIO_TEXT);
  const { showToast } = useToast();
  const { tab, selectedKey, setTab, setSelectedKey } = useStudioLocation();
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [composeSection, setComposeSection] = useState<string | undefined>(undefined);
  const templates = useScoreTemplates();
  const taskTypes = useTaskTypes();
  const template = pickWorkingTemplate(templates.data ?? [], templateId);
  const versions = selectableTemplates(templates.data ?? []);
  const feasibility = useScoreTemplateFeasibility(template?.publicId ?? "");
  const cloneMutation = useCloneScoreTemplate();
  const editable = isEditableTemplate(template);
  const { data: currentUser } = useCurrentUser();
  // One row is asked for: only the total is wanted.
  const pending = useQuestions({ status: SERVER_STATUS.pending_approval }, 0, 1);
  const pendingCount = pending.data?.meta.totalElements ?? 0;
  const showPendingNotice =
    canReviewAcademic(currentUser?.roles) && pendingCount > 0 && tab !== STUDIO_TABS.KANBAN;

  const model = useMemo(
    () => buildStudioModel(template, taskTypes.data ?? [], feasibility.data),
    [template, taskTypes.data, feasibility.data],
  );
  const selected = model.tiles.find((tile) => tile.key === selectedKey) ?? null;
  const tabItems: TabItem[] = [
    { id: STUDIO_TABS.COVERAGE, label: text.TAB_COVERAGE },
    { id: STUDIO_TABS.KANBAN, label: text.TAB_KANBAN },
    { id: STUDIO_TABS.COMPOSE, label: text.TAB_COMPOSE },
    { id: STUDIO_TABS.TIMELINE, label: text.TAB_TIMELINE },
  ];

  const createDraft = (): void => {
    if (!template) return;
    cloneMutation.mutate(template.publicId, {
      onError: () => showToast(text.CREATE_DRAFT_ERROR, { tone: "error" }),
    });
  };

  const content = ((): ReactElement => {
    if (templates.isLoading || taskTypes.isLoading) return <LoadingState />;
    if (templates.isError || taskTypes.isError) return <ErrorState title={text.LOAD_ERROR} />;
    if (!template) {
      return (
        <EmptyState
          title={text.NO_TEMPLATE_TITLE}
          description={text.NO_TEMPLATE_BODY}
          action={
            <Link
              href={EXAM_TEMPLATE_BASE_PATH}
              className="text-sm font-medium text-[var(--brand-ink)] hover:underline"
            >
              {text.OPEN_TEMPLATE_PAGE}
            </Link>
          }
        />
      );
    }
    switch (tab) {
      case STUDIO_TABS.KANBAN:
        return <BoardTab tiles={model.tiles} templatePublicId={template.publicId} />;
      case STUDIO_TABS.COMPOSE:
        return <ComposeTab tiles={model.tiles} initialSection={composeSection} />;
      case STUDIO_TABS.TIMELINE:
        return (
          <TimelineTab
            template={template}
            tiles={model.tiles}
            selectedKey={selectedKey}
            onSelect={setSelectedKey}
          />
        );
      default:
        return (
          <CoverageTab
            model={model}
            template={template}
            templates={versions}
            editable={editable}
            isCreatingDraft={cloneMutation.isPending}
            selectedKey={selectedKey}
            onSelectTemplate={setTemplateId}
            onCreateDraft={createDraft}
            onOpenCompose={(section) => {
              setComposeSection(section);
              setTab(STUDIO_TABS.COMPOSE);
            }}
            onSelect={setSelectedKey}
          />
        );
    }
  })();

  return (
    <div className="space-y-5">
      {showPendingNotice && (
        <PendingReviewNotice
          message={text.PENDING_REVIEW.replace("{count}", String(pendingCount))}
          openLabel={text.OPEN_BOARD}
          onOpen={() => setTab(STUDIO_TABS.KANBAN)}
        />
      )}
      <Tabs
        id={TABS_ID}
        variant="default"
        ariaLabel={text.TABS_LABEL}
        items={tabItems}
        value={tab}
        onChange={(value) => setTab(value as StudioTab)}
      />
      {tab === STUDIO_TABS.COVERAGE ? content : <DashboardCard>{content}</DashboardCard>}
      {template && (
        <StudioDrawer
          tile={selected}
          templatePublicId={template.publicId}
          onClose={() => setSelectedKey(null)}
        />
      )}
    </div>
  );
};
