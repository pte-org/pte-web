import type { ReactElement } from "react";
import { Chip, Input, Select } from "@pte/ui";
import { cefrTone } from "@/lib/chipTones";
import { CREATE_EXAM_WIZARD_TEXT } from "../../constants";
import {
  CEFR_LEVELS,
  isStandardExam,
  mixTotal,
  type CefrLevel,
  type DifficultyMode,
  type DifficultySelection,
} from "../../utils/cefrTargets";

type WizardText = typeof CREATE_EXAM_WIZARD_TEXT;

interface DifficultyPickerProps {
  wizardText: WizardText;
  selection: DifficultySelection;
  /** Whether the chosen template is Pearson standard; null for the platform default or an unknown template. */
  templateIsStandard: boolean | null | undefined;
  error?: string;
  onChange: (selection: DifficultySelection) => void;
}

/**
 * How the questions of an exam are spread over CEFR levels: as the template says, evenly over a band of levels,
 * or by a mix the centre types in. Shows whether the exam is still Pearson standard.
 */
export function DifficultyPicker({
  wizardText,
  selection,
  templateIsStandard,
  error,
  onChange,
}: DifficultyPickerProps): ReactElement {
  const levelOptions = CEFR_LEVELS.map((level) => ({ value: level, label: level }));
  const standard = isStandardExam(selection, templateIsStandard);

  return (
    <div className="space-y-3 rounded-xl border border-[var(--shell-border)] p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-[var(--ink-primary)]">
          {wizardText.DIFFICULTY_LABEL}
        </span>
        <Chip tone={standard ? "mint" : "cream"} size="sm">
          {standard ? wizardText.DIFFICULTY_STANDARD : wizardText.DIFFICULTY_CUSTOMISED}
        </Chip>
      </div>
      <Select
        label={wizardText.DIFFICULTY_LABEL}
        value={selection.mode}
        onChange={(event) => onChange({ ...selection, mode: event.target.value as DifficultyMode })}
        options={[
          { value: "TEMPLATE", label: wizardText.DIFFICULTY_TEMPLATE },
          { value: "BAND", label: wizardText.DIFFICULTY_BAND },
          { value: "CUSTOM", label: wizardText.DIFFICULTY_CUSTOM },
        ]}
        helperText={selection.mode === "TEMPLATE" ? wizardText.DIFFICULTY_TEMPLATE_HINT : undefined}
      />
      {selection.mode === "BAND" && (
        <div className="grid grid-cols-2 gap-3">
          <Select
            label={wizardText.DIFFICULTY_BAND_FROM}
            value={selection.bandFrom}
            onChange={(event) =>
              onChange({ ...selection, bandFrom: event.target.value as CefrLevel })
            }
            options={levelOptions}
          />
          <Select
            label={wizardText.DIFFICULTY_BAND_TO}
            value={selection.bandTo}
            onChange={(event) =>
              onChange({ ...selection, bandTo: event.target.value as CefrLevel })
            }
            options={levelOptions}
          />
        </div>
      )}
      {selection.mode === "CUSTOM" && (
        <div className="space-y-2">
          <p className="text-xs text-[var(--ink-secondary)]">{wizardText.DIFFICULTY_CUSTOM_HINT}</p>
          <div className="grid grid-cols-3 gap-3">
            {CEFR_LEVELS.map((level) => (
              <div key={level} className="space-y-1">
                <Chip tone={cefrTone(level)} size="sm">
                  {level}
                </Chip>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  label="%"
                  value={selection.mix[level]}
                  onChange={(event) =>
                    onChange({
                      ...selection,
                      mix: { ...selection.mix, [level]: event.target.value },
                    })
                  }
                />
              </div>
            ))}
          </div>
          <p className="text-sm text-[var(--ink-primary)]">
            {wizardText.DIFFICULTY_TOTAL}: {mixTotal(selection.mix)}%
          </p>
          {error && <p className="text-sm text-[var(--blush-action)]">{error}</p>}
        </div>
      )}
    </div>
  );
}
