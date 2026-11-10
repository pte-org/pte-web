"use client";

import { useEffect, useState } from "react";
import { useSettled } from "./useSettled";
import { useStudioLocation } from "./useStudioLocation";

interface UrlSearch {
  /** What the box holds right now. */
  input: string;
  setInput: (value: string) => void;
  /** The text once typing has paused; this is what is asked of the server and kept in the address. */
  settled: string;
}

/**
 * A search box whose text survives leaving the screen: it starts from the address, and once typing has
 * paused it writes the text back. `alsoClear` names parameters that no longer hold for a new search,
 * such as the page.
 */
export function useUrlSearch(param: string, alsoClear: readonly string[] = []): UrlSearch {
  const { read, patch } = useStudioLocation();
  const [input, setInput] = useState(() => read(param) ?? "");
  const settled = useSettled(input.trim());

  useEffect(() => {
    if ((read(param) ?? "") === settled) return;
    patch({
      [param]: settled || null,
      ...Object.fromEntries(alsoClear.map((name) => [name, null])),
    });
    // Only a change of the settled text writes the address; the rest are read at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settled]);

  return { input, setInput, settled };
}
