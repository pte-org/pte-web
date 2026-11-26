import { MS_PER_SECOND } from "../typingConstants";

/** How many characters of a text `length` long are written after `elapsedMs` at `charsPerSecond`. */
export const revealedChars = (elapsedMs: number, charsPerSecond: number, length: number): number =>
  Math.min(length, Math.max(0, Math.floor((elapsedMs * charsPerSecond) / MS_PER_SECOND)));
