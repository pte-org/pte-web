export const BLUEPRINTS_QUERY_KEY = ["examBlueprints"] as const;
export const BLUEPRINT_QUERY_KEY = ["examBlueprint"] as const;

export const SECTION_LABELS: Record<string, string> = {
  SPEAKING: "Speaking",
  WRITING: "Writing",
  READING: "Reading",
  LISTENING: "Listening",
};

export const BLUEPRINT_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PENDING_APPROVAL: "Pending approval",
  PUBLISHED: "Published",
};
