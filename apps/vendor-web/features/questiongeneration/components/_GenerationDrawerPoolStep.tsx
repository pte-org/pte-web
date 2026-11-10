"use client";

import { FormField, RadioCard } from "@pte/ui";
import { generationMessages } from "../messages/en";
import type { GenerationFormState } from "../types";

interface PoolStepProps {
  value: GenerationFormState["pool"] | undefined;
  onChange: (pool: GenerationFormState["pool"]) => void;
  error?: string;
}

const POOLS = ["PRACTICE", "EXAM"] as const;

export const _GenerationDrawerPoolStep = ({
  value,
  onChange,
  error,
}: PoolStepProps) => {
  return (
    <FormField label={generationMessages.poolLabel} error={error}>
      <div className="grid grid-cols-2 gap-3">
        {POOLS.map((pool) => (
          <RadioCard
            key={pool}
            name="pool"
            label={
              pool === "PRACTICE"
                ? generationMessages.poolPractice
                : generationMessages.poolExam
            }
            checked={value === pool}
            onChange={() => onChange(pool)}
          />
        ))}
      </div>
    </FormField>
  );
};
