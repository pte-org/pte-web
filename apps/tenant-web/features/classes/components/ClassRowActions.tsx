"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Dropdown, type DropdownItem } from "@pte/ui";
import type { ClassResponse } from "@pte/api-client";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { CLASS_ROW_ACTIONS_TEXT } from "../constants";
import { useClassStatusMutations } from "../api";
import { buildAssignStudentsUrl } from "../utils/assignStudentsUrl";
import { ClassStatusConfirmDialogs, type ClassStatusAction } from "./ClassStatusConfirmDialogs";

interface ClassRowActionsProps {
  organizationPublicId: string;
  programPublicId: string;
  studentCount: number;
  classLabel: string;
  studentClass: ClassResponse;
  onEdit: () => void;
}

/**
 * Kebab menu for one row of the Classes table.
 *
 * Extracted from `ClassesSection.tsx` into its own file because the section was at the
 * 300-line ceiling once the four lifecycle `ConfirmDialog`s were introduced.
 *
 * Every lifecycle transition routes through a `ConfirmDialog` — no silent mutation path
 * remains (spec stories S2/S5). `studentCount` is frozen at dialog-open by the caller and
 * arrives as a prop, so no dialog issues its own query (spec §6 stability rule).
 */
export const ClassRowActions = ({
  organizationPublicId,
  programPublicId,
  studentCount,
  classLabel,
  studentClass,
  onEdit,
}: ClassRowActionsProps): ReactElement => {
  const router = useRouter();
  const [confirmAction, setConfirmAction] = useState<ClassStatusAction | null>(null);
  const mutations = useClassStatusMutations(
    organizationPublicId,
    programPublicId,
    studentClass.publicId,
  );
  const pending =
    mutations.activate.isPending ||
    mutations.deactivate.isPending ||
    mutations.suspend.isPending ||
    mutations.archive.isPending;
  const rowError = errorMessage(
    mutations.activate.error ??
      mutations.deactivate.error ??
      mutations.suspend.error ??
      mutations.archive.error,
  );

  const isActive = studentClass.status === "ACTIVE";
  const assignDisabled = pending || !isActive;

  const items: DropdownItem[] = [
    {
      label: CLASS_ROW_ACTIONS_TEXT.edit,
      onSelect: () => onEdit(),
    },
    {
      label: CLASS_ROW_ACTIONS_TEXT.assignStudents,
      onSelect: () =>
        router.push(
          buildAssignStudentsUrl("/host/students", {
            organizationPublicId,
            programPublicId,
            classPublicId: studentClass.publicId,
          }),
        ),
      disabled: assignDisabled,
      ...(assignDisabled && {
        title: CLASS_ROW_ACTIONS_TEXT.assignStudentsDisabledTitle,
      }),
    },
    { separator: true, key: "nav-status-divider" },
    {
      label: CLASS_ROW_ACTIONS_TEXT.activate,
      onSelect: () => setConfirmAction("activate"),
      hidden: isActive,
    },
    {
      label: CLASS_ROW_ACTIONS_TEXT.suspend,
      onSelect: () => setConfirmAction("suspend"),
      hidden: !isActive,
    },
    {
      label: CLASS_ROW_ACTIONS_TEXT.deactivate,
      onSelect: () => setConfirmAction("deactivate"),
      hidden: studentClass.status === "INACTIVE",
    },
    { separator: true, key: "danger-divider" },
    {
      label: CLASS_ROW_ACTIONS_TEXT.archive,
      onSelect: () => setConfirmAction("archive"),
      danger: true,
    },
  ];

  const handleConfirm = (): void => {
    switch (confirmAction) {
      case "activate":
        mutations.activate.mutate(undefined, { onSettled: () => setConfirmAction(null) });
        break;
      case "deactivate":
        mutations.deactivate.mutate(undefined, { onSettled: () => setConfirmAction(null) });
        break;
      case "suspend":
        mutations.suspend.mutate(undefined, { onSettled: () => setConfirmAction(null) });
        break;
      case "archive":
        mutations.archive.mutate(undefined, { onSettled: () => setConfirmAction(null) });
        break;
      case null:
        break;
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <Dropdown
        items={items}
        label={CLASS_ROW_ACTIONS_TEXT.actions}
        align="right"
      />
      {rowError && <p className="text-xs text-red-600">{rowError}</p>}
      <ClassStatusConfirmDialogs
        studentClassName={studentClass.name}
        studentCount={studentCount}
        classLabel={classLabel}
        action={confirmAction}
        isConfirming={pending}
        onConfirm={handleConfirm}
        onClose={() => setConfirmAction(null)}
      />
    </div>
  );
};
