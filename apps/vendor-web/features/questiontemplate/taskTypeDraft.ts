import type {
  CreateTaskTypeRequest,
  QuestionTypeResponse,
  QuestionTypeSection,
  UpdateTaskTypeRequest,
} from "@pte/api-client";
import { QUESTION_TYPE_SECTIONS } from "./constants";

export interface QuestionTypeFormDraft {
  taskTypeKey: string;
  section: QuestionTypeSection;
  displayName: string;
  shortName: string;
  screenKey: string;
  contractVersion: number;
  displayOrder: number;
  active: boolean;
  instruction: string;
}

const toSection = (section: string): QuestionTypeSection =>
  QUESTION_TYPE_SECTIONS.includes(section as QuestionTypeSection)
    ? (section as QuestionTypeSection)
    : "SPEAKING";

export const toDraft = (type: QuestionTypeResponse): QuestionTypeFormDraft => ({
  taskTypeKey: type.taskTypeKey ?? type.code,
  section: toSection(type.section),
  displayName: type.displayName,
  shortName: type.shortName,
  screenKey: type.screenKey ?? type.runtime?.screenKey ?? "",
  contractVersion: type.contractVersion ?? type.runtime?.contractVersion ?? 0,
  displayOrder: type.displayOrder,
  active: type.active,
  instruction: type.instruction ?? "",
});

export const newDraft = (displayOrder: number): QuestionTypeFormDraft => ({
  taskTypeKey: "",
  section: "SPEAKING",
  displayName: "",
  shortName: "",
  screenKey: "",
  contractVersion: 0,
  displayOrder,
  active: true,
  instruction: "",
});

/** Every field the API requires on both create and update, independent of availability checks. */
export const hasRequiredDraftFields = (draft: QuestionTypeFormDraft): boolean =>
  Boolean(
    draft.displayName.trim() &&
    draft.shortName.trim() &&
    draft.section &&
    draft.screenKey &&
    draft.contractVersion > 0 &&
    draft.instruction.trim(),
  );

export const toCreatePayload = (draft: QuestionTypeFormDraft): CreateTaskTypeRequest => ({
  taskTypeKey: draft.taskTypeKey,
  displayName: draft.displayName.trim(),
  shortName: draft.shortName.trim(),
  section: draft.section,
  screenKey: draft.screenKey,
  contractVersion: draft.contractVersion,
  displayOrder: draft.displayOrder,
  active: draft.active,
  instruction: draft.instruction.trim(),
});

/** Instruction is display metadata, so it is sent even when the runtime binding is locked. */
export const toUpdatePayload = (
  draft: QuestionTypeFormDraft,
  runtimeLocked: boolean,
): UpdateTaskTypeRequest => ({
  displayName: draft.displayName.trim(),
  shortName: draft.shortName.trim(),
  displayOrder: draft.displayOrder,
  active: draft.active,
  instruction: draft.instruction.trim(),
  ...(runtimeLocked
    ? {}
    : {
        screenKey: draft.screenKey,
        contractVersion: draft.contractVersion,
        section: draft.section,
      }),
});
