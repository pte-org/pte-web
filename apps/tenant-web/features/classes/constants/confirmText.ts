/**
 * Copy for the destructive-action confirmation dialogs and the non-ACTIVE target guard.
 *
 * Split out of `constants/index.ts` because that file sits at the 300-line ceiling.
 */

/** One dialog per class lifecycle transition (activate / deactivate / suspend / archive). */
export const CLASS_STATUS_CONFIRM_TEXT = {
  cancel: "Cancel",
  confirmButton: "Confirm",
  activateTitle: (label: string) => `Activate ${label}?`,
  activateDescription: (label: string) =>
    `This ${label.toLowerCase()} will become available for new exam assignments.`,
  deactivateTitle: (label: string) => `Deactivate ${label}?`,
  deactivateDescription: (label: string) =>
    `No new students can be assigned to this ${label.toLowerCase()} while it is deactivated. Existing assignments are kept.`,
  suspendTitle: (label: string) => `Suspend ${label}?`,
  suspendDescription: (label: string) =>
    `All scheduled exams for this ${label.toLowerCase()} will be paused. Existing assignments are kept.`,
  archiveTitle: (label: string) => `Archive ${label}?`,
  archiveDescription: (name: string, count: number) =>
    `Archiving "${name}" will also unassign its ${count} ${count === 1 ? "student" : "students"}. This cannot be undone.`,
} as const;

/** Unassigning one student from a class roster (C19 / AC3). */
export const CLASS_ROSTER_UNASSIGN_CONFIRM_TEXT = {
  title: "Unassign student?",
  // Names both the student and the class: the Host may have several rosters
  // open, so "from this class" left the target of a destructive action implicit.
  description: (studentFullName: string, className: string) =>
    `Unassign ${studentFullName} from "${className}"? They will lose access to any future exams scheduled for this roster.`,
  confirmButton: "Unassign",
  cancel: "Cancel",
} as const;

/**
 * Copy for the inline typed-confirm that gates a transfer/merge into a non-ACTIVE target.
 * `TypedConfirmInput` arrives as a `packages/ui` primitive in Phase 2 — Phase 1 keeps a
 * local element with the same contract (exact, case-sensitive match) and migrates to the
 * shared primitive in a follow-up commit.
 */
export const NON_ACTIVE_TARGET_CONFIRM_TEXT = {
  warningChip: "Not active",
  warningBody: (name: string) =>
    `"${name}" is not active. New students cannot be assigned to it, and any exam scheduled for it may be paused.`,
  typeToConfirmLabel: (name: string) => `Type ${name} to confirm`,
  placeholder: (name: string) => name,
  mismatchHint: (name: string) => `The text must match "${name}" exactly.`,
} as const;
