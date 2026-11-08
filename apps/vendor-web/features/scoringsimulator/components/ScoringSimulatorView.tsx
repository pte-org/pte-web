"use client";

import { useEffect, useMemo, useState, type ReactElement, type ReactNode } from "react";
import { Button, CollapsibleSection, ErrorState, LoadingState, Select, useLocale, type TabItem } from "@pte/ui";
import type { TaskTypeRubricResponse } from "@pte/api-client";
import { useRubricTaskTypes, useRubricVersions } from "@/features/scoringrubric/api";
import { RUBRIC_SKILLS, RUBRIC_SKILL_FILTER_ALL } from "@/features/scoringrubric/constants";
import { useScoringRubricText } from "@/features/scoringrubric/hooks/useScoringRubricText";
import { useSimulateScore } from "../api";
import { SIMULATOR_CONFIG, SIMULATOR_STATUS_LABELS, SIMULATOR_TEXT } from "../constants";
import { initialSimulatorState, scoreGuideExample, simulationReady, simulationRequest } from "../simulatorState";
import { SimulationInputs } from "./_SimulationInputs";
import { SimulationTrace } from "./_SimulationTrace";
import { SimulatorFrame } from "./_SimulatorFrame";

interface SimulatorFrameProps {
  tabs: readonly TabItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  /** The task type and version pickers, above the inputs. */
  controls: (action: ReactNode) => ReactNode;
}

interface SimulatorFormProps extends SimulatorFrameProps { rubric: TaskTypeRubricResponse }
const SimulatorForm = ({ rubric, tabs, activeTab, onTabChange, controls }: SimulatorFormProps): ReactElement => {
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
  const resultPanel = <div className="rounded-lg border border-[var(--shell-border)] p-4">{result ? <SimulationTrace result={result} rubric={rubric} text={T} /> : <CollapsibleSection title={T.result} collapsible={false}>
    {ready && matchesInput && isError ? <ErrorState title={T.error} />
      : <p role="status" className="py-2 text-sm text-[var(--ink-secondary)]">{ready ? T.pending : T.empty}</p>}
  </CollapsibleSection>}</div>;
  return <SimulatorFrame tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} result={resultPanel}>
    <div className="space-y-6 rounded-lg border border-[var(--shell-border)] p-4">
      {controls(<Button size="sm" onClick={() => setState(scoreGuideExample(rubric))}>{T.example}</Button>)}
      <CollapsibleSection title={T.inputs} subtitle={T.intro} collapsible={false}>
        <div className="space-y-5">
          <p className="text-xs text-[var(--ink-muted)]">{T.sampleHint}</p>
          <SimulationInputs rubric={rubric} state={state} onChange={setState} text={T} />
        </div>
      </CollapsibleSection>
    </div>
  </SimulatorFrame>;
};

export const ScoringSimulatorView = (): ReactElement => {
  const { locale } = useLocale();
  const language = locale === "vi" ? "vi" : "en";
  const T = SIMULATOR_TEXT[language];
  const { codeLabel, messages: M } = useScoringRubricText();
  const [version, setVersion] = useState("");
  const [task, setTask] = useState("");
  const [skill, setSkill] = useState<string>(RUBRIC_SKILL_FILTER_ALL);
  const versions = useRubricVersions();
  const tasks = useRubricTaskTypes(version || null);
  const scorable = (tasks.data ?? []).filter((entry) => entry.traits.length > 0);
  const inSkill = (tab: string) => (entry: TaskTypeRubricResponse) =>
    tab === RUBRIC_SKILL_FILTER_ALL || (entry.skills as readonly string[]).includes(tab);
  const available = scorable.filter(inSkill(skill));
  const rubric = available.find((entry) => entry.taskType === task) ?? available[0];
  const tabs: TabItem[] = [
    { id: RUBRIC_SKILL_FILTER_ALL, label: M.skillAll, count: scorable.length },
    ...RUBRIC_SKILLS.map((entry) => ({ id: entry, label: codeLabel("skill", entry), count: scorable.filter(inSkill(entry)).length })),
  ];
  // Task types come from the API and are shown by their code, like the rubric list.
  const controls = (action: ReactNode): ReactNode => <div className="flex flex-wrap items-end gap-3">
    <Select size="sm" className="w-56" label={T.task} value={rubric?.taskType ?? ""} options={available.map((entry) => ({ value: entry.taskType, label: entry.taskType }))}
      onChange={(event) => setTask(event.target.value)} />
    <Select size="sm" className="w-56" label={T.version} value={version} options={[{ value: "", label: T.active },
      ...(versions.data ?? []).map((entry) => ({ value: entry.publicId,
        label: `${T.versionNo} ${entry.versionNo} · ${SIMULATOR_STATUS_LABELS[entry.status]?.[language] ?? entry.status}` }))]}
      onChange={(event) => setVersion(event.target.value)} />
    {action}
  </div>;
  const frame = { tabs, activeTab: skill, onTabChange: setSkill, controls };
  return <div className="space-y-6">
    {tasks.isLoading && <LoadingState rows={5} />}{(tasks.isError || versions.isError) && <ErrorState title={T.error} />}
    {!tasks.isLoading && (rubric
      ? <SimulatorForm key={`${rubric.versionPublicId}:${rubric.taskType}`} rubric={rubric} {...frame} />
      : <SimulatorFrame tabs={tabs} activeTab={skill} onTabChange={setSkill} result={null}>{controls(null)}</SimulatorFrame>)}
  </div>;
};
