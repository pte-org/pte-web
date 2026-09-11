/**
 * `Tenant.organizationType` is free text with 4 values today (`SCHOOL`,
 * `UNIVERSITY`, `TRAINING_CENTER`, `CORPORATE` — see vendor-web's
 * `ORGANIZATION_TYPE_OPTIONS`), but the label spec only defines a binary
 * split. Bucket mapping confirmed with the user: SCHOOL/UNIVERSITY ->
 * SCHOOL_FAMILY (Khối), TRAINING_CENTER/CORPORATE -> CENTER_FAMILY (Khóa),
 * with CENTER_FAMILY as the default bucket for `null`/any unmapped value.
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
  SCHOOL_FAMILY: { program: "Khối", class: "Lớp" },
  CENTER_FAMILY: { program: "Khóa", class: "Lớp" },
};

export interface OrgLabels extends OrgLabelSet {
  isLoading: boolean;
}
