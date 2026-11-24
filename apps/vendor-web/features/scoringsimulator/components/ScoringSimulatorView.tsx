"use client";

import { useEffect, useMemo, useState, type ReactElement, type ReactNode } from "react";
import { Button, ErrorState, LoadingState, Select, useLocale, type SelectOption } from "@pte/ui";
import type { TaskTypeRubricResponse } from "@pte/api-client";
import { useRubricTaskTypes, useRubricVersions } from "@/features/scoringrubric/api";
import { useScoringRubricText } from "@/features/scoringrubric/hooks/useScoringRubricText";
import { useQuestionTypes } from "@/features/questiontemplate/api";
import { useSimulateScore } from "../api";
import { SIMULATOR_CONFIG, SIMULATOR_STATUS_LABELS, SIMULATOR_TEXT } from "../constants";
import {
  gatedZeroExample,
  initialSimulatorState,
  maxScoreExample,
  scoreGuideExample,
  simulationReady,
  simulationRequest,
} from "../simulatorState";
import { SimulationInputs } from "./_SimulationInputs";
import { SimulationTrace } from "./_SimulationTrace";
import { SimulatorFrame } from "./_SimulatorFrame";

const taskTypeLabel = (code: string): string =>
  (code ?? "")
    .split("_")
    .map((word) => {
      const upper = word.toUpperCase();
      if (upper === "MC" || upper === "AI" || upper === "PTE" || upper === "FIB") return upper;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");

interface SimulatorFormProps {
  rubric: TaskTypeRubricResponse;
  controls: (action: ReactNode) => ReactNode;
}

const SimulatorForm = ({ rubric, controls }: SimulatorFormProps): ReactElement => {
  const { locale } = useLocale();
  const T = SIMULATOR_TEXT[locale === "vi" ? "vi" : "en"];
  const [state, setState] = useState(() => scoreGuideExample(rubric));
  const { mutate, data, variables, isPending, isError, reset } = useSimulateScore();
  const request = useMemo(() => simulationRequest(rubric, state), [rubric, state]);
  const ready = simulationReady(rubric, state);

  useEffect(() => {
    reset();
    if (!ready) return;
    const timer = setTimeout(() => mutate(request), SIMULATOR_CONFIG.debounceMs);
    return () => clearTimeout(timer);
  }, [ready, request, mutate, reset]);

  const matchesInput = JSON.stringify(variables) === JSON.stringify(request);
  const result = ready && matchesInput && !isPending ? data : undefined;

  const resultPanel = (
    <div className="rounded-xl border border-[var(--shell-border)] bg-[var(--surface-subtle)] p-5 shadow-2xs">
      <h3 className="mb-4 text-base font-semibold text-[var(--ink-primary)]">{T.result}</h3>
      {result ? (
        <SimulationTrace result={result} rubric={rubric} text={T} />
      ) : (
        <div>
          {ready && matchesInput && isError ? (
            <ErrorState title={T.error} />
          ) : (
            <p role="status" className="py-2 text-sm text-[var(--ink-secondary)]">
              {ready ? T.pending : T.empty}
            </p>
          )}
        </div>
      )}
    </div>
  );

  const hasGate = Boolean(rubric.gates && rubric.gates.some((g) => g.enabled));

  const actions = (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={() => setState(scoreGuideExample(rubric))}
        title={T.example}
      >
        {T.example}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={() => setState(maxScoreExample(rubric))}
        title={T.maxScore}
      >
        {T.maxScore}
      </Button>
      {hasGate && (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => setState(gatedZeroExample(rubric))}
          title={T.gatedZero}
        >
          {T.gatedZero}
        </Button>
      )}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => setState(initialSimulatorState(rubric))}
        title={T.reset}
      >
        {T.reset}
      </Button>
    </div>
  );

  return (
    <SimulatorFrame controls={controls(actions)} result={resultPanel}>
      <div className="rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] p-5 shadow-2xs">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-[var(--ink-primary)]">{T.inputs}</h2>
          <p className="mt-0.5 text-xs text-[var(--ink-secondary)]">{T.intro}</p>
        </div>
        <SimulationInputs rubric={rubric} state={state} onChange={setState} text={T} />
      </div>
    </SimulatorFrame>
  );
};

export const ScoringSimulatorView = (): ReactElement => {
  const { locale } = useLocale();
  const language = locale === "vi" ? "vi" : "en";
  const T = SIMULATOR_TEXT[language];
  const { codeLabel } = useScoringRubricText();
  const [version, setVersion] = useState("");
  const [task, setTask] = useState("");
  const versions = useRubricVersions();
  const tasks = useRubricTaskTypes(version || null);
  const { data: dbQuestionTypes = [] } = useQuestionTypes(false);

  const taskTypeMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of dbQuestionTypes) {
      if (item.code && item.displayName) {
        map.set(item.code.toUpperCase(), item.displayName);
      }
    }
    return map;
  }, [dbQuestionTypes]);

  const getTaskTypeLabel = (code: string): string =>
    taskTypeMap.get(code.toUpperCase()) ?? taskTypeLabel(code);

  const scorable = (tasks.data ?? []).filter((entry) => entry.traits.length > 0);
  const rubric = scorable.find((entry) => entry.taskType === task) ?? scorable[0];

  const taskOptions = useMemo(() => {
    const options: SelectOption[] = [];
    const skills = ["SPEAKING", "WRITING", "READING", "LISTENING"] as const;
    for (const skill of skills) {
      const match = scorable.filter((entry) => (entry.skills as readonly string[]).includes(skill));
      if (match.length === 0) continue;
      options.push({
        label: `── ${codeLabel("skill", skill)} ──`,
        value: `header-${skill}`,
        disabled: true,
      });
      for (const item of match) {
        if (!options.some((opt) => opt.value === item.taskType)) {
          options.push({
            label: getTaskTypeLabel(item.taskType),
            value: item.taskType,
          });
        }
      }
    }
    return options;
  }, [scorable, codeLabel, taskTypeMap]);

  const versionOptions: SelectOption[] = [
    { value: "", label: locale === "vi" ? "Phiên bản 1 (Đang hiệu lực)" : T.active },
    ...(versions.data ?? []).map((entry) => ({
      value: entry.publicId,
      label: `${T.versionNo} ${entry.versionNo} · ${SIMULATOR_STATUS_LABELS[entry.status]?.[language] ?? entry.status}`,
    })),
  ];

  const controls = (action: ReactNode): ReactNode => (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <Select
          size="sm"
          className="w-64"
          label={T.task}
          value={rubric?.taskType ?? ""}
          options={taskOptions}
          onChange={(event) => setTask(event.target.value)}
        />
        <Select
          size="sm"
          className="w-64"
          label={T.version}
          value={version}
          options={versionOptions}
          onChange={(event) => setVersion(event.target.value)}
        />
      </div>
      {action}
    </div>
  );

  return (
    <div className="space-y-4">
      {tasks.isLoading && <LoadingState rows={5} />}
      {(tasks.isError || versions.isError) && <ErrorState title={T.error} />}
      {!tasks.isLoading &&
        (rubric ? (
          <SimulatorForm key={`${rubric.versionPublicId}:${rubric.taskType}`} rubric={rubric} controls={controls} />
        ) : (
          <SimulatorFrame controls={controls(null)} result={null}>
            <p className="text-sm text-[var(--ink-secondary)]">{T.empty}</p>
          </SimulatorFrame>
        ))}
    </div>
  );
};
