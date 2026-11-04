"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { STUDIO_TABS } from "../constants";
import type { StudioKind, StudioTab } from "../types";

const TAB_PARAM = "tab";
const TYPE_PARAM = "type";
const KIND_PARAM = "view";
const KINDS: readonly string[] = ["questions", "taskTypes", "templates"];
/** What belongs to one open drawer: its status tab, search and page. */
const DRAWER_PARAMS = ["qs", "qq", "qp"] as const;
const TABS: readonly string[] = Object.values(STUDIO_TABS);

interface StudioLocation {
  /** The kind of content the board shows. */
  kind: StudioKind;
  setKind: (kind: StudioKind) => void;
  tab: StudioTab;
  /** The task type whose drawer is open, if any. */
  selectedKey: string | null;
  setTab: (tab: StudioTab) => void;
  setSelectedKey: (key: string | null) => void;
  /** Any other parameter of the address, such as a filter. */
  read: (name: string) => string | null;
  /** Sets or, for `null`, removes parameters in one step. */
  patch: (changes: Record<string, string | null>) => void;
  /** This screen as it is now, tab and drawer included, for a page that links back to it. */
  here: string;
}

/**
 * Which tab is shown and which task type is open, kept in the address. A page opened from here can then
 * link back to the screen exactly as it was, and a reload or a shared link lands on the same view.
 */
export function useStudioLocation(): StudioLocation {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const tabParam = params.get(TAB_PARAM);
  const query = params.toString();

  const replaceWith = (change: (next: URLSearchParams) => void): void => {
    const next = new URLSearchParams(params.toString());
    change(next);
    const search = next.toString();
    router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
  };

  const kindParam = params.get(KIND_PARAM);

  return {
    kind: kindParam !== null && KINDS.includes(kindParam) ? (kindParam as StudioKind) : "questions",
    // The filters of the board that was left mean nothing on the next one.
    setKind: (kind) =>
      replaceWith((next) => {
        ["kt", "kq", "ks", "kc"].forEach((name) => next.delete(name));
        if (kind === "questions") next.delete(KIND_PARAM);
        else next.set(KIND_PARAM, kind);
      }),
    tab:
      tabParam !== null && TABS.includes(tabParam) ? (tabParam as StudioTab) : STUDIO_TABS.COVERAGE,
    selectedKey: params.get(TYPE_PARAM),
    setTab: (tab) =>
      replaceWith((next) => {
        next.set(TAB_PARAM, tab);
        next.delete(TYPE_PARAM);
        DRAWER_PARAMS.forEach((name) => next.delete(name));
      }),
    setSelectedKey: (key) =>
      replaceWith((next) => {
        if (key === null) next.delete(TYPE_PARAM);
        else next.set(TYPE_PARAM, key);
        DRAWER_PARAMS.forEach((name) => next.delete(name));
      }),
    read: (name) => params.get(name),
    patch: (changes) =>
      replaceWith((next) => {
        Object.entries(changes).forEach(([name, value]) => {
          if (value === null) next.delete(name);
          else next.set(name, value);
        });
      }),
    here: query ? `${pathname}?${query}` : pathname,
  };
}
