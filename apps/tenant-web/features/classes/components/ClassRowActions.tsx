"use client";

import { useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { ActionMenu, EyeIcon, UserPlusIcon, useToast, type DropdownItem } from "@pte/ui";
import type { ClassResponse } from "@pte/api-client";
import { useClassActionText } from "../hooks/useClassActionText";
import { useClassStatusMutations } from "../api";
import { ClassStatusConfirmDialogs, type ClassStatusAction } from "./ClassStatusConfirmDialogs";
import { ImportOrAssignModal } from "./ImportOrAssignModal";

interface ClassRowActionsProps {
  organizationPublicId: string;
  programPublicId: string;
  studentCount: number;
  classLabel: string;
  studentClass: ClassResponse;
  onEdit?: () => void;
  showViewDetails?: boolean;
  /** Off where the page already has its own add-students button. */
  showAssignStudents?: boolean;
  onArchived?: () => void;
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
  showViewDetails = true,
  showAssignStudents = true,
  onArchived,
}: ClassRowActionsProps): ReactElement => {
  const router = useRouter();
  const text = useClassActionText();
  const { showToast } = useToast();
  const [confirmAction, setConfirmAction] = useState<ClassStatusAction | null>(null);
  // Assigning opens the same "add learners" dialog as the class detail page, right here.
  const [assignOpen, setAssignOpen] = useState(false);
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

  const isActive = studentClass.status === "ACTIVE";
  const assignDisabled = pending || !isActive;

  const items: DropdownItem[] = [];
  if (onEdit) {
    items.push({ label: text.edit, onSelect: onEdit, disabled: pending });
    // Without the view/assign items the status divider below already separates Edit from the rest.
    if (showViewDetails || showAssignStudents) items.push({ separator: true, key: "edit-divider" });
  }
  if (showViewDetails) {
    items.push({
      label: text.viewDetails,
      icon: EyeIcon,
      onSelect: () =>
        router.push(
          `/host/programs/${programPublicId}/classes/${studentClass.publicId}?${new URLSearchParams({ organizationPublicId })}`,
        ),
    });
  }
  if (showAssignStudents) items.push({
    label: text.assignStudents,
    icon: UserPlusIcon,
    onSelect: () => setAssignOpen(true),
    disabled: assignDisabled,
    ...(assignDisabled && {
      title: text.assignDisabled,
    }),
  });
  items.push(
    { separator: true, key: "nav-status-divider" },
    {
      label: text.activate,
      onSelect: () => setConfirmAction("activate"),
      hidden: isActive,
    },
    {
      label: text.suspend,
      onSelect: () => setConfirmAction("suspend"),
      hidden: !isActive,
    },
    {
      label: text.deactivate,
      onSelect: () => setConfirmAction("deactivate"),
      hidden: studentClass.status === "INACTIVE",
    },
    { separator: true, key: "danger-divider" },
    {
      label: text.archive,
      onSelect: () => setConfirmAction("archive"),
      danger: true,
    },
  );

  const successMessage = {
    activate: text.activateSuccess,
    deactivate: text.deactivateSuccess,
    suspend: text.suspendSuccess,
    archive: text.archiveSuccess,
  } as const;

  const handleConfirm = (): void => {
    if (!confirmAction) return;
    const action = confirmAction;
    mutations[action].mutate(undefined, {
      onSuccess: () => {
        setConfirmAction(null);
        showToast(successMessage[action], { tone: "success" });
        if (action === "archive") onArchived?.();
      },
      onError: () => {
        setConfirmAction(null);
        showToast(text.actionFailed, { tone: "error" });
      },
    });
  };

  return (
    <div className="flex flex-col gap-1">
      <ActionMenu items={items} label={text.actions} align="right" />
      <ClassStatusConfirmDialogs
        studentClassName={studentClass.name}
        studentCount={studentCount}
        classLabel={classLabel}
        action={confirmAction}
        isConfirming={pending}
        onConfirm={handleConfirm}
        onClose={() => setConfirmAction(null)}
      />
      {assignOpen && (
        <ImportOrAssignModal
          open
          onClose={() => setAssignOpen(false)}
          organizationPublicId={organizationPublicId}
          programPublicId={programPublicId}
          classPublicId={studentClass.publicId}
        />
      )}
    </div>
  );
};
