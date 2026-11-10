"use client";

import { useEffect, useState } from "react";
import { STUDIO_SEARCH_DELAY_MS } from "../constants";

/** The value after it has stopped changing for a moment, so typing does not send a request per key. */
export function useSettled(value: string): string {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), STUDIO_SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [value]);
  return settled;
}
