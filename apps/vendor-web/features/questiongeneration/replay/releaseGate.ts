import type { Playhead } from "./frameTypes";
import type { ItemScript } from "./scriptTypes";

/**
 * What `released` becomes when the person presses Continue: the playhead may leave the step it is on. At the last step
 * the script has so far there is nothing to leave to, so nothing is released in advance for steps not yet written.
 */
export function nextReleased(playhead: Playhead, item: ItemScript): number {
  const hasNext = playhead.step + 1 < item.steps.length;
  return hasNext ? Math.max(playhead.released, playhead.step + 1) : playhead.released;
}
