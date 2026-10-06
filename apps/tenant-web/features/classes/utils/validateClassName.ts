import { CREATE_CLASS_ERRORS } from "../constants";

/**
 * Shared name check for every Class create/edit/split surface.
 *
 * The three modals each had the same inline `!name.trim()` branch with slightly
 * different copy; this is the single owner so the message can't drift.
 */
export function validateClassName(name: string, classLabel: string): string | undefined {
  if (!name.trim()) {
    return CREATE_CLASS_ERRORS.nameRequired(classLabel);
  }
  return undefined;
}
