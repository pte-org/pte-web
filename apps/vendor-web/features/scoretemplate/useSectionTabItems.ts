"use client";

import type { TabItem } from "@pte/ui";
import { useAdminCopy } from "@/features/i18n/adminCopy";
import {
  EXAM_TEMPLATE_SECTIONS,
  SCORE_TEMPLATE_ALL_TAB,
  SCORE_TEMPLATE_SECTION_LABELS,
} from "./constants";

/** "All sections" plus one tab per exam section, each with its count; shared by every section rail. */
export const useSectionTabItems = (countOf: (section: string | null) => number): TabItem[] => {
  const sectionLabels = useAdminCopy(SCORE_TEMPLATE_SECTION_LABELS);
  const allSectionsLabel = useAdminCopy("All sections");
  return [
    { id: SCORE_TEMPLATE_ALL_TAB, label: allSectionsLabel, count: countOf(null) },
    ...EXAM_TEMPLATE_SECTIONS.map((section) => ({
      id: section,
      label: sectionLabels[section],
      count: countOf(section),
    })),
  ];
};
