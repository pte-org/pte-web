"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactElement, type ReactNode } from "react";
import type { ScoreTemplateResponse } from "@pte/api-client";
import { Alert, Button, Chip, EyeIcon, Input, LoadingState, Modal, useToast } from "@pte/ui";
import { useCurrentUser } from "@/features/auth/api";
import { canReviewAcademic } from "@/features/auth/permissions";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { useAdminSearchText } from "@/features/i18n/adminSearchCopy";
import {
  useActivateScoreTemplate,
  useApproveScoreTemplate,
  useRejectScoreTemplate,
  useScoreTemplates,
  useSubmitScoreTemplateApproval,
} from "@/features/scoretemplate/api";
import { ActivateTemplateModal } from "@/features/scoretemplate/components/ActivateTemplateModal";
import { getScoreTemplateErrorMessage } from "@/features/scoretemplate/errorMessage";
import {
  SCORE_TEMPLATE_STATUS_LABELS,
  SCORE_TEMPLATE_TEXT as RAW_SCORE_TEMPLATE_TEXT,
} from "@/features/scoretemplate/constants";
import { EXAM_STUDIO_TEXT } from "../constants";
import { useAuthorNames } from "../hooks/useAuthorNames";
import { useStudioLocation } from "../hooks/useStudioLocation";
import { useUpdatedLabel } from "../hooks/useUpdatedLabel";
import { templateMove, templateVerdict, type TemplateMove } from "../lifecycleMoves";
import { templateHref } from "../workingTemplate";
import { BoardCard } from "./_BoardCard";
import { BoardToolbar } from "./_BoardToolbar";
import { LifecycleBoard, type LifecycleColumn } from "./_LifecycleBoard";

/** The platform's exam templates by where they stand; a returned draft shows why it was returned. */
interface BoardProps {
  /** What starts the toolbar row, such as the choice of board. */
  leading?: ReactNode;
}

