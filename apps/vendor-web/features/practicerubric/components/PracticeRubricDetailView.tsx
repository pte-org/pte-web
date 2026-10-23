"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Alert, Badge, Button, DashboardCard, Input, LoadingState, Modal, PageHeader, Select, Textarea, useToast } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { canReviewAcademic, isPlatformAdmin } from "@/features/auth/permissions";
import { useCurrentUser } from "@/features/auth/api";
import { useClonePracticeRubric, useOverridePublishPracticeRubric, usePracticeRubric, usePracticeRubrics, usePracticeRubricDiff, usePracticeRubricReadiness, usePublishPracticeRubric, useRejectPracticeRubric, useRetirePracticeRubric } from "../api";
import { PRACTICE_RUBRIC_BASE_PATH, PRACTICE_RUBRIC_ERROR_MESSAGES, PRACTICE_RUBRIC_STATUS_LABELS as RAW_STATUS_LABELS, PRACTICE_RUBRIC_STATUS_VARIANT, PRACTICE_RUBRIC_TEXT as RAW_TEXT } from "../constants";
import { getPracticeRubricErrorMessage } from "../errorMessage";
import { parseRubricDocument, type RubricDocumentDraft } from "../types";

export function PracticeRubricDetailView({ publicId }: { publicId: string }): ReactElement {
  const T = useAdminCopy(RAW_TEXT);
  const errorMessages = useAdminCopy(PRACTICE_RUBRIC_ERROR_MESSAGES);
  const labels = useAdminCopy(RAW_STATUS_LABELS);
  const router = useRouter();
  const { data: rubric, isLoading, isError, error } = usePracticeRubric(publicId);
  const { data: readiness, isError: readinessError, error: readinessRequestError } = usePracticeRubricReadiness(publicId);
  const [compareId, setCompareId] = useState("");
  const { data: relatedRubrics } = usePracticeRubrics({ page: 0, size: 100, taskTypeKey: rubric?.taskTypeKey });
  const { data: diff } = usePracticeRubricDiff(publicId, compareId);
  const { data: currentUser } = useCurrentUser();
  const localizedBlockers = (readiness?.blockers ?? []).map((blocker) => errorMessages[blocker] ?? blocker);
  const cloneMutation = useClonePracticeRubric();
  const publishMutation = usePublishPracticeRubric();
  const overrideMutation = useOverridePublishPracticeRubric();
  const rejectMutation = useRejectPracticeRubric();
  const retireMutation = useRetirePracticeRubric();
  const { showToast } = useToast();
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishReason, setPublishReason] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  if (isLoading) return <LoadingState rows={8} />;
  if (isError || !rubric) return <Alert tone="error">{getPracticeRubricErrorMessage(error, T.LOAD_ERROR, errorMessages)}</Alert>;
  let document: RubricDocumentDraft;
  try { document = parseRubricDocument(rubric); } catch { return <Alert tone="error">{T.INVALID_DOCUMENT}</Alert>; }
  const canReview = canReviewAcademic(currentUser?.roles);
  const ready = readiness?.ready === true;
  const canOverride = isPlatformAdmin(currentUser?.roles);

  const publish = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!publishReason.trim()) return;
    const input = { publicId: rubric.publicId, payload: { reason: publishReason.trim(), expectedVersion: rubric.entityVersion } };
    (canOverride ? overrideMutation : publishMutation).mutate(input, { onSuccess: () => { setPublishOpen(false); showToast(T.PUBLISHED, { tone: "success" }); } });
  };
  const reject = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!rejectReason.trim()) return;
    rejectMutation.mutate({ publicId: rubric.publicId, payload: { reason: rejectReason.trim() } }, { onSuccess: () => { setRejectOpen(false); showToast(T.RETURNED, { tone: "success" }); } });
  };

  return (
    <div className="space-y-6">
      <PageHeader title={`${rubric.name} v${rubric.version}`} actions={<><Button variant="secondary" onClick={() => router.push(PRACTICE_RUBRIC_BASE_PATH)}>{T.BACK}</Button><Button variant="secondary" isLoading={cloneMutation.isPending} onClick={() => cloneMutation.mutate(rubric.publicId, { onSuccess: (draft) => router.push(`${PRACTICE_RUBRIC_BASE_PATH}/${draft.publicId}/edit`) })}>{T.CLONE}</Button>{rubric.status === "PENDING_APPROVAL" && canReview && <Button disabled={!ready} onClick={() => { setPublishReason(""); setPublishOpen(true); }}>{T.PUBLISH}</Button>}{rubric.status === "PENDING_APPROVAL" && canReview && <Button variant="danger" onClick={() => { setRejectReason(""); setRejectOpen(true); }}>{T.REJECT}</Button>}{rubric.status === "PUBLISHED" && canReview && <Button variant="danger" isLoading={retireMutation.isPending} onClick={() => retireMutation.mutate({ publicId: rubric.publicId, expectedVersion: rubric.entityVersion }, { onSuccess: () => showToast(T.RETIRED, { tone: "success" }) })}>{T.RETIRE}</Button>}</>} />
      {cloneMutation.isError && <Alert tone="error">{getPracticeRubricErrorMessage(cloneMutation.error, T.ACTION_ERROR, errorMessages)}</Alert>}
      {(publishMutation.isError || overrideMutation.isError) && <Alert tone="error">{getPracticeRubricErrorMessage(publishMutation.error ?? overrideMutation.error, T.ACTION_ERROR, errorMessages)}</Alert>}
      {rejectMutation.isError && <Alert tone="error">{getPracticeRubricErrorMessage(rejectMutation.error, T.ACTION_ERROR, errorMessages)}</Alert>}
      {retireMutation.isError && <Alert tone="error">{getPracticeRubricErrorMessage(retireMutation.error, T.ACTION_ERROR, errorMessages)}</Alert>}
      <DashboardCard className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-mono text-sm">{rubric.rubricKey}</p><p className="text-sm text-[var(--ink-muted)]">{rubric.taskTypeKey} · {rubric.channel}</p></div><Badge variant={PRACTICE_RUBRIC_STATUS_VARIANT[rubric.status] ?? "neutral"}>{labels[rubric.status] ?? rubric.status}</Badge></div><div className="grid gap-4 md:grid-cols-3"><div><p className="text-xs text-[var(--ink-muted)]">{T.CANONICAL_HASH}</p><p className="break-all font-mono text-xs">{rubric.canonicalHash ?? T.NOT_PUBLISHED}</p></div><div><p className="text-xs text-[var(--ink-muted)]">{T.REVISION_ENTITY_VERSION}</p><p>{rubric.entityVersion ?? "—"}</p></div><div><p className="text-xs text-[var(--ink-muted)]">{T.READINESS}</p>{readinessError ? <p className="text-sm text-[var(--danger)]">{getPracticeRubricErrorMessage(readinessRequestError, T.READINESS_ERROR, errorMessages)}</p> : <div><p>{ready ? T.READY : T.NOT_READY}</p>{!ready && localizedBlockers.length ? <ul className="mt-2 list-disc pl-5 text-xs text-[var(--ink-muted)]">{localizedBlockers.map((blocker) => <li key={blocker}>{blocker}</li>)}</ul> : null}</div>}</div></div></DashboardCard>
      <DashboardCard className="space-y-5"><h2 className="text-base font-semibold">{T.CRITERIA}</h2>{document.criteria.map((criterion) => <section key={criterion.criterionId} className="space-y-3 rounded-lg border border-[var(--shell-border)] p-4"><div className="flex items-center justify-between"><span className="font-mono text-sm font-semibold">{criterion.criterionId}</span><span className="text-xs text-[var(--ink-muted)]">{criterion.evidencePolicy.requiredTypes.join(", ")}</span></div>{criterion.levels.map((level) => <div key={level.key} className="grid gap-2 border-t border-[var(--divider)] pt-2 md:grid-cols-[140px_1fr_1fr_2fr]"><span className="text-xs font-semibold">{level.key}</span><span className="text-sm">{level.labelVi}</span><span className="text-sm">{level.labelEn}</span><span className="text-sm text-[var(--ink-secondary)]">{level.descriptor}</span></div>)}</section>)}</DashboardCard>
      <DashboardCard className="space-y-4"><h2 className="text-base font-semibold">{T.DIFF}</h2><div className="max-w-xl"><Select label={T.COMPARE_WITH_REVISION} value={compareId} onChange={(event) => setCompareId(event.target.value)} placeholder={T.SELECT_REVISION} options={(relatedRubrics?.data ?? []).filter((item) => item.publicId !== rubric.publicId).map((item) => ({ value: item.publicId, label: `v${item.version} · ${labels[item.status] ?? item.status}` }))} /></div>{diff && <div className="space-y-2 text-sm"><p>{diff.canonicalChanged ? T.CANONICAL_CHANGED : T.CANONICAL_UNCHANGED}</p>{diff.changedPaths.length > 0 ? <ul className="list-disc pl-5 text-[var(--ink-secondary)]">{diff.changedPaths.map((path) => <li key={path} className="font-mono text-xs">{path}</li>)}</ul> : <p className="text-[var(--ink-muted)]">{T.NO_CHANGED_FIELDS}</p>}</div>}</DashboardCard>
      <DashboardCard className="space-y-4"><h2 className="text-base font-semibold">{T.ANCHORS}</h2>{document.anchors.length === 0 ? <p className="text-sm text-[var(--ink-muted)]">{T.NO_ANCHORS}</p> : document.anchors.map((anchor) => <div key={anchor.exampleKey} className="rounded-lg border border-[var(--shell-border)] p-3"><p className="font-mono text-xs">{anchor.criterionId} · {anchor.level} · {anchor.approvalStatus}</p><p className="mt-2 text-sm">{anchor.sanitizedResponse}</p><p className="mt-1 text-xs text-[var(--ink-muted)]">{anchor.evidenceNote}</p></div>)}</DashboardCard>

      <Modal open={publishOpen} onClose={() => setPublishOpen(false)} title={T.PUBLISH_MODAL_TITLE} footer={<><Button variant="ghost" onClick={() => setPublishOpen(false)}>{T.CANCEL}</Button><Button type="submit" form="publish-rubric" isLoading={publishMutation.isPending || overrideMutation.isPending}>{T.PUBLISH}</Button></>}><form id="publish-rubric" className="space-y-4" onSubmit={publish}><Textarea label={T.PUBLISH_REASON} helperText={T.PUBLISH_REASON_HINT} value={publishReason} onChange={(event) => setPublishReason(event.target.value)} required rows={3} /></form></Modal>
      <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title={T.REJECT_MODAL_TITLE} footer={<><Button variant="ghost" onClick={() => setRejectOpen(false)}>{T.CANCEL}</Button><Button variant="danger" type="submit" form="reject-rubric" isLoading={rejectMutation.isPending}>{T.REJECT}</Button></>}><form id="reject-rubric" className="space-y-4" onSubmit={reject}><Input label={T.REJECT_REASON} value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} required maxLength={1000} /></form></Modal>
    </div>
  );
}
