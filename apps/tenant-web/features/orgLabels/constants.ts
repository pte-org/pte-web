/**
 * `Tenant.organizationType` is free text with 4 values today (`SCHOOL`,
 * `UNIVERSITY`, `TRAINING_CENTER`, `CORPORATE` — see vendor-web's
 * `ORGANIZATION_TYPE_OPTIONS`), but the label spec only defines a binary
 * split. Bucket mapping confirmed with the user: SCHOOL/UNIVERSITY ->
 * SCHOOL_FAMILY, TRAINING_CENTER/CORPORATE -> CENTER_FAMILY, with
 * CENTER_FAMILY as the default bucket for `null`/any unmapped value.
 */
export type OrgTypeFamily = "SCHOOL_FAMILY" | "CENTER_FAMILY";

export const ORG_TYPE_FAMILY_MAP: Record<string, OrgTypeFamily> = {
  SCHOOL: "SCHOOL_FAMILY",
  UNIVERSITY: "SCHOOL_FAMILY",
  TRAINING_CENTER: "CENTER_FAMILY",
  CORPORATE: "CENTER_FAMILY",
};

export const DEFAULT_ORG_TYPE_FAMILY: OrgTypeFamily = "CENTER_FAMILY";

export interface OrgLabelSet {
  program: string;
  class: string;
}

export const ORG_LABEL_DICTIONARY: Record<OrgTypeFamily, OrgLabelSet> = {
  SCHOOL_FAMILY: { program: "Program", class: "Class" },
  CENTER_FAMILY: { program: "Program", class: "Class" },
};

/**
 * English-only pluralisation for a tenant label, so `"Class"` renders `Classes`
 * rather than the naive `Class` + `s` -> `Classs`. The label dictionary is
 * English by contract (per-tenant wording only changes the noun, not the
 * language), so a small suffix rule is enough and no i18n library is warranted.
 */
export function pluralize(label: string, count?: number): string {
  const word = count === 1 ? label : pluralizeWord(label);
  return count === undefined ? word : `${count} ${word}`;
}

function pluralizeWord(word: string): string {
  if (/(?:s|x|z|ch|sh)$/i.test(word)) return `${word}es`;
  if (/[^aeiou]y$/i.test(word)) return `${word.slice(0, -1)}ies`;
  return `${word}s`;
}

export interface OrgLabels extends OrgLabelSet {
  isLoading: boolean;
}
