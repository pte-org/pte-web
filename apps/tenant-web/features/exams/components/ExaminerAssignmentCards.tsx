import type { ReactElement } from "react";
import { Select } from "@pte/ui";
import type { PickedStudent } from "./AssignStudentsToExaminerModal";

export interface ExaminerCardDraft {
  key: string;
  examinerPublicId: string;
  students: PickedStudent[];
}

export interface ExaminerCardLabels {
  examiner: string;
  examinerPlaceholder: string;
  addStudents: string;
  noStudents: string;
  remove: string;
  /** Already contains the count, e.g. "12 students". */
  count: (count: number) => string;
}

interface StudentChipsProps {
  students: PickedStudent[];
  removeLabel: string;
  onRemove: (studentPublicId: string) => void;
}

/** Picked students as removable chips. */
export const StudentChips = ({
  students,
  removeLabel,
  onRemove,
}: StudentChipsProps): ReactElement => (
  <ul className="flex flex-wrap gap-2">
    {students.map((student) => (
      <li
        key={student.publicId}
        className="flex items-center gap-1 rounded-full bg-[var(--surface-subtle)] py-1 pl-3 pr-1 text-sm text-[var(--ink-primary)]"
      >
        {student.fullName}
        <button
          type="button"
          onClick={() => onRemove(student.publicId)}
          aria-label={`${removeLabel}: ${student.fullName}`}
          className="rounded-full px-2 text-[var(--ink-secondary)] hover:bg-red-50 hover:text-red-700"
        >
          ×
        </button>
      </li>
    ))}
  </ul>
);

interface ExaminerCardsProps {
  cards: ExaminerCardDraft[];
  examinerOptions: { value: string; label: string }[];
  labels: ExaminerCardLabels;
  onExaminerChange: (cardKey: string, examinerPublicId: string) => void;
  onAddStudents: (cardKey: string) => void;
  onRemoveStudent: (cardKey: string, studentPublicId: string) => void;
  onRemoveCard: (cardKey: string) => void;
}

/** One card per Examiner, holding the students that Examiner will grade. */
export const ExaminerCards = ({
  cards,
  examinerOptions,
  labels,
  onExaminerChange,
  onAddStudents,
  onRemoveStudent,
  onRemoveCard,
}: ExaminerCardsProps): ReactElement => (
  <>
    {cards.map((card) => {
      const takenByOthers = new Set(
        cards.filter((other) => other.key !== card.key).map((other) => other.examinerPublicId),
      );
      return (
        <div
          key={card.key}
          className="flex flex-col gap-3 rounded-md border border-[var(--shell-border)] p-3"
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-60">
              <Select
                label={labels.examiner}
                value={card.examinerPublicId}
                onChange={(event) => onExaminerChange(card.key, event.target.value)}
                placeholder={labels.examinerPlaceholder}
                options={examinerOptions.filter((option) => !takenByOthers.has(option.value))}
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[var(--ink-secondary)]">
                {labels.count(card.students.length)}
              </span>
              <button
                type="button"
                onClick={() => onRemoveCard(card.key)}
                className="rounded-md px-2 py-1 text-sm text-red-700 hover:bg-red-50"
              >
                {labels.remove}
              </button>
            </div>
          </div>
          {card.students.length === 0 ? (
            <p className="text-sm text-[var(--ink-secondary)]">{labels.noStudents}</p>
          ) : (
            <StudentChips
              students={card.students}
              removeLabel={labels.remove}
              onRemove={(studentPublicId) => onRemoveStudent(card.key, studentPublicId)}
            />
          )}
          <button
            type="button"
            disabled={card.examinerPublicId.length === 0}
            onClick={() => onAddStudents(card.key)}
            className="self-start rounded-lg border border-[var(--shell-border)] px-3 py-1.5 text-sm text-[var(--ink-primary)] hover:bg-[var(--surface-subtle)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            + {labels.addStudents}
          </button>
        </div>
      );
    })}
  </>
);
