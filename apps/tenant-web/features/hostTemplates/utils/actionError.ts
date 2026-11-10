import { ApiError } from "@pte/api-client";
import { errorMessage } from "@/features/examoperations/errorMessage";

export interface TemplateActionErrorText {
  ACTION_FAILED: string;
  ACTIVATE_POOL_SHORT: string;
  ACTIVATE_WEIGHTS_INVALID: string;
}

const POOL_SHORT_PATTERN = /not enough approved questions/i;
const WEIGHTS_PATTERN = /must total exactly 100/i;

/**
 * The server explains an activation failure in one long English sentence that the shared formatter
 * drops, so recognise the two causes a host can act on and show them in the host's language.
 */
export function templateActionError(
  error: unknown,
  text: TemplateActionErrorText,
): string | undefined {
  if (!error) return undefined;
  if (error instanceof ApiError) {
    const detail = `${error.userMessage ?? ""} ${error.message}`;
    if (POOL_SHORT_PATTERN.test(detail)) return text.ACTIVATE_POOL_SHORT;
    if (WEIGHTS_PATTERN.test(detail)) return text.ACTIVATE_WEIGHTS_INVALID;
  }
  return errorMessage(error, text.ACTION_FAILED);
}
