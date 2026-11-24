import type { ReactElement } from "react";
import { Input } from "@pte/ui";
import type { UserResponse } from "@pte/api-client";
import { CREATE_EXAM_WIZARD_TEXT } from "../../constants";
import type { ProctorSelection } from "../../types";
import { fillTemplate } from "../../utils/fillTemplate";

type WizardText = typeof CREATE_EXAM_WIZARD_TEXT;

export interface ProctorPickerProps {
  wizardText: WizardText;
  search: string;
  candidates: readonly UserResponse[];
  selection: readonly ProctorSelection[];
  loading: boolean;
  onSearchChange: (search: string) => void;
  toggleProctor: (proctorPublicId: string) => void;
  clearProctors: () => void;
}

/** Active proctor accounts with a checkbox each; all picked proctors hold the same PROCTOR role. */
export function ProctorPicker({
  wizardText,
  search,
  candidates,
  selection,
  loading,
  onSearchChange,
  toggleProctor,
  clearProctors,
}: ProctorPickerProps): ReactElement {
  const pickedIds = new Set(selection.map((entry) => entry.proctorPublicId));

  return (
    <div className="rounded-xl border border-[var(--shell-border)] bg-[var(--surface-subtle)] p-5">
      <div className="mb-1 text-sm font-semibold text-[var(--ink-primary)]">
        {wizardText.PROCTORS_TITLE}
      </div>
      <p className="mb-3 text-xs text-[var(--ink-secondary)]">{wizardText.PROCTORS_HINT}</p>
      <Input
        label={wizardText.PROCTOR_SEARCH_LABEL}
        placeholder={wizardText.PROCTOR_SEARCH_PLACEHOLDER}
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />

      <div className="mt-3 overflow-hidden rounded-lg border border-[var(--shell-border)] bg-[var(--surface-card)]">
        <div className="max-h-72 overflow-y-auto">
          {loading ? (
            <p className="px-4 py-8 text-center text-sm text-[var(--ink-muted)]">
              {wizardText.PROCTOR_LOADING}
            </p>
          ) : candidates.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[var(--ink-muted)]">
              {wizardText.PROCTOR_EMPTY}
            </p>
          ) : (
            <ul className="divide-y divide-[var(--shell-border)]">
              {candidates.map((proctor) => (
                  <li
                    key={proctor.publicId}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--surface-subtle)]"
                  >
                    <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={pickedIds.has(proctor.publicId)}
                        onChange={() => toggleProctor(proctor.publicId)}
                        aria-label={`${wizardText.SELECT_PROCTOR}: ${proctor.fullName}`}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-[var(--ink-primary)]">
                          {proctor.fullName}
                        </span>
                        <span className="block truncate text-xs text-[var(--ink-muted)]">
                          {proctor.email}
                        </span>
                      </span>
                    </label>
                  </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-sm">
        <span className="text-[var(--ink-primary)]">
          {selection.length === 0
            ? wizardText.NO_PROCTORS
            : fillTemplate(wizardText.PROCTORS_SELECTED_TOTAL, { count: selection.length })}
        </span>
        {selection.length > 0 && (
          <button
            type="button"
            onClick={clearProctors}
            className="text-[var(--blush-action)] hover:underline"
          >
            {wizardText.CLEAR_SELECTION}
          </button>
        )}
      </div>
    </div>
  );
}
