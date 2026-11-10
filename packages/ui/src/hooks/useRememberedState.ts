"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_PREFIX = "remembered:";

const storageKey = (name: string): string => `${STORAGE_PREFIX}${window.location.pathname}:${name}`;

function read(name: string): string | null {
  try {
    return window.sessionStorage.getItem(storageKey(name));
  } catch {
    // Storage can be blocked (private mode, policy); the screen then simply forgets, as it did before.
    return null;
  }
}

function write(name: string, value: string): void {
  try {
    window.sessionStorage.setItem(storageKey(name), value);
  } catch {
    // See `read`.
  }
}

/**
 * A choice on a screen (a tab, a section filter) that survives leaving the screen and coming back to it. It is kept
 * for this browser tab and for this page, so the same tab of another page, or of another record, is not touched.
 *
 * The first render always uses `initial`, so the page the server sent and the one the browser draws first are the
 * same; the remembered value is applied right after. `allowed`, when given, ignores a remembered value that is no
 * longer one of the choices.
 */
export function useRememberedState<T extends string>(
  name: string,
  initial: T,
  allowed?: readonly T[],
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    const saved = read(name);
    if (saved === null) return;
    if (allowed && !allowed.includes(saved as T)) return;
    // A stored value is a string the screen itself wrote; `allowed` guards the choices that can change over time.
    setValue(saved as T);
    // `allowed` is a constant list of choices; listing it would re-read the storage on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const remember = useCallback(
    (next: T): void => {
      setValue(next);
      write(name, next);
    },
    [name],
  );

  return [value, remember];
}
