"use client";

import { useEffect, useMemo, useState, type ReactElement } from "react";
import { Button, ErrorState, LoadingState, PageHeader, Select, useLocale } from "@pte/ui";
import type { TaskTypeRubricResponse } from "@pte/api-client";
import { useRubricTaskTypes, useRubricVersions } from "@/features/scoringrubric/api";
import { useSimulateScore } from "../api";
import { SIMULATOR_CONFIG, SIMULATOR_TEXT } from "../constants";
import { initialSimulatorState, scoreGuideExample, simulationRequest } from "../simulatorState";
import { SimulationInputs } from "./_SimulationInputs";
import { SimulationTrace } from "./_SimulationTrace";

interface SimulatorFormProps { rubric: TaskTypeRubricResponse }
const SimulatorForm = ({ rubric }: SimulatorFormProps): ReactElement => {
  const { locale } = useLocale();
  const T = SIMULATOR_TEXT[locale === "vi" ? "vi" : "en"];
  const [state, setState] = useState(() => initialSimulatorState(rubric));
  const { mutate, data, isPending, isError, reset } = useSimulateScore();
  const request = useMemo(() => simulationRequest(rubric, state), [rubric, state]);
  useEffect(() => {
    reset();
    const timer = setTimeout(() => mutate(request), SIMULATOR_CONFIG.debounceMs);
    return () => clearTimeout(timer);
  }, [request, mutate, reset]);
  return <div className="grid gap-6 lg:grid-cols-2">
    <div className="space-y-4"><Button variant="secondary" onClick={() => setState(scoreGuideExample(rubric))}>{T.example}</Button>
      <SimulationInputs rubric={rubric} state={state} onChange={setState} text={T} /></div>
    <div>{isPending && <p>{T.pending}</p>}{isError && <ErrorState title={T.error} />}
      {data ? <SimulationTrace result={data} text={T} /> : <p>{T.empty}</p>}</div>
  </div>;
};

export const ScoringSimulatorView = (): ReactElement => {
  const { locale } = useLocale();
  const T = SIMULATOR_TEXT[locale === "vi" ? "vi" : "en"];
  const [version, setVersion] = useState("");
  const [task, setTask] = useState("");
  const versions = useRubricVersions();
  const tasks = useRubricTaskTypes(version || null);
  const available = (tasks.data ?? []).filter((entry) => entry.traits.length > 0);
  const rubric = available.find((entry) => entry.taskType === task) ?? available[0];
  return <div className="space-y-6"><PageHeader title={T.title} />
    <Select label={T.version} value={version} options={[{ value: "", label: T.active },
      ...(versions.data ?? []).map((entry) => ({ value: entry.publicId, label: `${entry.versionNo} · ${entry.status}` }))]}
      onChange={(event) => setVersion(event.target.value)} />
    <Select label={T.task} value={rubric?.taskType ?? ""} options={available.map((entry) => ({ value: entry.taskType, label: entry.taskType }))}
      onChange={(event) => setTask(event.target.value)} />
    {tasks.isLoading && <LoadingState rows={5} />}{tasks.isError && <ErrorState title={T.error} />}
    {rubric && <SimulatorForm key={`${rubric.versionPublicId}:${rubric.taskType}`} rubric={rubric} />}
  </div>;
};
