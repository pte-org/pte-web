import type { CefrTarget } from "@pte/api-client";

/** The levels a mix can use, easiest first. */
export const CEFR_MIX_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export type CefrMixLevel = (typeof CEFR_MIX_LEVELS)[number];

/** What the form holds: the percent of each level as typed. */
export type CefrMixDraft = Record<CefrMixLevel, string>;

export const MIX_TOTAL_PERCENT = 100;
/** The standard exam draws from B1 to C2, so the default mix splits evenly over these four. */
const STANDARD_LEVELS: readonly CefrMixLevel[] = ["B1", "B2", "C1", "C2"];
const STANDARD_SHARE = 25;

const emptyDraft = (): CefrMixDraft => ({ A1: "", A2: "", B1: "", B2: "", C1: "", C2: "" });

/** The form's starting values: the template's mix, or the even B1 to C2 split when it has none. */
export const mixToDraft = (targets: readonly CefrTarget[] | null | undefined): CefrMixDraft => {
  const draft = emptyDraft();
  if (!targets || targets.length === 0) {
    STANDARD_LEVELS.forEach((level) => {
      draft[level] = String(STANDARD_SHARE);
    });
    return draft;
  }
  targets.forEach((target) => {
    if ((CEFR_MIX_LEVELS as readonly string[]).includes(target.level)) {
      draft[target.level as CefrMixLevel] = String(target.percent);
    }
  });
  return draft;
};

const percentOf = (value: string): number => (value.trim() === "" ? 0 : Number(value));

export const mixTotal = (draft: CefrMixDraft): number =>
  CEFR_MIX_LEVELS.reduce((sum, level) => sum + percentOf(draft[level]), 0);

/** True when every typed value is a whole number from 0 to 100 and the total is exactly 100. */
export const isValidMix = (draft: CefrMixDraft): boolean =>
  CEFR_MIX_LEVELS.every((level) => {
    const value = percentOf(draft[level]);
    return Number.isInteger(value) && value >= 0 && value <= MIX_TOTAL_PERCENT;
  }) && mixTotal(draft) === MIX_TOTAL_PERCENT;

/** The payload for a valid draft: levels left at 0 are left out. */
export const draftToTargets = (draft: CefrMixDraft): CefrTarget[] =>
  CEFR_MIX_LEVELS.filter((level) => percentOf(draft[level]) > 0).map((level) => ({
    level,
    percent: percentOf(draft[level]),
  }));
