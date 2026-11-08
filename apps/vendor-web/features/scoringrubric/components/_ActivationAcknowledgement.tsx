"use client";
import { useMemo, useState, type ReactElement } from "react";
import { Alert, Button, Checkbox, LoadingState, Textarea, useLocale } from "@pte/ui";
import type { RubricDiffResponse, RubricStatusRequest, TaskTypeRubricResponse } from "@pte/api-client";
import { useImpactSamples } from "../versionApi";
import { RUBRIC_EDIT_CONFIG } from "../versionConstants";
import { canConfirmActivation } from "../versionEditing";
import { MAX_IMPACT_TASK_TYPES, changedTaskTypes, impactScenarios, isHighImpact, scoreShift } from "../versionImpact";
import { traitDisplayName } from "../rubricView";
import type { RubricEditText } from "../versionTypes";
import { ImpactTable } from "./_ImpactTable";
import { VersionDiffPanel } from "./_VersionDiffPanel";

interface AcknowledgementProps {
  versionId: string;
  diff: RubricDiffResponse;
  /** The active rubric: its traits give the names, the scales and the sample answers. */
  activeRubrics: readonly TaskTypeRubricResponse[];
  pending: boolean;
  text: RubricEditText;
  onConfirm: (request: RubricStatusRequest) => void;
}

const formatPoints = (template: string, points: number): string => template.replace("{points}", String(points));

export const ActivationAcknowledgement = ({ versionId, diff, activeRubrics, pending, text: T, onConfirm }: AcknowledgementProps): ReactElement => {
  const { locale } = useLocale();
  const [checked, setChecked] = useState(false);
  const [reason, setReason] = useState("");
  const traitNames = useMemo(() => new Map(activeRubrics.flatMap((rubric) =>
    rubric.traits.map((trait) => [`${rubric.taskType}.${trait.key}`, traitDisplayName(trait, locale)] as const))), [activeRubrics, locale]);
  const scenarios = useMemo(() => changedTaskTypes(diff.changes).slice(0, MAX_IMPACT_TASK_TYPES).flatMap((taskType) => {
    const rubric = activeRubrics.find((entry) => entry.taskType === taskType);
    return rubric ? impactScenarios(rubric, diff.changes) : [];
  }), [activeRubrics, diff.changes]);
  const samples = useImpactSamples(scenarios, diff.expectedActiveVersionPublicId, versionId, diff.diffDigest);

  const calculating = samples.some((sample) => sample.pending);
  const failed = samples.some((sample) => sample.failed);
  const shifts = samples.flatMap((sample) => sample.before !== null && sample.after !== null ? [scoreShift(sample.before, sample.after)] : []);
  const biggest = shifts.reduce((top, shift) => Math.max(top, Math.abs(shift)), 0);
  const reasonRequired = !calculating && (failed || isHighImpact(shifts));
  const reasonOk = !reasonRequired || reason.trim().length > 0;

  return <div className="space-y-4">
    <Alert tone="info">{T.scopeWarning}</Alert>
    <VersionDiffPanel diff={diff} traitNames={traitNames} text={T} />
    {scenarios.length > 0 && <ImpactTable scenarios={scenarios} samples={samples} text={T} />}
    {calculating && <LoadingState rows={1} label={T.impactLoading} />}
    {!calculating && failed && <Alert tone="warning">{T.impactError}</Alert>}
    {!calculating && !failed && isHighImpact(shifts) && <Alert tone="warning">{formatPoints(T.bigSwing, biggest)}</Alert>}
    {reasonRequired && <Textarea label={T.reasonLabel} value={reason} required maxLength={RUBRIC_EDIT_CONFIG.maxReason} disabled={pending}
      onChange={(event) => setReason(event.target.value)} />}
    <Checkbox label={T.confirm} checked={checked} disabled={pending} onChange={(event) => setChecked(event.target.checked)} />
    <Button disabled={calculating || !canConfirmActivation(checked && reasonOk, diff.diffDigest, pending)} onClick={() => onConfirm({ action: "ACTIVATE",
      expectedActiveVersionPublicId: diff.expectedActiveVersionPublicId, confirmedDiffDigest: diff.diffDigest,
      ...(reason.trim() ? { reason: reason.trim() } : {}) })}>{T.activate}</Button>
  </div>;
};
