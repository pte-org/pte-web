"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactElement, type ReactNode } from "react";
import type { QuestionTypeResponse } from "@pte/api-client";
import { Alert, Button, Chip, ConfirmDialog, EyeIcon, LoadingState, useToast } from "@pte/ui";
import { useCurrentUser } from "@/features/auth/api";
import { canReviewAcademic } from "@/features/auth/permissions";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import {
  useApproveTaskType,
  useRetireTaskType,
  useSubmitTaskTypeApproval,
  useTaskTypes,
} from "@/features/questiontemplate/api";
import { getQuestionTypeErrorMessage } from "@/features/questiontemplate/errorMessage";
import { QUESTION_TYPE_TEXT } from "@/features/questiontemplate/constants";
import { SCORE_TEMPLATE_STATUS_LABELS } from "@/features/scoretemplate/constants";
import { sectionTone } from "@/lib/chipTones";
import { EXAM_STUDIO_TEXT, QUESTION_TYPES_ROUTE } from "../constants";
import { useStudioLocation } from "../hooks/useStudioLocation";
import { useUpdatedLabel } from "../hooks/useUpdatedLabel";
import { taskTypeMove, taskTypeVerdict, type TaskTypeMove } from "../lifecycleMoves";
import { BoardCard } from "./_BoardCard";
import { BoardToolbar } from "./_BoardToolbar";
import { ScoringFilter, SectionFilter } from "./_BoardFilters";
import { LifecycleBoard, type LifecycleColumn } from "./_LifecycleBoard";

const statusOf = (type: QuestionTypeResponse): string =>
  type.lifecycleStatus ?? (type.active ? "ACTIVE" : "RETIRED");

/** The task types by where they stand: being drafted, waiting for approval, in use, or retired. */
interface BoardProps {
  /** What starts the toolbar row, such as the choice of board. */
  leading?: ReactNode;
}

export const TaskTypeBoard = ({ leading }: BoardProps): ReactElement => {
  const text = useAdminCopy(EXAM_STUDIO_TEXT);
  const typeText = useAdminCopy(QUESTION_TYPE_TEXT);
  const statusLabels = useAdminCopy(SCORE_TEMPLATE_STATUS_LABELS);
  const router = useRouter();
  const { here } = useStudioLocation();
  const updatedLabel = useUpdatedLabel();
  const viewLabel = useAdminCopy("View");
  const { showToast } = useToast();
  const { data: currentUser } = useCurrentUser();
  const canReview = canReviewAcademic(currentUser?.roles);
  const taskTypes = useTaskTypes(false);
  const submit = useSubmitTaskTypeApproval();
  const approve = useApproveTaskType();
  const retire = useRetireTaskType();
  const [retiring, setRetiring] = useState<QuestionTypeResponse | null>(null);
  const [search, setSearch] = useState("");
  const [section, setSection] = useState("");
  const [scoring, setScoring] = useState("");
  const busy = submit.isPending || approve.isPending || retire.isPending;

  if (taskTypes.isLoading) return <LoadingState />;
  if (taskTypes.isError) return <Alert tone="error">{text.BOARD_LOAD_ERROR}</Alert>;

  const needle = search.trim().toLowerCase();
  const items = (taskTypes.data ?? []).filter(
    (type) =>
      (section === "" || type.section === section) &&
      (scoring === "" || (scoring === "YES") === type.scored) &&
      (needle === "" ||
        type.displayName.toLowerCase().includes(needle) ||
        type.code.toLowerCase().includes(needle) ||
        type.section.toLowerCase().includes(needle)),
  );
  const columns: LifecycleColumn[] = [
    { id: "DRAFT", title: statusLabels.DRAFT, tone: "neutral" },
    { id: "PENDING_APPROVAL", title: statusLabels.PENDING_APPROVAL, tone: "warning" },
    { id: "ACTIVE", title: statusLabels.ACTIVE, tone: "success" },
    { id: "RETIRED", title: statusLabels.RETIRED, tone: "info" },
  ];
  const options = {
    onSuccess: () => showToast(text.MOVE_DONE, { tone: "success" }),
    onError: (error: unknown) =>
      showToast(getQuestionTypeErrorMessage(error, text.ACTION_ERROR), { tone: "error" }),
  };
  // One entry for the buttons and for a drop: retiring asks first, since it takes the task type out of use.
  const run = (type: QuestionTypeResponse, move: TaskTypeMove): void => {
    if (move === "submit") submit.mutate(type.publicId, options);
    else if (move === "approve") approve.mutate(type.publicId, options);
    else setRetiring(type);
  };

  return (
    <div className="space-y-4">
      <BoardToolbar
        searchLabel={typeText.SEARCH_ARIA_LABEL}
        placeholder={typeText.SEARCH_PLACEHOLDER}
        search={search}
        onSearch={setSearch}
        end={leading}
      >
        <SectionFilter value={section} onChange={setSection} />
        <ScoringFilter value={scoring} onChange={setScoring} />
      </BoardToolbar>
      <LifecycleBoard
        columns={columns}
        items={items}
        columnOf={statusOf}
        keyOf={(type) => type.publicId}
        emptyLabel={text.EMPTY_COLUMN}
        lockedLabel={text.LOCKED_NEEDS_REVIEWER}
        verdictOf={(type, target) => taskTypeVerdict(statusOf(type), target, canReview)}
        onMove={(type, target) => {
          const move = taskTypeMove(statusOf(type), target);
          if (move && !busy) run(type, move);
        }}
        renderCard={(type, drag) => (
          <BoardCard
            onClick={() => router.push(`${QUESTION_TYPES_ROUTE}?from=${encodeURIComponent(here)}`)}
            className={drag.draggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}
            draggable={drag.draggable}
            onDragStart={drag.onDragStart}
            onDragEnd={drag.onDragEnd}
            grip={drag.grip}
            gripLabel={text.KANBAN_DRAG}
            tags={
              <>
                <Chip tone={sectionTone(type.section)} size="sm">
                  {type.section}
                </Chip>
                <span className="font-mono text-[11px] text-[var(--ink-muted)]">{type.code}</span>
              </>
            }
            title={type.displayName}
            meta={updatedLabel(type.updatedAt)}
            menu={[
              {
                label: viewLabel,
                icon: EyeIcon,
                onSelect: () =>
                  router.push(`${QUESTION_TYPES_ROUTE}?from=${encodeURIComponent(here)}`),
              },
            ]}
            actions={
              <>
                {statusOf(type) === "DRAFT" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busy}
                    onClick={(event) => {
                      event.stopPropagation();
                      run(type, "submit");
                    }}
                  >
                    {text.SUBMIT_APPROVAL}
                  </Button>
                )}
                {statusOf(type) === "PENDING_APPROVAL" && canReview && (
                  <Button
                    size="sm"
                    disabled={busy}
                    onClick={(event) => {
                      event.stopPropagation();
                      run(type, "approve");
                    }}
                  >
                    {text.APPROVE}
                  </Button>
                )}
              </>
            }
          />
        )}
      />
      <ConfirmDialog
        open={retiring !== null}
        title={typeText.DELETE}
        description={typeText.DELETE_CONFIRM}
        confirmLabel={typeText.DELETE}
        tone="danger"
        isConfirming={retire.isPending}
        onConfirm={() => {
          if (retiring)
            retire.mutate(
              { publicId: retiring.publicId },
              { ...options, onSettled: () => setRetiring(null) },
            );
        }}
        onClose={() => setRetiring(null)}
      />
    </div>
  );
};
