import type { AiScoreDetailResponse } from "@pte/api-client";

export interface AiTraitRationale {
  reason: string;
  evidence: string;
}

const RATIONALES_FIELD = "traitRationales";

const text = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

/** The scorer's per-trait reason and quoted evidence; older or non-LLM results have none. */
export function readAiRationales(ai: AiScoreDetailResponse | null | undefined): Record<string, AiTraitRationale> {
  const raw = ai?.detail?.[RATIONALES_FIELD];
  if (typeof raw !== "object" || raw === null) return {};
  const rationales: Record<string, AiTraitRationale> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value !== "object" || value === null) continue;
    const entry = { reason: text(Reflect.get(value, "reason")), evidence: text(Reflect.get(value, "evidence")) };
    if (entry.reason || entry.evidence) rationales[key] = entry;
  }
  return rationales;
}
