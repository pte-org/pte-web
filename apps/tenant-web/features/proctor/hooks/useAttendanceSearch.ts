"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const SEARCH_DELAY_MS = 300;

interface AttendanceSearch {
  value: string;
  onChange: (value: string) => void;
}

/** Keep typing local; commit a paused search without adding browser-history entries. */
export const useAttendanceSearch = (initialValue: string): AttendanceSearch => {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const syncFromHistory = (): void => {
      if (timer.current) clearTimeout(timer.current);
      setValue(new URL(window.location.href).searchParams.get("search") ?? "");
    };
    window.addEventListener("popstate", syncFromHistory);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      window.removeEventListener("popstate", syncFromHistory);
    };
  }, []);

  const onChange = (next: string): void => {
    setValue(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      // Read the current URL so a status change during typing is preserved.
      const url = new URL(window.location.href);
      const search = next.trim();
      if (search) url.searchParams.set("search", search);
      else url.searchParams.delete("search");
      url.searchParams.delete("page");
      router.replace(`${url.pathname}${url.search}`, { scroll: false });
    }, SEARCH_DELAY_MS);
  };

  return { value, onChange };
};
