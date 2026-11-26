"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Badge,
  Button,
  CopyableId,
  Input,
  UnsavedChangesGuard,
  useLeaveAfterSave,
  useLocale,
  useToast,
} from "@pte/ui";
import type { ClassResponse } from "@pte/api-client";
import { useUpdateClass } from "../api";
import { CLASS_STATUS_LABELS, CLASS_STATUS_VARIANT } from "../constants";
import { useClassActionText } from "../hooks/useClassActionText";
import { ClassRowActions } from "./ClassRowActions";

/** The label is the same in both languages. */
const ID_LABEL = "ID";

/** How much of the class ID the header shows; the copy button still copies all of it. */
const SHORT_ID_LENGTH = 8;

interface ClassHeaderProps {
  organizationPublicId: string;
  studentClass: ClassResponse;
  programName?: string;
  classLabel: string;
  studentCount: number;
  onAddStudents: () => void;
  onArchived: () => void;
}

/**
 * The top of a class page: its name and status, the main action (add students), the other actions in a menu, and
 * one line of program, student count and ID. The name is renamed in place; nothing else about a class is edited.
 */
export const ClassHeader = ({
  organizationPublicId,
  studentClass,
  programName,
  classLabel,
  studentCount,
  onAddStudents,
  onArchived,
}: ClassHeaderProps): ReactElement => {
  const text = useClassActionText();
  const { t } = useLocale();
  const { showToast } = useToast();
  const router = useRouter();
  const leaveAfterSave = useLeaveAfterSave();
  const update = useUpdateClass(organizationPublicId, studentClass.programPublicId, studentClass.publicId);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(studentClass.name);
  const [nameError, setNameError] = useState<string>();

  const startEditing = (): void => {
    setName(studentClass.name);
    setNameError(undefined);
    setEditing(true);
  };
  const cancelEditing = (): void => {
    setNameError(undefined);
    setEditing(false);
  };
  const save = (): void => {
    if (!name.trim()) {
      setNameError(text.format("nameRequired", { label: classLabel.toLowerCase() }));
      return;
    }
    update.mutate(
      { name: name.trim() },
      {
        onSuccess: () => {
          setEditing(false);
          showToast(text.saved, { tone: "success" });
          leaveAfterSave.settle();
        },
        onError: () => showToast(text.saveFailed, { tone: "error" }),
      },
    );
  };

  const statusLabel = t(
    `tenant.classes.${studentClass.status.toLowerCase()}`,
    CLASS_STATUS_LABELS[studentClass.status],
  );

  return (
    <header className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          {editing ? (
            <Input
              aria-label={text.className}
              value={name}
              error={nameError}
              disabled={update.isPending}
              autoFocus
              className="min-w-64"
              onChange={(event) => {
                setName(event.target.value);
                setNameError(undefined);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") save();
                if (event.key === "Escape") cancelEditing();
              }}
            />
          ) : (
            <h1 className="min-w-0 truncate text-2xl font-medium tracking-[-0.02em] text-[var(--ink-primary)]">
              {studentClass.name}
            </h1>
          )}
          <Badge variant={CLASS_STATUS_VARIANT[studentClass.status]}>{statusLabel}</Badge>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button variant="secondary" onClick={cancelEditing} disabled={update.isPending}>
                {text.cancel}
              </Button>
              <Button onClick={save} isPending={update.isPending}>
                {text.save}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={onAddStudents}>+ {text.addStudents}</Button>
              <ClassRowActions
                organizationPublicId={organizationPublicId}
                programPublicId={studentClass.programPublicId}
                studentCount={studentCount}
                classLabel={classLabel}
                studentClass={studentClass}
                onEdit={startEditing}
                showViewDetails={false}
                showAssignStudents={false}
                onArchived={onArchived}
              />
            </>
          )}
        </div>
      </div>
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--ink-muted)]">
        <span>
          {text.program}:{" "}
          <Link
            href={`/host/programs/${studentClass.programPublicId}?organizationPublicId=${organizationPublicId}`}
            className="text-[var(--ink-secondary)] hover:text-[var(--action)] hover:underline"
          >
            {programName ?? studentClass.programPublicId}
          </Link>
        </span>
        <span aria-hidden="true">·</span>
        <span>{text.format("studentCount", { count: studentCount })}</span>
        <span aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1">
          {ID_LABEL}: <CopyableId value={studentClass.publicId} truncateTo={SHORT_ID_LENGTH} />
        </span>
      </p>
      <UnsavedChangesGuard
        isDirty={editing && name !== studentClass.name}
        onSaveAndLeave={(proceed) => leaveAfterSave.request(proceed, save)}
        isSaving={update.isPending}
        onNavigate={(href) => router.push(href)}
      />
    </header>
  );
};
