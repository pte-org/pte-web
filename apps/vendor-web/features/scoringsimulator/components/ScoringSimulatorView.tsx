"use client";

import { useEffect, useMemo, useState, type ReactElement } from "react";
import { Button, CollapsibleSection, DashboardCard, ErrorState, LoadingState, PageHeader, Select, useLocale } from "@pte/ui";
import type { TaskTypeRubricResponse } from "@pte/api-client";
import { useRubricTaskTypes, useRubricVersions } from "@/features/scoringrubric/api";
import { useSimulateScore } from "../api";
import { SIMULATOR_CONFIG, SIMULATOR_STATUS_LABELS, SIMULATOR_TASK_LABELS, SIMULATOR_TEXT } from "../constants";
import { initialSimulatorState, scoreGuideExample, simulationReady, simulationRequest } from "../simulatorState";
import { SimulationInputs } from "./_SimulationInputs";
import { SimulationTrace } from "./_SimulationTrace";

interface SimulatorFormProps { rubric: TaskTypeRubricResponse }
const SimulatorForm = ({ rubric }: SimulatorFormProps): ReactElement => {
  const { locale } = useLocale();
  const T = SIMULATOR_TEXT[locale === "vi" ? "vi" : "en"];
  const [state, setState] = useState(() => initialSimulatorState(rubric));
  const { mutate, data, variables, isPending, isError, reset } = useSimulateScore();
  const request = useMemo(() => simulationRequest(rubric, state), [rubric, state]);
  const ready = simulationReady(rubric, state);
  useEffect(() => {
    reset();
    if (!ready) return;
    const timer = setTimeout(() => mutate(request), SIMULATOR_CONFIG.debounceMs);
    return () => clearTimeout(timer);
  }, [ready, request, mutate, reset]);
  // During debounce, a response to the previous input must never look like the current result.
  const matchesInput = JSON.stringify(variables) === JSON.stringify(request);
  const result = ready && matchesInput && !isPending ? data : undefined;
  return <div className="grid items-start gap-6 lg:grid-cols-2">
    <DashboardCard>
      <CollapsibleSection title={T.inputs} subtitle={T.intro} collapsible={false}
        actions={<Button variant="secondary" size="sm" onClick={() => setState(scoreGuideExample(rubric))}>{T.example}</Button>}>
        <div className="space-y-5">
          <p className="text-xs text-[var(--ink-muted)]">{T.sampleHint}</p>
          <SimulationInputs rubric={rubric} state={state} onChange={setState} text={T} />
        </div>
      </CollapsibleSection>
    </DashboardCard>
    <aside className="min-w-0 lg:sticky lg:top-6">
      {result ? <SimulationTrace result={result} rubric={rubric} text={T} /> : <DashboardCard>
        <CollapsibleSection title={T.result} collapsible={false}>
          {ready && matchesInput && isError ? <ErrorState title={T.error} />
            : <p role="status" className="py-6 text-sm text-[var(--ink-secondary)]">{ready ? T.pending : T.empty}</p>}
        </CollapsibleSection>
      </DashboardCard>}
    </aside>
  </div>;
};

export const ScoringSimulatorView = (): ReactElement => {
  const { locale } = useLocale();
  const language = locale === "vi" ? "vi" : "en";
  const T = SIMULATOR_TEXT[language];
  const [version, setVersion] = useState("");
  const [task, setTask] = useState("");
  const versions = useRubricVersions();
  const tasks = useRubricTaskTypes(version || null);
  const available = (tasks.data ?? []).filter((entry) => entry.traits.length > 0);
  const rubric = available.find((entry) => entry.taskType === task) ?? available[0];
  return <div className="space-y-6"><PageHeader title={T.title} />
    <DashboardCard className="grid gap-4 md:grid-cols-2">
      <Select label={T.task} value={rubric?.taskType ?? ""} options={available.map((entry) => ({ value: entry.taskType,
        label: SIMULATOR_TASK_LABELS[entry.taskType]?.[language] ?? entry.taskType }))}
        onChange={(event) => setTask(event.target.value)} />
      <Select label={T.version} value={version} options={[{ value: "", label: T.active },
        ...(versions.data ?? []).map((entry) => ({ value: entry.publicId,
          label: `${T.versionNo} ${entry.versionNo} · ${SIMULATOR_STATUS_LABELS[entry.status]?.[language] ?? entry.status}` }))]}
        onChange={(event) => setVersion(event.target.value)} />
    </DashboardCard>
    {tasks.isLoading && <LoadingState rows={5} />}{(tasks.isError || versions.isError) && <ErrorState title={T.error} />}
    {rubric && <SimulatorForm key={`${rubric.versionPublicId}:${rubric.taskType}`} rubric={rubric} />}
  </div>;
};
