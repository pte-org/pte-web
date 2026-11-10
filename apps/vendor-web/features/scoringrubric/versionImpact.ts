import type { RubricDiffResponse, RubricSimulationRequest, TaskTypeRubricResponse } from "@pte/api-client";
import type { RubricEditText } from "./versionTypes";

/** A swing of this many points (out of 100) between the old and the new rubric needs the approver's own words. */
export const HIGH_IMPACT_POINTS = 10;
/** Sample scores are asked for at most this many changed task types, so one confirmation stays a handful of calls. */
export const MAX_IMPACT_TASK_TYPES = 4;
/** The passage length used for a trait that scores per word, the same as the simulator's starting point. */
const SAMPLE_PASSAGE_WORDS = 60;
const FORM_KEY = "FORM";

type Change = RubricDiffResponse["changes"][number];

export type ScenarioKind = "MAX" | "MID" | "CHANGED";

/** Input data for one sample answer; the server turns it into a score with the rubric's own scorer. */
export interface ImpactScenario {
  kind: ScenarioKind;
  taskType: string;
  request: Omit<RubricSimulationRequest, "rubricVersionPublicId">;
}

export interface DescribedChange {
  taskType: string | null;
  what: string;
  before: string;
  after: string;
}

const CHANGE_PATH = /^taskTypes\.([A-Z0-9_]+)\.(traitWeights|traitScales|gateEnabled)\.([A-Z0-9_]+)$/;
const FORM_BAND_PATH = /^taskTypes\.([A-Z0-9_]+)\.formBands\[(\d+)]\.(\w+)$/;
const TASK_TYPE_PATH = /^taskTypes\.([A-Z0-9_]+)\./;

/** The task types a diff touches, in order of first appearance. */
export function changedTaskTypes(changes: readonly Change[]): string[] {
  const seen = new Set<string>();
  for (const change of changes) {
    const match = TASK_TYPE_PATH.exec(change.path);
    if (match) seen.add(match[1]);
  }
  return [...seen];
}

/** The traits whose weight changed in one task type. */
function changedWeightTraits(changes: readonly Change[], taskType: string): string[] {
  return changes.flatMap((change) => {
    const match = CHANGE_PATH.exec(change.path);
    return match && match[1] === taskType && match[2] === "traitWeights" ? [match[3]] : [];
  });
}

const unquote = (value: string | null): string => (value === null ? "—" : value.replace(/^"|"$/g, ""));

/** A diff line in words: which task type, which trait, what kind of setting, and the two values. */
export function describeChange(
  change: Change,
  traitNames: ReadonlyMap<string, string>,
  text: RubricEditText,
): DescribedChange {
  const setting = CHANGE_PATH.exec(change.path);
  if (setting) {
    const [, taskType, kind, trait] = setting;
    const name = traitNames.get(`${taskType}.${trait}`) ?? trait;
    const label = kind === "traitWeights" ? text.changeWeight : kind === "traitScales" ? text.changeScale : text.changeGate;
    const show = (value: string | null): string =>
      kind === "gateEnabled" ? (value === "true" ? text.on : value === "false" ? text.off : "—") : unquote(value);
    return { taskType, what: `${name} · ${label}`, before: show(change.beforeValue), after: show(change.afterValue) };
  }
  const band = FORM_BAND_PATH.exec(change.path);
  if (band) {
    return {
      taskType: band[1],
      what: `${text.changeForm} #${Number(band[2]) + 1} · ${band[3]}`,
      before: unquote(change.beforeValue),
      after: unquote(change.afterValue),
    };
  }
  return {
    taskType: TASK_TYPE_PATH.exec(change.path)?.[1] ?? null,
    what: change.path,
    before: unquote(change.beforeValue),
    after: unquote(change.afterValue),
  };
}

const maximumOf = (trait: TaskTypeRubricResponse["traits"][number], passageWords: number): number =>
  trait.perWord ? passageWords : (trait.maxScore ?? 0);

/** The words of a Form-scored sample: the lowest length of the best band, with clean text. */
function formMetrics(rubric: TaskTypeRubricResponse): RubricSimulationRequest["textMetrics"] | undefined {
  const bands = rubric.formBands ?? [];
  if (bands.length === 0) return undefined;
  const best = bands.reduce((top, band) => (band.band > top.band ? band : top), bands[0]);
  return { wordCount: best.minWords, sentenceCount: 1, allCaps: false, punctuationPresent: true, bulletOnly: false };
}

function scenario(
  kind: ScenarioKind,
  rubric: TaskTypeRubricResponse,
  scoreOf: (key: string, maximum: number) => number,
): ImpactScenario {
  const traitScores = Object.fromEntries(
    rubric.traits
      .filter((trait) => trait.key !== FORM_KEY)
      .map((trait) => [trait.key, scoreOf(trait.key, maximumOf(trait, SAMPLE_PASSAGE_WORDS))]),
  );
  const metrics = formMetrics(rubric);
  return {
    kind,
    taskType: rubric.taskType,
    request: {
      taskType: rubric.taskType,
      traitScores,
      ...(metrics ? { textMetrics: metrics } : {}),
      ...(rubric.traits.some((trait) => trait.perWord) ? { wordCount: SAMPLE_PASSAGE_WORDS } : {}),
    },
  };
}

/**
 * Sample answers for one changed task type: everything at the top, everything in the middle and, when a weight
 * changed, strong in exactly those traits and weak in the rest. They are input data only; the scores come from the
 * server, once with the active rubric and once with the candidate.
 */
export function impactScenarios(rubric: TaskTypeRubricResponse, changes: readonly Change[]): ImpactScenario[] {
  if (rubric.traits.length === 0) return [];
  const scenarios = [
    scenario("MAX", rubric, (_key, maximum) => maximum),
    scenario("MID", rubric, (_key, maximum) => Math.max(1, Math.trunc(maximum / 2))),
  ];
  const strong = new Set(changedWeightTraits(changes, rubric.taskType));
  if (strong.size > 0) {
    scenarios.push(scenario("CHANGED", rubric, (key, maximum) => (strong.has(key) ? maximum : Math.min(1, maximum))));
  }
  return scenarios;
}

/** How far a sample moved: the new server score minus the old one. */
export const scoreShift = (before: number, after: number): number => after - before;

/** Whether any sample moved by at least {@link HIGH_IMPACT_POINTS}, either way. */
export function isHighImpact(shifts: readonly number[]): boolean {
  return shifts.some((shift) => Math.abs(shift) >= HIGH_IMPACT_POINTS);
}

export function scenarioLabel(kind: ScenarioKind, text: RubricEditText): string {
  return kind === "MAX" ? text.scenarioMax : kind === "MID" ? text.scenarioMid : text.scenarioChanged;
}
