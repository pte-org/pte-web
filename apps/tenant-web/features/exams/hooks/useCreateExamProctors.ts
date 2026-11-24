"use client";

import { useCallback, useMemo, useState } from "react";
import type { UserResponse } from "@pte/api-client";
import { useTenantProctors } from "../api";
import type { ProctorSelection } from "../types";
import { toggleProctor } from "../utils/proctorSelection";

export interface UseCreateExamProctorsOptions {
  proctors: readonly ProctorSelection[];
  onProctorsChange: (next: ProctorSelection[]) => void;
}

export interface UseCreateExamProctorsResult {
  search: string;
  /** Active proctor accounts matching the search. */
  candidates: UserResponse[];
  selection: readonly ProctorSelection[];
  loading: boolean;
  onSearchChange: (search: string) => void;
  toggleProctor: (proctorPublicId: string) => void;
  clearProctors: () => void;
}

/** Search and selection state of the proctor tab in the create-exam wizard. */
export function useCreateExamProctors({
  proctors,
  onProctorsChange,
}: UseCreateExamProctorsOptions): UseCreateExamProctorsResult {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useTenantProctors();

  const candidates = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data ?? []).filter(
      (user) =>
        user.status === "ACTIVE" &&
        !user.archived &&
        (term === "" ||
          [user.fullName, user.email, user.username].some((value) =>
            value?.toLowerCase().includes(term),
          )),
    );
  }, [data, search]);

  const toggle = useCallback(
    (proctorPublicId: string): void => onProctorsChange(toggleProctor(proctors, proctorPublicId)),
    [onProctorsChange, proctors],
  );
  const clearProctors = useCallback((): void => onProctorsChange([]), [onProctorsChange]);

  return {
    search,
    candidates,
    selection: proctors,
    loading: isLoading,
    onSearchChange: setSearch,
    toggleProctor: toggle,
    clearProctors,
  };
}
