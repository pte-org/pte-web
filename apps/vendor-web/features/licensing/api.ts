"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { License, LicenseStats } from "./types";

const EMPTY_LICENSE_STATS: LicenseStats = {
  total: "0",
  active: "0",
  expiring: "0",
  expired: "0",
};

export function useLicenseStats(): UseQueryResult<LicenseStats> {
  return useQuery({
    queryKey: ["licenseStats"],
    queryFn: () => Promise.resolve(EMPTY_LICENSE_STATS),
  });
}

export function useLicenses(): UseQueryResult<License[]> {
  return useQuery({
    queryKey: ["licenses"],
    queryFn: () => Promise.resolve([]),
  });
}
