import type { ReactElement } from "react";
import { Input, Select } from "@pte/ui";
import { AUDIENCE_FILTER_ALL, AUDIENCE_FILTER_NO_CLASS, CREATE_EXAM_WIZARD_TEXT } from "../../constants";
import type {
  AudienceOption,
  AudienceStudent,
} from "../../hooks/useAudienceStudentPicker";
import { fillTemplate } from "../../utils/fillTemplate";

type WizardText = typeof CREATE_EXAM_WIZARD_TEXT;

export interface AudienceStudentPickerProps {
  wizardText: WizardText;
  search: string;
  programFilter: string;
  classFilter: string;
  programOptions: AudienceOption[];
  classOptions: AudienceOption[];
  students: AudienceStudent[];
  selectedIds: ReadonlySet<string>;
  selectedInFilterCount: number;
  loading: boolean;
  onSearchChange: (search: string) => void;
  onProgramFilterChange: (programPublicId: string) => void;
  onClassFilterChange: (classPublicId: string) => void;
  toggleStudent: (studentPublicId: string) => void;
  toggleAllFiltered: () => void;
}

/** Program/class filters, search and a checkbox list of students, shared by the create wizard and the exam participants tab. */
export function AudienceStudentPicker({
  wizardText,
  search,
  programFilter,
  classFilter,
  programOptions,
  classOptions,
  students,
  selectedIds,
  selectedInFilterCount,
  loading,
  onSearchChange,
  onProgramFilterChange,
  onClassFilterChange,
  toggleStudent,
  toggleAllFiltered,
}: AudienceStudentPickerProps): ReactElement {
  const allSelected = students.length > 0 && selectedInFilterCount === students.length;
  const someSelected = selectedInFilterCount > 0 && !allSelected;
  const programSelectOptions = [
    { value: AUDIENCE_FILTER_ALL, label: wizardText.FILTER_ALL_PROGRAMS },
    ...programOptions,
  ];
  const classSelectOptions = [
    { value: AUDIENCE_FILTER_ALL, label: wizardText.FILTER_ALL_CLASSES },
    { value: AUDIENCE_FILTER_NO_CLASS, label: wizardText.FILTER_NO_CLASS },
    ...classOptions,
  ];

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        <Select
          label={wizardText.FILTER_PROGRAM_LABEL}
          value={programFilter}
          onChange={(event) => onProgramFilterChange(event.target.value)}
          options={programSelectOptions}
        />
        <Select
          label={wizardText.FILTER_CLASS_LABEL}
          value={classFilter}
          onChange={(event) => onClassFilterChange(event.target.value)}
          options={classSelectOptions}
        />
        <Input
          label={wizardText.SOURCE_SEARCH_LABEL}
          placeholder={wizardText.SOURCE_SEARCH_PLACEHOLDER}
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="mt-3 overflow-hidden rounded-lg border border-[var(--shell-border)] bg-[var(--surface-card)]">
        <label className="flex cursor-pointer items-center gap-3 border-b border-[var(--shell-border)] px-3 py-2.5 text-sm font-medium text-[var(--ink-primary)]">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(element) => {
              if (element) element.indeterminate = someSelected;
            }}
            disabled={loading || students.length === 0}
            onChange={toggleAllFiltered}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="flex-1">{wizardText.SELECT_ALL_FILTERED}</span>
          <span className="text-xs font-normal text-[var(--ink-muted)]">
            {fillTemplate(wizardText.SELECTED_IN_LIST, {
              selected: selectedInFilterCount,
              total: students.length,
            })}
          </span>
        </label>
        <div className="max-h-72 overflow-y-auto">
          {loading ? (
            <p className="px-4 py-8 text-center text-sm text-[var(--ink-muted)]">
              {wizardText.SOURCE_LOADING}
            </p>
          ) : students.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[var(--ink-muted)]">
              {wizardText.SOURCE_EMPTY}
            </p>
          ) : (
            <ul className="divide-y divide-[var(--shell-border)]">
              {students.map((student) => (
                <li key={student.publicId}>
                  <label className="flex cursor-pointer items-start gap-3 px-3 py-2.5 hover:bg-[var(--surface-subtle)]">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(student.publicId)}
                      onChange={() => toggleStudent(student.publicId)}
                      aria-label={`${wizardText.SELECT_STUDENT}: ${student.fullName}`}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-[var(--ink-primary)]">
                        {student.fullName}
                      </span>
                      <span className="block truncate text-xs text-[var(--ink-muted)]">
                        {student.contact}
                      </span>
                    </span>
                    <span className="shrink-0 text-right text-xs text-[var(--ink-secondary)]">
                      {student.group
                        ? `${student.group.className} · ${student.group.programName}`
                        : wizardText.NO_CLASS_BADGE}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
