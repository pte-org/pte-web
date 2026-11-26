import type { ReactElement } from "react";
import type { ScoreTemplateResponse } from "@pte/api-client";
import { Badge, Chip } from "@pte/ui";
import { sectionTone } from "@/lib/chipTones";
import { CREATE_EXAM_WIZARD_TEXT } from "../../constants";
import type { CreateExamWorkflowInput, ExamSkill } from "../../types";
import { difficultyTargets, type DifficultySelection } from "../../utils/cefrTargets";
import type { CreateExamStep } from "../../utils/createExamWizard";
import { fillTemplate } from "../../utils/fillTemplate";
import { formatReviewWindow } from "../../utils/reviewWindow";
import { ReviewField, ReviewGroup } from "./ReviewGroup";

type WizardText = typeof CREATE_EXAM_WIZARD_TEXT;
type SkillOption = { value: ExamSkill; label: string };

export interface ReviewStepProps {
  form: CreateExamWorkflowInput;
  activeTemplate?: ScoreTemplateResponse;
  wizardText: WizardText;
  localizedSkillOptions: readonly SkillOption[];
  templateSkills: readonly ExamSkill[];
  audienceCount: number;
  proctorCount: number;
  /** Jumps back to the step a block of this summary came from. */
  onEditStep: (step: CreateExamStep) => void;
}

/** The chosen difficulty in words, e.g. "B1 50%, B2 50%"; "Follow the template" when none was set. */
function difficultySummary(
  selection: DifficultySelection | undefined,
  wizardText: WizardText,
): string {
  const targets = difficultyTargets(selection);
  return targets
    ? targets.map((target) => `${target.level} ${target.percent}%`).join(", ")
    : wizardText.DIFFICULTY_TEMPLATE;
}

export function ReviewStep({
  form,
  activeTemplate,
  wizardText,
  localizedSkillOptions,
  templateSkills,
  audienceCount,
  proctorCount,
  onEditStep,
}: ReviewStepProps): ReactElement {
  const skills = templateSkills.flatMap((skill) => {
    const option = localizedSkillOptions.find((item) => item.value === skill);
    return option ? [option] : [];
  });
  const capacity = Number(form.capacity);
  const openWindow = formatReviewWindow(form.opensAt, form.closesAt, {
    day: wizardText.WINDOW_UNIT_DAY,
    hour: wizardText.WINDOW_UNIT_HOUR,
    minute: wizardText.WINDOW_UNIT_MINUTE,
  });

  return (
    <div className="divide-y divide-[var(--divider)] rounded-xl border border-[var(--shell-border)] bg-[var(--surface-subtle)]">
      <ReviewGroup title={wizardText.STEP_DETAILS} editLabel={wizardText.REVIEW_EDIT} onEdit={() => onEditStep(1)}>
        <ReviewField label={wizardText.NAME_LABEL}>{form.name.trim() || wizardText.EMPTY_VALUE}</ReviewField>
        <ReviewField label={wizardText.REVIEW_TEMPLATE}>
          {activeTemplate?.name ?? wizardText.EMPTY_VALUE}
        </ReviewField>
        <ReviewField label={wizardText.REVIEW_SKILLS}>
          {skills.length === 0 ? (
            wizardText.EMPTY_VALUE
          ) : (
            <span className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <Chip key={skill.value} tone={sectionTone(skill.value)} size="sm">
                  {skill.label}
                </Chip>
              ))}
            </span>
          )}
        </ReviewField>
        <ReviewField label={wizardText.REVIEW_DIFFICULTY}>
          {difficultySummary(form.difficulty, wizardText)}
        </ReviewField>
        <ReviewField label={wizardText.REVIEW_REPEAT}>
          {form.avoidRepeats ? wizardText.REPEAT_AVOID : wizardText.REPEAT_ALLOW}
        </ReviewField>
      </ReviewGroup>

      <ReviewGroup
        title={wizardText.STEP_SCHEDULE_POLICY}
        editLabel={wizardText.REVIEW_EDIT}
        onEdit={() => onEditStep(2)}
      >
        <ReviewField label={wizardText.REVIEW_WINDOW}>{openWindow || wizardText.EMPTY_VALUE}</ReviewField>
      </ReviewGroup>

      <ReviewGroup title={wizardText.STEP_AUDIENCE} editLabel={wizardText.REVIEW_EDIT} onEdit={() => onEditStep(3)}>
        <ReviewField label={wizardText.REVIEW_AUDIENCE}>
          {capacity > 0
            ? fillTemplate(wizardText.REVIEW_AUDIENCE_OF_CAPACITY, { count: audienceCount, capacity })
            : audienceCount}
        </ReviewField>
        <ReviewField label={wizardText.REVIEW_PROCTORS}>
          <span className="flex flex-wrap items-center gap-2">
            {proctorCount}
            {proctorCount === 0 && <Badge variant="warning">{wizardText.REVIEW_NO_PROCTORS}</Badge>}
          </span>
        </ReviewField>
      </ReviewGroup>
    </div>
  );
}
