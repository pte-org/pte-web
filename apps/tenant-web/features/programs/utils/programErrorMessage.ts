import { ApiError, getUserFacingApiErrorMessage } from "@pte/api-client";
import { UserFacingError } from "@/features/examoperations/errorMessage";

export interface ProgramErrorMessages {
  nameAlreadyUsed: string;
  programNotFound: string;
  organizationNotFound: string;
  network: string;
  generic: string;
  nameRequired: string;
  endDateBeforeStartDate: string;
}

const VALIDATION_MATCHERS: ReadonlyArray<readonly [RegExp, keyof Pick<ProgramErrorMessages, "nameRequired" | "endDateBeforeStartDate">]> = [
  [/name is required/i, "nameRequired"],
  [/end date must be/i, "endDateBeforeStartDate"],
];

export function programErrorMessage(
  error: unknown,
  locale: string,
  messages: ProgramErrorMessages,
): string | undefined {
  if (!error) return undefined;
  if (error instanceof UserFacingError) return error.userMessage;
  if (locale !== "vi") {
    return getUserFacingApiErrorMessage(error, messages.generic);
  }
  if (error instanceof ApiError) {
    if (error.code === "PROGRAM_NAME_ALREADY_USED") return messages.nameAlreadyUsed;
    if (error.code === "PROGRAM_NOT_FOUND") return messages.programNotFound;
    if (error.code === "ORGANIZATION_NOT_FOUND") return messages.organizationNotFound;
    if (error.kind === "network" || error.status === 0) return messages.network;
    if (error.kind === "validation") {
      const match = VALIDATION_MATCHERS.find(([pattern]) => pattern.test(error.message));
      if (match) return messages[match[1]];
    }
  }
  return messages.generic;
}
