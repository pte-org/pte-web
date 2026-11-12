"use client";

import { FormField, RadioCard } from "@pte/ui";
import { GENERATION_IMAGE_KINDS, type GenerationImageKind } from "../constants";
import { generationMessages } from "../messages/en";

interface ImageKindStepProps {
  value: GenerationImageKind | undefined;
  onChange: (kind: GenerationImageKind) => void;
}

const LABELS: Record<GenerationImageKind, string> = {
  AUTO: generationMessages.imageKindAuto,
  CHART: generationMessages.imageKindChart,
  PICTURE: generationMessages.imageKindPicture,
};

/** Describe Image only: whether the picture is a chart from data, an AI-painted picture, or chosen from the topic. */
export const _GenerationDrawerImageKindStep = ({ value, onChange }: ImageKindStepProps) => (
  <FormField label={generationMessages.imageKindLabel}>
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-3">
        {GENERATION_IMAGE_KINDS.map((kind) => (
          <RadioCard
            key={kind}
            name="imageKind"
            label={LABELS[kind]}
            checked={(value ?? "AUTO") === kind}
            onChange={() => onChange(kind)}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500">{generationMessages.imageKindHint}</p>
    </div>
  </FormField>
);
