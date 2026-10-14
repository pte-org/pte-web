"use client";

import { useEffect, useState } from "react";

/** Shared 300ms controlled-search convention for tenant server lists. */
export function useDebouncedSearch(value: string, delay = 300): string {
  const [debouncedValue, setDebouncedValue] = useState(value.trim());

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value.trim()), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, value]);

  return debouncedValue;
}
