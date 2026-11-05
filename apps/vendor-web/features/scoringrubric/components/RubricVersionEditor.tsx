"use client";
import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, ErrorState, PageHeader, Select, useLocale } from "@pte/ui";
import type { RubricStatusRequest, RubricVersionResponse, TaskTypeRubricResponse } from "@pte/api-client";
import { useCurrentUser } from "@/features/auth/api";
import { useCreateRubricVersion, useUpdateRubricVersion, useRubricVersionStatus } from "../versionApi";
import { parametersFromRubrics, parametersLookValid, versionActions } from "../versionEditing";
import { RUBRIC_EDIT_CONFIG, RUBRIC_EDIT_TEXT } from "../versionConstants";
import { rubricVersionError } from "../versionErrorMessage";
import { TraitWeightEditor } from "./_TraitWeightEditor";
import { FormBandEditor } from "./_FormBandEditor";
import { VersionStatusBar } from "./_VersionStatusBar";
import { ActivateConfirmDialog } from "./_ActivateConfirmDialog";
import { RejectDialog } from "./_RejectDialog";
import { ActivationHistory } from "./_ActivationHistory";

interface RubricVersionEditorProps { version: RubricVersionResponse; rubrics: TaskTypeRubricResponse[] }
export const RubricVersionEditor = ({ version, rubrics }: RubricVersionEditorProps): ReactElement => {
  const { locale } = useLocale();
  const T = RUBRIC_EDIT_TEXT[locale === "vi" ? "vi" : "en"];
  const router = useRouter();
  const current = useCurrentUser();
  const [parameters, setParameters] = useState(() => parametersFromRubrics(rubrics));
  const [baseline, setBaseline] = useState(() => JSON.stringify(parameters));
  // Capture the version that produced this editor, not a background query's newer lock version.
  const [expectedLockVersion, setExpectedLockVersion] = useState(version.lockVersion ?? 0);
  const [selected, setSelected] = useState(rubrics.find((task) => task.traits.length)?.taskType ?? "");
  const [dialog, setDialog] = useState<"ACTIVATE" | "REJECT" | null>(null);
  const update = useUpdateRubricVersion(version.publicId);
  const create = useCreateRubricVersion();
  const status = useRubricVersionStatus(version.publicId);
  const roles = current.data?.roles ?? [];
  const actions = versionActions(version.status, roles, version.authorUserPublicId === current.data?.publicId);
  const author = versionActions("DRAFT", roles, false).edit;
  const dirty = JSON.stringify(parameters) !== baseline;
  const valid = parametersLookValid(parameters, rubrics);
  const busy = update.isPending || create.isPending || status.isPending;
  const error = update.error ?? create.error ?? status.error;
  const message = error ? rubricVersionError(error, T) : null;
  const rubric = rubrics.find((entry) => entry.taskType === selected);
  const value = parameters.taskTypes[selected];
  const save = (): void => update.mutate({ parameters, expectedLockVersion }, { onSuccess: (saved) => {
    setExpectedLockVersion(saved.lockVersion ?? expectedLockVersion);
    setBaseline(JSON.stringify(parameters));
  } });
  const change = (request: RubricStatusRequest): void => status.mutate(request, { onSuccess: () => {
    setDialog(null);
    if (request.action === "DISCARD") router.push(RUBRIC_EDIT_CONFIG.basePath);
  } });
  const action = (action: RubricStatusRequest["action"]): void => {
    status.reset();
    if (action === "ACTIVATE" || action === "REJECT") setDialog(action);
    else change({ action });
  };
  return <div className="space-y-6"><PageHeader title={`${T.title} ${version.versionNo}`} actions={author && <Button variant="secondary" disabled={busy || dirty}
    onClick={() => create.mutate({ parameters }, { onSuccess: (created) => router.push(`${RUBRIC_EDIT_CONFIG.basePath}/${created.publicId}`) })}>{T.clone}</Button>} />
    <VersionStatusBar version={version} actions={actions} dirty={dirty} valid={valid} busy={busy} text={T} onSave={save} onAction={action} />
    {dirty && <Alert>{T.unsaved}</Alert>}{!valid && <Alert tone="error">{T.invalid}</Alert>}
    {message && <ErrorState title={message} />}
    {version.status === "PENDING" && <Alert>{T.pending}</Alert>}
    {["ACTIVE", "RETIRED"].includes(version.status) && <Alert>{T.readonly}</Alert>}
    {version.rejectionReason && <Alert tone="warning">{version.rejectionReason}</Alert>}
    <Select label={T.task} value={selected} options={rubrics.filter((entry) => entry.traits.length > 0).map((entry) => ({ value: entry.taskType, label: entry.taskType }))}
      onChange={(event) => setSelected(event.target.value)} />
    {rubric && value && <div className="grid gap-6 lg:grid-cols-2">
      <TraitWeightEditor rubric={rubric} value={value} disabled={!actions.edit || busy} text={T}
        onChange={(changed) => setParameters({ ...parameters, taskTypes: { ...parameters.taskTypes, [selected]: changed } })} />
      {value.formBands && <FormBandEditor bands={value.formBands} maxBand={rubric.traits.find((trait) => trait.key === "FORM")?.maxScore ?? 0}
        disabled={!actions.edit || busy} text={T} onChange={(bands) => setParameters({ ...parameters,
          taskTypes: { ...parameters.taskTypes, [selected]: { ...value, formBands: bands } } })} />}
    </div>}
    <ActivationHistory id={version.publicId} text={T} />
    {dialog === "ACTIVATE" && <ActivateConfirmDialog id={version.publicId} pending={status.isPending} text={T} error={message} onClose={() => setDialog(null)} onConfirm={change} />}
    {dialog === "REJECT" && <RejectDialog pending={status.isPending} text={T} error={message} onClose={() => setDialog(null)} onReject={(reason) => change({ action: "REJECT", reason })} />}
  </div>;
};
