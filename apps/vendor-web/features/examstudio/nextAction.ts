/** The one thing the readiness card offers to do next, given where the template stands. */
export type StudioNextAction =
  "write-questions" | "activate" | "switch-to-draft" | "create-draft" | null;

interface NextActionInput {
  /** The shown template is a draft, so it can still change. */
  editable: boolean;
  isReady: boolean;
  missingQuestions: number;
  /** A draft exists besides the version being shown. */
  hasOtherDraft: boolean;
}

export function nextAction({
  editable,
  isReady,
  missingQuestions,
  hasOtherDraft,
}: NextActionInput): StudioNextAction {
  if (!editable) return hasOtherDraft ? "switch-to-draft" : "create-draft";
  if (isReady) return "activate";
  return missingQuestions > 0 ? "write-questions" : null;
}
