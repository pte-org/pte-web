"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Checkbox, DashboardCard, Input, LoadingState, NumberInput, PageHeader, Textarea, useToast } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import { usePracticeRubric, usePracticeRubricReadiness, useReplacePracticeRubricDocument, useSubmitPracticeRubricApproval } from "../api";
import { PRACTICE_RUBRIC_BASE_PATH, PRACTICE_RUBRIC_ERROR_MESSAGES, PRACTICE_RUBRIC_TEXT as RAW_TEXT } from "../constants";
import { getPracticeRubricErrorMessage } from "../errorMessage";
import { DEFAULT_LEVELS, parseRubricDocument, serializeRubricDocument, type RubricCriterionDraft, type RubricDocumentDraft } from "../types";

export function PracticeRubricEditorView({ publicId }: { publicId: string }): ReactElement {
  const T = useAdminCopy(RAW_TEXT);
  const errorMessages = useAdminCopy(PRACTICE_RUBRIC_ERROR_MESSAGES);
  const { data: rubric, isLoading, isError, error } = usePracticeRubric(publicId);
  const { data: readiness, isLoading: readinessLoading, isError: readinessError, error: readinessRequestError } = usePracticeRubricReadiness(publicId);
  const localizedBlockers = (readiness?.blockers ?? []).map((blocker) => errorMessages[blocker] ?? blocker);
  if (isLoading) return <LoadingState rows={8} />;
  if (isError || !rubric) return <Alert tone="error">{getPracticeRubricErrorMessage(error, T.LOAD_ERROR, errorMessages)}</Alert>;
  if (rubric.status !== "DRAFT") return <Alert tone="warning">{T.NOT_DRAFT}</Alert>;
  return <PracticeRubricEditorForm key={`${rubric.publicId}-${rubric.entityVersion ?? "unknown"}`} rubric={rubric} readiness={readiness} readinessBlockers={localizedBlockers} errorMessages={errorMessages} readinessLoading={readinessLoading} readinessError={readinessError ? getPracticeRubricErrorMessage(readinessRequestError, T.READINESS_ERROR, errorMessages) : null} />;
}

