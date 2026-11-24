import Link from "next/link";
import { useState, type ReactElement } from "react";
import { TabPanel, Tabs } from "@pte/ui";
import { CREATE_EXAM_WIZARD_TEXT } from "../../constants";
import { fillTemplate } from "../../utils/fillTemplate";
import type { CreateExamWorkflowErrors } from "../../utils/validateCreateExamWorkflow";
import { AudienceStudentPicker, type AudienceStudentPickerProps } from "./AudienceStudentPicker";
import { ProctorPicker, type ProctorPickerProps } from "./ProctorPicker";

type WizardText = typeof CREATE_EXAM_WIZARD_TEXT;
type ParticipantsTab = "students" | "proctors";

const TABS_ID = "create-exam-participants";

export interface AudienceStepProps extends AudienceStudentPickerProps {
  errors: CreateExamWorkflowErrors;
  wizardText: WizardText;
  clearSelection: () => void;
  localizeError: (message?: string) => string | undefined;
  proctorPickerProps: Omit<ProctorPickerProps, "wizardText">;
}

/** Step 3: who takes the exam (students) and who watches it (proctors, optional), as two sub-tabs. */
export function AudienceStep({
  errors,
  wizardText,
  clearSelection,
  localizeError,
  proctorPickerProps,
  ...pickerProps
}: AudienceStepProps): ReactElement {
  const { selectedIds } = pickerProps;
  const [tab, setTab] = useState<ParticipantsTab>("students");

  // The only blocking error of this step belongs to the students tab, so bring it into view when it appears.
  const [seenSourcesError, setSeenSourcesError] = useState(errors.sources);
  if (errors.sources !== seenSourcesError) {
    setSeenSourcesError(errors.sources);
    if (errors.sources) setTab("students");
  }

  return (
    <>
      <div className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-secondary)]">
        {wizardText.STEP_AUDIENCE}
      </div>
      <Tabs
        id={TABS_ID}
        variant="minimal"
        ariaLabel={wizardText.PARTICIPANTS_TABS}
        value={tab}
        onChange={(value) => setTab(value as ParticipantsTab)}
        items={[
          { id: "students", label: wizardText.TAB_STUDENTS, count: selectedIds.size },
          {
            id: "proctors",
            label: wizardText.TAB_PROCTORS,
            count: proctorPickerProps.selection.length,
          },
        ]}
      />
      <TabPanel
        id={`${TABS_ID}-panel-students`}
        labelledBy={`${TABS_ID}-tab-students`}
        active={tab === "students"}
      >
        <div className="rounded-xl border border-[var(--shell-border)] bg-[var(--surface-subtle)] p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="text-sm font-semibold text-[var(--ink-primary)]">
              {wizardText.SOURCES_TITLE}
            </div>
            <Link
              href="/host/programs"
              className="text-xs font-medium text-[var(--brand-ink)] hover:underline"
            >
              {wizardText.MANAGE_CLASSES}
            </Link>
          </div>
          <AudienceStudentPicker wizardText={wizardText} {...pickerProps} />

          {errors.sources && (
            <p className="mt-2 text-sm text-[var(--blush-action)]">
              {localizeError(errors.sources)}
            </p>
          )}
          <div className="mt-3 flex items-center justify-between gap-3 text-sm">
            <span className="text-[var(--ink-primary)]">
              {selectedIds.size === 0
                ? wizardText.NO_SOURCES
                : fillTemplate(wizardText.SELECTED_TOTAL, { count: selectedIds.size })}
            </span>
            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={clearSelection}
                className="text-[var(--blush-action)] hover:underline"
              >
                {wizardText.CLEAR_SELECTION}
              </button>
            )}
          </div>
        </div>
      </TabPanel>
      <TabPanel
        id={`${TABS_ID}-panel-proctors`}
        labelledBy={`${TABS_ID}-tab-proctors`}
        active={tab === "proctors"}
      >
        <ProctorPicker wizardText={wizardText} {...proctorPickerProps} />
      </TabPanel>
    </>
  );
}
