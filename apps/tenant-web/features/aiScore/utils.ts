import { AI_GAP_ROW_CLASS, AI_MANUAL_GAP_THRESHOLD } from "./constants";

/** "ORAL_FLUENCY" → "Oral fluency". */
export function formatCriterion(name: string): string {
  const spaced = name.replaceAll("_", " ").toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** Whether a scoring method is one the AI scores (objective and unscored answers are not). */
export function isAiScoringMethod(method: string | null): boolean {
  return method === "AI_SPEECH" || method === "AI_TEXT";
}

/** Row highlight when the AI and a manual score are far apart; undefined while either is missing. */
export function aiGapRowClass(
  aiScore: number | null,
  manualScore: number | null,
): string | undefined {
  if (aiScore === null || manualScore === null) return undefined;
  return Math.abs(aiScore - manualScore) >= AI_MANUAL_GAP_THRESHOLD ? AI_GAP_ROW_CLASS : undefined;
}
