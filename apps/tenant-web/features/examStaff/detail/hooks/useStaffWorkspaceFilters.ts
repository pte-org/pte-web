"use client";

import { useState } from "react";
import type { StaffWorkspaceQuery } from "@pte/api-client";
import type { StaffFilterDraft, StaffFilterState } from "../types";
import { staffFilterQuery } from "../utils";

const EMPTY_FILTER: StaffFilterDraft = {
  fromDate: "", toDate: "", sessionPublicId: "", sessionStatus: "ALL", publicationStatus: "ALL",
};

/** Mount this state beneath the selected publicId key to discard another target's filters. */
export const useStaffWorkspaceFilters = (): StaffFilterState => {
  const [draft, setDraft] = useState<StaffFilterDraft>(EMPTY_FILTER);
  const [applied, setApplied] = useState<StaffWorkspaceQuery>({});
  const [page, setPage] = useState(0);
  const [revision, setRevision] = useState(0);
  const [invalidDates, setInvalidDates] = useState(false);
  const apply = (): void => {
    try {
      setApplied(staffFilterQuery(draft));
      setInvalidDates(false);
      setPage(0);
      setRevision((value) => value + 1);
    } catch {
      setInvalidDates(true);
    }
  };
  const clear = (): void => {
    setDraft(EMPTY_FILTER);
    setApplied({});
    setInvalidDates(false);
    setPage(0);
    setRevision((value) => value + 1);
  };
  return {
    draft, applied, page, revision, invalidDates, apply, clear, setPage,
    change: (patch) => setDraft((current) => ({ ...current, ...patch })),
  };
};
