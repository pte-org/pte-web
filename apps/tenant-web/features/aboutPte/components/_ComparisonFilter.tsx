"use client";

import type { ReactElement } from "react";
import { Tabs } from "@pte/ui";
import type { CompareView } from "../constants/compareViews";
import { useAboutPteExtras } from "../hooks/useAboutPteCopy";

interface ComparisonFilterProps {
  value: CompareView;
  onChange: (view: CompareView) => void;
}

/** Narrows the matrix to PTE against one other test: fewer columns, which also fits a phone screen. */
export const ComparisonFilter = ({ value, onChange }: ComparisonFilterProps): ReactElement => {
  const { compareFilter } = useAboutPteExtras();
  return (
    <div className="mb-4 flex justify-center">
      <Tabs
        variant="segmented"
        ariaLabel={compareFilter.label}
        value={value}
        onChange={(next) => onChange(next as CompareView)}
        items={[
          { id: "all", label: compareFilter.all },
          { id: "ielts", label: compareFilter.ielts },
          { id: "toefl", label: compareFilter.toefl },
          { id: "core", label: compareFilter.core },
        ]}
      />
    </div>
  );
};