function PracticeRubricEditorForm({ rubric, readiness, readinessBlockers, errorMessages, readinessLoading, readinessError }: { rubric: import("@pte/api-client").PracticeRubricResponse; readiness?: import("@pte/api-client").PracticeRubricReadinessResponse; readinessBlockers: string[]; errorMessages: Record<string, string>; readinessLoading: boolean; readinessError: string | null }): ReactElement {
  const T = useAdminCopy(RAW_TEXT);
  const router = useRouter();
  const { showToast } = useToast();
  const [document, setDocument] = useState<RubricDocumentDraft>(() => parseRubricDocument(rubric));
  const [changeReason, setChangeReason] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const saveMutation = useReplacePracticeRubricDocument();
  const submitMutation = useSubmitPracticeRubricApproval();
  const ready = readiness?.ready === true;

  const updateCriterion = (index: number, update: (criterion: RubricCriterionDraft) => RubricCriterionDraft): void => {
    setDocument((current) => ({ ...current, criteria: current.criteria.map((criterion, criterionIndex) => criterionIndex === index ? update(criterion) : criterion) }));
  };
  const updateRuntime = <K extends keyof RubricDocumentDraft["runtime"]>(field: K, value: RubricDocumentDraft["runtime"][K]): void => {
    setDocument((current) => ({ ...current, runtime: { ...current.runtime, [field]: value } }));
  };
  const updateLevel = (criterionIndex: number, levelIndex: number, field: "labelVi" | "labelEn" | "descriptor", value: string): void => {
    updateCriterion(criterionIndex, (criterion) => ({ ...criterion, levels: criterion.levels.map((level, index) => index === levelIndex ? { ...level, [field]: value } : level) }));
  };
  const updatePolicy = (field: keyof RubricDocumentDraft["policies"], value: string): void => {
    setDocument((current) => ({ ...current, policies: { ...current.policies, [field]: value } }));
  };
  const save = (): void => {
    setErrorMessage(null);
    saveMutation.mutate({ publicId: rubric.publicId, payload: { documentJson: serializeRubricDocument(document), changeReason: changeReason.trim() || undefined, expectedVersion: rubric.entityVersion } }, { onSuccess: () => showToast(T.SAVED, { tone: "success" }), onError: (caught) => setErrorMessage(getPracticeRubricErrorMessage(caught, T.SAVE_ERROR, errorMessages)) });
  };
  const submit = (): void => {
    setErrorMessage(null);
    submitMutation.mutate(rubric.publicId, { onSuccess: () => { showToast(T.SUBMITTED, { tone: "success" }); router.push(PRACTICE_RUBRIC_BASE_PATH); }, onError: (caught) => setErrorMessage(getPracticeRubricErrorMessage(caught, T.ACTION_ERROR, errorMessages)) });
  };
  const addAnchor = (): void => {
    const firstCriterion = document.criteria[0];
    if (!firstCriterion) return;
    setDocument((current) => ({ ...current, anchors: [...current.anchors, { criterionId: firstCriterion.criterionId, level: "DEVELOPING", exampleKey: `EXAMPLE-${current.anchors.length + 1}`, sanitizedResponse: "", evidenceNote: "", approvalStatus: "PENDING" }] }));
  };
  const updateReference = (index: number, field: "referenceKey" | "sourceArtifact" | "sourceRevision" | "contentHash", value: string): void => {
    setDocument((current) => ({ ...current, references: current.references.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) }));
  };
  const updateAnchor = (index: number, field: "criterionId" | "level" | "sanitizedResponse" | "evidenceNote", value: string): void => {
    setDocument((current) => ({ ...current, anchors: current.anchors.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) }));
  };

  return <div className="space-y-6">
    <PageHeader title={`${rubric.name} v${rubric.version}`} actions={<><Button variant="secondary" onClick={() => router.push(PRACTICE_RUBRIC_BASE_PATH)}>{T.CANCEL}</Button><Button variant="secondary" isLoading={saveMutation.isPending} onClick={save}>{T.SAVE}</Button><Button disabled={readinessLoading || readinessError !== null || !ready} isLoading={submitMutation.isPending} onClick={submit}>{T.SUBMIT}</Button></>} />
    {errorMessage && <Alert tone="error">{errorMessage}</Alert>}
    <Alert tone={readinessError ? "error" : ready ? "success" : "warning"}>{readinessLoading ? T.CHECKING_READINESS : readinessError ? readinessError : ready ? T.READY : <><span>{T.NOT_READY}</span>{readinessBlockers.length ? <ul className="mt-2 list-disc pl-5">{readinessBlockers.map((blocker) => <li key={blocker}>{blocker}</li>)}</ul> : <span>: {T.REVIEW_REQUIRED_FIELDS}</span>}</>}</Alert>

    <DashboardCard className="space-y-4"><h2 className="text-base font-semibold">{T.RUNTIME}</h2><div className="grid gap-4 md:grid-cols-3">
      <Input label={T.PROFILE_KEY} value={document.runtime.profileKey} onChange={(event) => updateRuntime("profileKey", event.target.value)} />
      <NumberInput label={T.PROFILE_VERSION} value={document.runtime.profileVersion} onChange={(event) => updateRuntime("profileVersion", Number(event.target.value))} />
      <Input label={T.BEHAVIOR_KEY} value={document.runtime.behaviorKey} onChange={(event) => updateRuntime("behaviorKey", event.target.value)} />
      <Input label={T.RENDERER_KEY} value={document.runtime.rendererKey} onChange={(event) => updateRuntime("rendererKey", event.target.value)} />
      <NumberInput label={T.ANSWER_SCHEMA_VERSION} value={document.runtime.answerSchemaVersion} onChange={(event) => updateRuntime("answerSchemaVersion", Number(event.target.value))} />
      <Input label={T.SCREEN_KEY} value={document.runtime.screenKey} onChange={(event) => updateRuntime("screenKey", event.target.value)} />
      <Input label={T.SCORING_PROFILE_KEY} value={document.runtime.scoringProfileKey} onChange={(event) => updateRuntime("scoringProfileKey", event.target.value)} />
      <NumberInput label={T.SCORING_PROFILE_VERSION} value={document.runtime.scoringProfileVersion} onChange={(event) => updateRuntime("scoringProfileVersion", Number(event.target.value))} />
      <Input label={T.REQUIRED_CAPABILITIES} value={document.runtime.requiredClientCapabilities.join(", ")} onChange={(event) => updateRuntime("requiredClientCapabilities", event.target.value.split(",").map((value) => value.trim()).filter(Boolean))} />
      <NumberInput label={T.CONTRACT_VERSION} value={document.runtime.contractVersion} onChange={(event) => updateRuntime("contractVersion", Number(event.target.value))} />
      <Input label={T.SCORING_MODE} value={document.runtime.scoringMode} onChange={(event) => updateRuntime("scoringMode", event.target.value)} />
      <Input label={T.MIN_SUPPORTED_APP_VERSION} value={document.runtime.minSupportedAppVersion} onChange={(event) => updateRuntime("minSupportedAppVersion", event.target.value)} />
      <Input label={T.AUTHORING_CONTRACT_KEY} value={document.runtime.authoringContractKey} onChange={(event) => updateRuntime("authoringContractKey", event.target.value)} />
      <NumberInput label={T.AUTHORING_CONTRACT_VERSION} value={document.runtime.authoringContractVersion} onChange={(event) => updateRuntime("authoringContractVersion", Number(event.target.value))} />
    </div><Input label={T.CHANGE_REASON} value={changeReason} onChange={(event) => setChangeReason(event.target.value)} maxLength={1000} helperText={T.AUDIT_CHANGE_HINT} /></DashboardCard>

    <DashboardCard className="space-y-4"><h2 className="text-base font-semibold">{T.POLICY}</h2><div className="grid gap-3 md:grid-cols-2">
      <Input label={T.EMPTY_RESPONSE_POLICY} value={document.policies.emptyResponse} onChange={(event) => updatePolicy("emptyResponse", event.target.value)} /><Input label={T.INVALID_RESPONSE_POLICY} value={document.policies.invalidResponse} onChange={(event) => updatePolicy("invalidResponse", event.target.value)} /><Input label={T.OFF_TOPIC_POLICY} value={document.policies.offTopicResponse} onChange={(event) => updatePolicy("offTopicResponse", event.target.value)} /><Input label={T.NUMERIC_SCORE_POLICY} value={document.policies.unsupportedNumericScore} onChange={(event) => updatePolicy("unsupportedNumericScore", event.target.value)} /><Input label={T.OFFICIAL_SCORE_POLICY} value={document.policies.officialScoreClaim} onChange={(event) => updatePolicy("officialScoreClaim", event.target.value)} />
    </div></DashboardCard>

    <DashboardCard className="space-y-6"><h2 className="text-base font-semibold">{T.CRITERIA}</h2>{document.criteria.map((criterion, criterionIndex) => <section key={criterion.criterionId} className="space-y-4 rounded-lg border border-[var(--shell-border)] p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-mono text-sm font-semibold">{criterion.criterionId}</p><p className="text-xs text-[var(--ink-muted)]">{T.EVIDENCE_PREFIX}: {criterion.evidencePolicy.requiredTypes.join(", ")}</p></div><Checkbox id={`criterion-required-${criterionIndex}`} label={T.REQUIRED} checked={criterion.required} onChange={(event) => updateCriterion(criterionIndex, (current) => ({ ...current, required: event.target.checked }))} /></div><div className="grid gap-3 md:grid-cols-3"><Input label={T.APPLICABILITY} value={criterion.applicability} onChange={(event) => updateCriterion(criterionIndex, (current) => ({ ...current, applicability: event.target.value }))} /><Input label={T.ALLOWED_LEVELS} value={criterion.allowedLevels.join(", ")} onChange={(event) => updateCriterion(criterionIndex, (current) => ({ ...current, allowedLevels: event.target.value.split(",").map((value) => value.trim()).filter(Boolean) }))} /><Input label={T.EVIDENCE} value={criterion.evidencePolicy.requiredTypes.join(", ")} onChange={(event) => updateCriterion(criterionIndex, (current) => ({ ...current, evidencePolicy: { ...current.evidencePolicy, requiredTypes: event.target.value.split(",").map((value) => value.trim()).filter(Boolean) } }))} /><Input label={T.MINIMUM_COVERAGE} value={criterion.evidencePolicy.minimumCoverage} onChange={(event) => updateCriterion(criterionIndex, (current) => ({ ...current, evidencePolicy: { ...current.evidencePolicy, minimumCoverage: event.target.value } }))} /><Checkbox id={`criterion-evidence-${criterionIndex}`} label={T.ALLOW_NOT_ASSESSABLE} checked={criterion.evidencePolicy.allowNotAssessable} onChange={(event) => updateCriterion(criterionIndex, (current) => { const allow = event.target.checked; const notAssessable = current.levels.find((level) => level.key === "NOT_ASSESSABLE"); return { ...current, allowedLevels: allow ? Array.from(new Set([...current.allowedLevels, "NOT_ASSESSABLE"])) : current.allowedLevels.filter((level) => level !== "NOT_ASSESSABLE"), levels: allow && !notAssessable ? [...current.levels, { ...DEFAULT_LEVELS[0] }] : allow ? current.levels : current.levels.filter((level) => level.key !== "NOT_ASSESSABLE"), evidencePolicy: { ...current.evidencePolicy, allowNotAssessable: allow } }; })} /></div>{criterion.levels.map((level, levelIndex) => <div key={level.key} className="grid gap-3 border-t border-[var(--divider)] pt-3 md:grid-cols-[140px_1fr_1fr_2fr]"><div className="pt-2 text-xs font-semibold text-[var(--ink-secondary)]">{level.key}</div><Input aria-label={`${level.key} ${T.LABEL_VI}`} value={level.labelVi} onChange={(event) => updateLevel(criterionIndex, levelIndex, "labelVi", event.target.value)} /><Input aria-label={`${level.key} ${T.LABEL_EN}`} value={level.labelEn} onChange={(event) => updateLevel(criterionIndex, levelIndex, "labelEn", event.target.value)} /><Textarea aria-label={`${level.key} ${T.DESCRIPTOR}`} value={level.descriptor} onChange={(event) => updateLevel(criterionIndex, levelIndex, "descriptor", event.target.value)} rows={2} /></div>)}</section>)}</DashboardCard>

    <DashboardCard className="space-y-4"><h2 className="text-base font-semibold">{T.PROVENANCE}</h2><div className="grid gap-3 md:grid-cols-2"><Input label={T.SOURCE_DOCUMENT} value={document.provenance.sourceDocument} onChange={(event) => setDocument((current) => ({ ...current, provenance: { ...current.provenance, sourceDocument: event.target.value } }))} /><Input label={T.SOURCE_REVISION} value={document.provenance.sourceRevision} onChange={(event) => setDocument((current) => ({ ...current, provenance: { ...current.provenance, sourceRevision: event.target.value } }))} /><Checkbox id="academic-approval-required" label={T.ACADEMIC_APPROVAL_REQUIRED} checked={document.provenance.academicApprovalRequired} onChange={(event) => setDocument((current) => ({ ...current, provenance: { ...current.provenance, academicApprovalRequired: event.target.checked } }))} /></div><div className="flex items-center justify-between"><h2 className="text-base font-semibold">{T.SOURCE}</h2><span className="text-xs text-[var(--ink-muted)]">{document.references.length} {T.REFERENCE_COUNT}</span></div>{document.references.map((reference, index) => <div key={reference.referenceKey} className="grid gap-3 md:grid-cols-4"><Input label={T.REFERENCE_KEY} value={reference.referenceKey} onChange={(event) => updateReference(index, "referenceKey", event.target.value)} /><Input label={T.SOURCE_ARTIFACT} value={reference.sourceArtifact} onChange={(event) => updateReference(index, "sourceArtifact", event.target.value)} /><Input label={T.SOURCE_REVISION} value={reference.sourceRevision} onChange={(event) => updateReference(index, "sourceRevision", event.target.value)} /><Input label={T.CONTENT_HASH} value={reference.contentHash} onChange={(event) => updateReference(index, "contentHash", event.target.value)} /></div>)}<div className="flex items-center justify-between"><h2 className="text-base font-semibold">{T.ANCHORS}</h2><Button variant="secondary" size="sm" onClick={addAnchor}>{T.ADD_ANCHOR}</Button></div>{document.anchors.map((anchor, index) => <div key={anchor.exampleKey} className="space-y-3 rounded-lg border border-[var(--shell-border)] p-3"><div className="grid gap-3 md:grid-cols-3"><Input label={T.CRITERION} value={anchor.criterionId} onChange={(event) => updateAnchor(index, "criterionId", event.target.value)} /><Input label={T.LEVEL} value={anchor.level} onChange={(event) => updateAnchor(index, "level", event.target.value)} /><div className="space-y-1"><p className="text-sm font-medium">{T.ANCHOR_STATUS}</p><p className="rounded-md border border-[var(--shell-border)] px-3 py-2 text-sm text-[var(--ink-muted)]">{anchor.approvalStatus}</p></div></div><Textarea label={T.SANITIZED_RESPONSE} value={anchor.sanitizedResponse} onChange={(event) => updateAnchor(index, "sanitizedResponse", event.target.value)} rows={2} /><Textarea label={T.EVIDENCE_NOTE} value={anchor.evidenceNote} onChange={(event) => updateAnchor(index, "evidenceNote", event.target.value)} rows={2} /></div>)}</DashboardCard>
  </div>;
}
