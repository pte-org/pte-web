"use client";

import { useState } from "react";
import type { ClassResponse } from "@pte/api-client";

export interface AssignStudentsDeeplinkState {
  /** True when the page was entered via deeplink (`?organizationPublicId=...`). */
  wasPrefilledByDeeplink: boolean;
  /** True when the user cancelled the deeplink-triggered modal. */
  classFilterLocked: boolean;
  /** Display name of the prefilled class (or null until `classes` resolves). */
  prefilledClassName: string | null;
  /** Non-null when the prefilled class is INACTIVE/SUSPENDED. */
  classBlockedReason: string | null;
  /** True when the deeplink requests an auto-open of the Add Individually modal. */
  shouldAutoOpenModal: boolean;
  /** True after the auto-open has fired (idempotency guard). */
  autoOpenFired: boolean;
  setClassFilterLocked: (next: boolean) => void;
  setAutoOpenFired: (next: boolean) => void;
  setPersistedClassName: (next: string | null) => void;
  setPersistedBlockedReason: (next: string | null) => void;
  setWasPrefilledByDeeplink: (next: boolean) => void;
}

/**
 * Encapsulates the deeplink prefill state for the Assign Students flow.
 * Reads `useSearchParams` + `useClasses` results outside the hook to keep
 * the data-fetching concerns in the parent. Computes derived values
 * (matched class, auto-modal trigger, blocked reason) in render and
 * persists them across re-renders so the breadcrumb and banner stay
 * stable after the user navigates or clears the filter.
 */
export function useAssignStudentsDeeplink(
  paramOrg: string,
  paramProgram: string,
  paramClass: string,
  paramModal: string,
  classes: ClassResponse[] | undefined,
): AssignStudentsDeeplinkState {
  const hasPrefillParams = Boolean(paramOrg && paramProgram && paramClass);

  const [wasPrefilledByDeeplink, setWasPrefilledByDeeplink] = useState(false);
  const [classFilterLocked, setClassFilterLocked] = useState(false);
  const [autoOpenFired, setAutoOpenFired] = useState(false);
  const [persistedClassName, setPersistedClassName] = useState<string | null>(null);
  const [persistedBlockedReason, setPersistedBlockedReason] = useState<string | null>(null);

  if (!wasPrefilledByDeeplink && hasPrefillParams) {
    setWasPrefilledByDeeplink(true);
    if (!paramProgram) {
      console.warn("programPublicId missing from deeplink URL — class prefill skipped");
    }
  }

  const matchedClass =
    hasPrefillParams && paramClass
      ? (classes ?? []).find((c: ClassResponse) => c.publicId === paramClass)
      : undefined;
  const prefilledClassName = matchedClass?.name ?? null;
  const classBlockedReason =
    matchedClass && matchedClass.status !== "ACTIVE" ? matchedClass.status : null;
  const shouldAutoOpenModal =
    hasPrefillParams && paramModal === "add" && matchedClass?.status === "ACTIVE";

  if (prefilledClassName && persistedClassName !== prefilledClassName) {
    setPersistedClassName(prefilledClassName);
  }
  if (classBlockedReason !== persistedBlockedReason) {
    setPersistedBlockedReason(classBlockedReason);
  }

  return {
    wasPrefilledByDeeplink,
    classFilterLocked,
    prefilledClassName: persistedClassName,
    classBlockedReason: persistedBlockedReason,
    shouldAutoOpenModal,
    autoOpenFired,
    setClassFilterLocked,
    setAutoOpenFired,
    setPersistedClassName,
    setPersistedBlockedReason,
    setWasPrefilledByDeeplink,
  };
}
