import { useState } from "react";

/**
 * True once what the form holds differs from what it held when it opened. The values are compared as one text
 * snapshot, so going back to the original values makes the form clean again.
 */
export function useFormDirty(snapshot: string): boolean {
  const [opened] = useState(snapshot);
  return snapshot !== opened;
}
