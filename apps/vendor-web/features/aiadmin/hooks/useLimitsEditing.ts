"use client";

import { useState } from "react";
import type { AiStatusLimits } from "@pte/api-client";
import { GENERATION_LIMITS, type GenerationLimit } from "../constants";

type LimitField = GenerationLimit["field"];
type Drafts = Partial<Record<LimitField, string>>;

export interface LimitsEditing {
  editing: boolean;
  drafts: Drafts;
  /** The fields whose draft differs from the saved value, with the value to save. */
  changes: { limit: GenerationLimit; value: number }[];
  invalid: (limit: GenerationLimit) => boolean;
  anyInvalid: boolean;
  start: () => void;
  stop: () => void;
  setDraft: (field: LimitField, value: string) => void;
}

const isInvalid = (limit: GenerationLimit, raw: string): boolean => {
  const value = Number(raw);
  return raw.trim() === "" || !Number.isInteger(value) || value < limit.min || value > limit.max;
};

/** Edit state of the limits panel: one draft per limit, started from the saved values. */
export function useLimitsEditing(limits: AiStatusLimits): LimitsEditing {
  const [editing, setEditing] = useState(false);
  const [drafts, setDrafts] = useState<Drafts>({});
  const draftOf = (limit: GenerationLimit): string => drafts[limit.field] ?? String(limits[limit.field]);

  const changes = GENERATION_LIMITS
    .filter((limit) => !isInvalid(limit, draftOf(limit)) && Number(draftOf(limit)) !== limits[limit.field])
    .map((limit) => ({ limit, value: Number(draftOf(limit)) }));

  return {
    editing,
    drafts,
    changes,
    invalid: (limit) => isInvalid(limit, draftOf(limit)),
    anyInvalid: GENERATION_LIMITS.some((limit) => isInvalid(limit, draftOf(limit))),
    start: () => { setDrafts({}); setEditing(true); },
    stop: () => { setDrafts({}); setEditing(false); },
    setDraft: (field, value) => setDrafts((current) => ({ ...current, [field]: value })),
  };
}