export const TemplateBoard = ({ leading }: BoardProps): ReactElement => {
  const text = useAdminCopy(EXAM_STUDIO_TEXT);
  const searchText = useAdminSearchText("scoreTemplates");
  const T = useAdminCopy(RAW_SCORE_TEMPLATE_TEXT);
  const statusLabels = useAdminCopy(SCORE_TEMPLATE_STATUS_LABELS);
  const router = useRouter();
  const { here } = useStudioLocation();
  const updatedLabel = useUpdatedLabel();
  const viewLabel = useAdminCopy("View");
  const authorName = useAuthorNames();
  const { showToast } = useToast();
  const { data: currentUser } = useCurrentUser();
  const canReview = canReviewAcademic(currentUser?.roles);
  const templates = useScoreTemplates();
  const submit = useSubmitScoreTemplateApproval();
  const approve = useApproveScoreTemplate();
  const reject = useRejectScoreTemplate();
  const activate = useActivateScoreTemplate();
  const [activating, setActivating] = useState<ScoreTemplateResponse | null>(null);
  const [activateError, setActivateError] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [rejecting, setRejecting] = useState<ScoreTemplateResponse | null>(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);
  const busy = submit.isPending || approve.isPending || reject.isPending || activate.isPending;

  if (templates.isLoading) return <LoadingState />;
  if (templates.isError) return <Alert tone="error">{text.BOARD_LOAD_ERROR}</Alert>;

  const needle = search.trim().toLowerCase();
  const items = (templates.data ?? [])
    .filter((template) => !template.tenantId)
    .filter(
      (template) =>
        needle === "" ||
        template.name.toLowerCase().includes(needle) ||
        template.code.toLowerCase().includes(needle) ||
        `v${template.version}`.includes(needle),
    )
    .sort((a, b) => b.version - a.version);
  const columns: LifecycleColumn[] = [
    { id: "DRAFT", title: statusLabels.DRAFT, tone: "neutral" },
    { id: "PENDING_APPROVAL", title: statusLabels.PENDING_APPROVAL, tone: "warning" },
    { id: "ACTIVE", title: statusLabels.ACTIVE, tone: "success" },
    { id: "RETIRED", title: statusLabels.RETIRED, tone: "info" },
  ];
  const options = {
    onSuccess: () => showToast(text.MOVE_DONE, { tone: "success" }),
    onError: (error: unknown) =>
      showToast(getScoreTemplateErrorMessage(error, text.ACTION_ERROR), { tone: "error" }),
  };
  // One entry for the buttons and for a drop. Putting a template in use retires the one in use, so it asks first.
  const run = (template: ScoreTemplateResponse, move: TemplateMove): void => {
    if (move === "submit") submit.mutate(template.publicId, options);
    else if (move === "return") setRejecting(template);
    else {
      setActivateError(undefined);
      setActivating(template);
    }
  };
  // Approval and activation are two steps on the server, so a submission is approved first and then activated.
  const confirmActivate = async (template: ScoreTemplateResponse): Promise<void> => {
    let approved = template.status !== "PENDING_APPROVAL";
    try {
      if (!approved) {
        await approve.mutateAsync(template.publicId);
        approved = true;
      }
      await activate.mutateAsync(template.publicId);
      setActivating(null);
      showToast(text.MOVE_DONE, { tone: "success" });
    } catch (error) {
      const message = getScoreTemplateErrorMessage(error, text.ACTION_ERROR);
      setActivateError(
        approved && template.status === "PENDING_APPROVAL"
          ? `${text.APPROVED_NOT_ACTIVATED} ${message}`
          : message,
      );
    }
  };

  const closeReject = (): void => {
    setRejecting(null);
    setReason("");
    setReasonError(null);
  };
  const confirmReject = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!rejecting) return;
    if (!reason.trim()) {
      setReasonError(T.REJECT_REASON_REQUIRED);
      return;
    }
    reject.mutate(
      { publicId: rejecting.publicId, payload: { reason: reason.trim() } },
      { ...options, onSettled: closeReject },
    );
  };

  return (
    <div className="space-y-4">
      <BoardToolbar
        searchLabel={searchText.ariaLabel}
        placeholder={searchText.placeholder}
        search={search}
        onSearch={setSearch}
        end={leading}
      ></BoardToolbar>
      <LifecycleBoard
        columns={columns}
        items={items}
        columnOf={(template) => template.status}
        keyOf={(template) => template.publicId}
        emptyLabel={text.EMPTY_COLUMN}
        lockedLabel={text.LOCKED_NEEDS_REVIEWER}
        verdictOf={(template, target) => templateVerdict(template.status, target, canReview)}
        onMove={(template, target) => {
          const move = templateMove(template.status, target);
          if (move && !busy) run(template, move);
        }}
        renderCard={(template, drag) => (
          <BoardCard
            onClick={() =>
              router.push(`${templateHref(template)}?from=${encodeURIComponent(here)}`)
            }
            className={drag.draggable ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}
            draggable={drag.draggable}
            onDragStart={drag.onDragStart}
            onDragEnd={drag.onDragEnd}
            grip={drag.grip}
            gripLabel={text.KANBAN_DRAG}
            tags={
              <>
                <Chip tone="brand" size="sm">
                  v{template.version}
                </Chip>
                <span className="font-mono text-[11px] text-[var(--ink-muted)]">
                  {template.code}
                </span>
              </>
            }
            title={template.name}
            meta={updatedLabel(template.updatedAt)}
            menu={[
              {
                label: viewLabel,
                icon: EyeIcon,
                onSelect: () =>
                  router.push(`${templateHref(template)}?from=${encodeURIComponent(here)}`),
              },
            ]}
            note={
              <>
                {text.TEMPLATE_TASK_TYPES.replace("{count}", String(template.items.length))}
                {template.status === "DRAFT" && template.rejectionReason && (
                  <span className="mt-1.5 block rounded-md bg-[var(--blush-tint)] px-2 py-1 text-[var(--blush-action)]">
                    {template.rejectionReason}
                  </span>
                )}
              </>
            }
            authorName={authorName(template.authorUserPublicId)}
            actions={
              <>
                {template.status === "DRAFT" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busy}
                    onClick={(event) => {
                      event.stopPropagation();
                      submit.mutate(template.publicId, options);
                    }}
                  >
                    {text.SUBMIT_APPROVAL}
                  </Button>
                )}
                {template.status === "PENDING_APPROVAL" && canReview && (
                  <>
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={(event) => {
                        event.stopPropagation();
                        run(template, "approve-activate");
                      }}
                    >
                      {text.APPROVE_ACTIVATE}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      appearance="ghost"
                      disabled={busy}
                      onClick={(event) => {
                        event.stopPropagation();
                        run(template, "return");
                      }}
                    >
                      {T.REJECT_ACTION}
                    </Button>
                  </>
                )}
                {template.status === "RETIRED" && canReview && (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busy}
                    onClick={(event) => {
                      event.stopPropagation();
                      run(template, "activate");
                    }}
                  >
                    {T.ACTIVATE_ACTION}
                  </Button>
                )}
              </>
            }
          />
        )}
      />
      <ActivateTemplateModal
        template={activating}
        isActivating={approve.isPending || activate.isPending}
        errorMessage={activateError}
        onCancel={() => setActivating(null)}
        onConfirm={(template) => void confirmActivate(template)}
      />
      <Modal
        open={rejecting !== null}
        onClose={closeReject}
        title={T.REJECT_MODAL_TITLE}
        footer={
          <>
            <Button variant="ghost" onClick={closeReject} disabled={reject.isPending}>
              {T.REJECT_CANCEL}
            </Button>
            <Button type="submit" form="studio-reject-template-form" isLoading={reject.isPending}>
              {T.REJECT_CONFIRM}
            </Button>
          </>
        }
      >
        <form id="studio-reject-template-form" className="space-y-4" onSubmit={confirmReject}>
          <Input
            label={T.REJECT_REASON_LABEL}
            placeholder={T.REJECT_REASON_PLACEHOLDER}
            value={reason}
            error={reasonError ?? undefined}
            onChange={(event) => setReason(event.target.value)}
            maxLength={500}
            required
          />
        </form>
      </Modal>
    </div>
  );
};
