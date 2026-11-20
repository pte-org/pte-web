"use client";

import { useMemo, useState, type FormEvent, type ReactElement } from "react";
import { Button, Checkbox, Input, useToast } from "@pte/ui";
import { useTenantStudents } from "@/features/examoperations/api";
import { useClassMemberships } from "@/features/studentSearch/api";
import { useBulkAssignStudents } from "../api";
import { useStudentImportText } from "../hooks/useStudentImportText";
import { pickableStudents, toggleAllShown, toggleStudent } from "../utils/existingStudentPicker";
import { assignErrorMessage } from "./assignErrorMessage";
import type { TabScopeProps } from "./tabScopeProps";

interface ExistingStudentTabProps extends TabScopeProps {
  onAssigned: () => void;
}

/**
 * "Pick Existing" — assign learners the Host has already created, several at once. Only learners
 * not yet in any class are offered, so this path cannot build a duplicate membership.
 */
export const ExistingStudentTab = ({
  organizationPublicId,
  programPublicId,
  classPublicId,
  onAssigned,
}: ExistingStudentTabProps): ReactElement => {
  const text = useStudentImportText();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const { data: students, isLoading: studentsLoading } = useTenantStudents();
  const { data: memberships, isLoading: membershipsLoading } = useClassMemberships();
  const bulkAssign = useBulkAssignStudents(organizationPublicId, programPublicId, classPublicId);

  const loading = studentsLoading || membershipsLoading;
  const assignedIds = useMemo(
    () => new Set((memberships ?? []).map((membership) => membership.studentPublicId)),
    [memberships],
  );
  const unassigned = pickableStudents(students ?? [], assignedIds, "");
  const shown = pickableStudents(students ?? [], assignedIds, search);
  const count = selected.size;

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (count === 0) return;
    bulkAssign.mutate(Array.from(selected), {
      onSuccess: (result) => {
        showToast(text.bulkAssigned.replace("{assigned}", String(result.assigned.length)), { tone: "success" });
        if (result.alreadyInClass.length > 0) {
          showToast(text.bulkAlreadyIn.replace("{count}", String(result.alreadyInClass.length)), { tone: "info" });
        }
        setSelected(new Set());
        onAssigned();
      },
      onError: (error) => {
        const message = assignErrorMessage(error, classPublicId, text);
        if (message) showToast(message, { tone: "error" });
      },
    });
  };

  if (unassigned.length === 0 && !loading) {
    // Tell "nobody exists yet" apart from "everyone is already in a class".
    const total = students?.length ?? 0;
    const message = total === 0 ? text.noExisting : text.allAssigned.replace("{count}", String(total));
    return <p className="text-sm text-gray-500">{message}</p>;
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
      <Input
        aria-label={text.existingSearch}
        placeholder={text.existingSearch}
        value={search}
        disabled={loading}
        onChange={(event) => setSearch(event.target.value)}
      />
      <div className="flex items-center justify-between gap-2 text-sm">
        <Checkbox
          id="existing-select-all"
          label={text.selectAllExisting}
          checked={shown.length > 0 && shown.every((student) => selected.has(student.publicId))}
          disabled={shown.length === 0}
          onChange={() => setSelected((current) => toggleAllShown(current, shown))}
        />
        <span className="text-gray-500">{text.existingSelected.replace("{count}", String(count))}</span>
      </div>
      <ul className="max-h-72 divide-y divide-[var(--shell-border)] overflow-y-auto rounded-lg border border-[var(--shell-border)]">
        {shown.length === 0 && <li className="px-3 py-2 text-sm text-gray-500">{text.noExistingMatch}</li>}
        {shown.map((student) => (
          <li key={student.publicId} className="px-3 py-2">
            <Checkbox
              id={`existing-${student.publicId}`}
              label={`${student.fullName} (${student.email})`}
              checked={selected.has(student.publicId)}
              onChange={() => setSelected((current) => toggleStudent(current, student.publicId))}
            />
          </li>
        ))}
      </ul>
      <div>
        <Button type="submit" disabled={count === 0} isLoading={bulkAssign.isPending} loadingText={text.assigning}>
          {count > 0 ? text.assignSelected.replace("{count}", String(count)) : text.assign}
        </Button>
      </div>
    </form>
  );
};
