"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Button, Select } from "@pte/ui";
import { useTenantStudents } from "@/features/examoperations/api";
import { useClassMemberships } from "@/features/studentSearch/api";
import { useAssignStudent } from "../api";
import { useStudentImportText } from "../hooks/useStudentImportText";
import { assignErrorMessage } from "./assignErrorMessage";
import type { TabScopeProps } from "./tabScopeProps";

interface ExistingStudentTabProps extends TabScopeProps {
  onAssigned: () => void;
}

/**
 * "Pick Existing" — assign a learner the Host has already created. Only
 * unassigned learners are offered, so the Host cannot build a duplicate
 * membership through this path.
 */
export const ExistingStudentTab = ({
  organizationPublicId,
  programPublicId,
  classPublicId,
  onAssigned,
}: ExistingStudentTabProps): ReactElement => {
  const text = useStudentImportText();
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const { data: students, isLoading: studentsLoading } = useTenantStudents();
  const { data: memberships, isLoading: membershipsLoading } = useClassMemberships();
  const assignStudent = useAssignStudent(organizationPublicId, programPublicId, classPublicId);

  const loading = studentsLoading || membershipsLoading;
  const assignedIds = new Set((memberships ?? []).map((membership) => membership.studentPublicId));
  const unassignedStudents = (students ?? []).filter(
    (student) => !assignedIds.has(student.publicId),
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!selectedStudentId) return;
    assignStudent.mutate({ studentPublicId: selectedStudentId }, { onSuccess: onAssigned });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {!!assignStudent.error && (
        <Alert tone="error">{assignErrorMessage(assignStudent.error)}</Alert>
      )}

      {unassignedStudents.length === 0 && !loading ? (
        <p className="text-sm text-gray-500">{text.noExisting}</p>
      ) : (
        <Select
          label={text.existingLabel}
          placeholder={text.existingPlaceholder}
          value={selectedStudentId}
          disabled={loading}
          onChange={(event) => setSelectedStudentId(event.target.value)}
          options={unassignedStudents.map((student) => ({
            label: `${student.fullName} (${student.email})`,
            value: student.publicId,
          }))}
        />
      )}

      <div>
        <Button
          type="submit"
          disabled={!selectedStudentId}
          isLoading={assignStudent.isPending}
          loadingText={text.assigning}
        >
          {text.assign}
        </Button>
      </div>
    </form>
  );
};
