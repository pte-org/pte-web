import type { QuestionGenerationCefrMix } from "@pte/api-client";
import { GENERATION_CEFR_LEVELS, type GenerationCefrLevel } from "../dialogConstants";
import { rowTotal, type CefrLevelCounts } from "./generationCefr";
import type { SelectionRow } from "./generationSelection";

/** One level of the template's CEFR mix and its share in whole percent. */
export interface CefrShare {
  level: GenerationCefrLevel;
  percent: number;
}

const isGenerationLevel = (level: string): level is GenerationCefrLevel =>
  (GENERATION_CEFR_LEVELS as readonly string[]).includes(level);

/** The mix's levels the popup can generate, with a share above zero; empty when there is no mix. */
export function mixShares(mix: QuestionGenerationCefrMix | null | undefined): CefrShare[] {
  return (mix?.targets ?? [])
    .filter((target) => target.percent > 0)
    .flatMap((target) =>
      isGenerationLevel(target.level) ? [{ level: target.level, percent: target.percent }] : [],
    );
}

/**
 * The level of each of `total` questions, so that every prefix of the sequence is as close to the mix as whole
 * questions allow (smooth weighted round-robin). Handing the sequence out row by row keeps the whole exam on the mix
 * and gives a row of several questions several levels, where splitting each row on its own would put every small
 * row on the first level.
 */
export function levelSequence(shares: readonly CefrShare[], total: number): GenerationCefrLevel[] {
  const weight = shares.reduce((sum, share) => sum + share.percent, 0);
  if (weight === 0) return [];
  const credit = shares.map(() => 0);
  const sequence: GenerationCefrLevel[] = [];
  for (let step = 0; step < total; step += 1) {
    let best = 0;
    shares.forEach((share, index) => {
      credit[index] += share.percent;
      if (credit[index] > credit[best]) best = index;
    });
    credit[best] -= weight;
    sequence.push(shares[best].level);
  }
  return sequence;
}

function emptyLevels(): Record<GenerationCefrLevel, number> {
  return { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0 };
}

/** Spreads the rows' questions over the mix as one exam, in row order; without a mix the rows stay as they are. */
export function spreadRows(rows: readonly SelectionRow[], shares: readonly CefrShare[]): SelectionRow[] {
  const sequence = levelSequence(shares, rows.reduce((sum, row) => sum + rowTotal(row), 0));
  if (sequence.length === 0) return [...rows];
  let next = 0;
  return rows.map((row) => {
    const levels = emptyLevels();
    for (let index = 0; index < rowTotal(row); index += 1) levels[sequence[next++]] += 1;
    const counts: CefrLevelCounts = levels;
    return { ...row, levels: counts, count: rowTotal({ ...row, levels: counts }) };
  });
}

/** Puts every row back on one level (the popup's default), keeping its total. */
export function singleLevelRows(rows: readonly SelectionRow[], level: string): SelectionRow[] {
  return rows.map(({ levels: _levels, ...row }) => ({ ...row, count: rowTotal({ ...row, levels: _levels }), cefrLevel: level }));
}
