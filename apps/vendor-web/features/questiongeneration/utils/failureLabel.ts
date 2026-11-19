import { FAILURE_LABELS } from "../../aiadmin/constants";
import { getFailureReasonTranslation } from "./failureCodeTranslator";

/** A generation failure code as a reason the person can read, in the UI language; never the raw code. */
export function failureLabel(code: string, lang: "vi" | "en"): string {
  return FAILURE_LABELS[lang][code] ?? getFailureReasonTranslation(code);
}
