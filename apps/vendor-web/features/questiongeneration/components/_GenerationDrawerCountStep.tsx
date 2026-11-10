"use client";

import { FormField, QuantityStepper } from "@pte/ui";
import { generationMessages } from "../messages/en";
import type { GenerationFormState } from "../types";

interface CountStepProps {
  value: GenerationFormState["count"];
  onChange: (count: GenerationFormState["count"]) => void;
  error?: string;
}

export const _GenerationDrawerCountStep = ({
  value,
  onChange,
  error,
}: CountStepProps) => {
  return (
    <FormField label={generationMessages.countLabel} error={error}>
      <QuantityStepper
        value={value}
        onChange={onChange}
        min={1}
        max={10}
        label="Questions"
      />
    </FormField>
  );
};
