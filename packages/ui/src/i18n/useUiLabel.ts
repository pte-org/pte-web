"use client";

import { useOptionalLocale } from "./LocaleProvider";

/** A label lookup for shared components: the dictionary entry when there is a LocaleProvider, else the given fallback. */
export const useUiLabel = (): ((key: string, fallback: string) => string) => {
  const locale = useOptionalLocale();
  return (key, fallback) => (locale ? locale.t(key, fallback) : fallback);
};
