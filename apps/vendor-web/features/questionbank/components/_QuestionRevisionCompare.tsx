"use client";

import { useState, type ReactElement } from "react";
import { getUserFacingApiErrorMessage, type QuestionResponse } from "@pte/api-client";
import { Alert, LoadingState, Select, useLocale } from "@pte/ui";
import { AuditChangeDiff } from "@/features/auditLog/components";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { useQuestionRevisions } from "../api";
import { QUESTION_STATUS_LABELS as RAW_QUESTION_STATUS_LABELS } from "../constants";
import { QUESTION_HISTORY_COPY } from "../historyConstants";
import { questionAuditState } from "../questionAuditState";

interface QuestionRevisionCompareProps {
  publicId: string;
}

/** The revision a question replaced, or the next older one, as the default left side of the comparison. */
function previousRevisionId(revisions: QuestionResponse[], current: QuestionResponse): string {
  const replaced = revisions.find((revision) => revision.publicId === current.supersedesPublicId);
  const older = revisions.find(
    (revision) => (revision.revisionNumber ?? 0) < (current.revisionNumber ?? 0),
  );
  return (replaced ?? older ?? current).publicId;
}

/** Compares the authored content (prompt, options, answer key) of two revisions of one question. */
export const QuestionRevisionCompare = ({
  publicId,
}: QuestionRevisionCompareProps): ReactElement => {
  const { locale } = useLocale();
  const T = QUESTION_HISTORY_COPY[locale];
  // Widened so an API status the web has no label for (for example APPROVED) falls back to the raw value.
  const statusLabels = useAdminCopy(RAW_QUESTION_STATUS_LABELS) as Record<string, string>;
  const revisions = useQuestionRevisions(publicId);
  const [fromId, setFromId] = useState<string | null>(null);
  const [toId, setToId] = useState(publicId);

  if (revisions.isLoading) return <LoadingState label={T.LOADING} />;
  if (revisions.error || !revisions.data) {
    return (
      <Alert tone="error">{getUserFacingApiErrorMessage(revisions.error, T.LOAD_FAILED)}</Alert>
    );
  }
  const list = revisions.data;
  if (list.length < 2)
    return <p className="text-sm text-[var(--ink-secondary)]">{T.SINGLE_VERSION}</p>;

  const byId = new Map(list.map((revision) => [revision.publicId, revision]));
  const to = byId.get(toId) ?? list[0];
  const from = byId.get(fromId ?? previousRevisionId(list, to)) ?? list[list.length - 1];
  const options = list.map((revision) => ({
    value: revision.publicId,
    label:
      T.VERSION_LABEL.replace("{number}", String(revision.revisionNumber ?? 1)).replace(
        "{status}",
        statusLabels[String(revision.status).toLowerCase()] ?? String(revision.status),
      ) + (revision.current ? T.CURRENT_SUFFIX : ""),
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          id="question-revision-from"
          label={T.COMPARE_FROM}
          options={options}
          value={from.publicId}
          onChange={(event) => setFromId(event.target.value)}
        />
        <Select
          id="question-revision-to"
          label={T.COMPARE_TO}
          options={options}
          value={to.publicId}
          onChange={(event) => setToId(event.target.value)}
        />
      </div>
      <AuditChangeDiff before={questionAuditState(from)} after={questionAuditState(to)} />
    </div>
  );
};
