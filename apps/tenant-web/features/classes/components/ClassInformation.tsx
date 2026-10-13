"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  CopyableId,
  DescriptionList,
  Input,
  ProfileAccountPanel,
  useLocale,
  useToast,
} from "@pte/ui";
import type { ClassResponse } from "@pte/api-client";
import { useUpdateClass } from "../api";
import { CLASS_STATUS_VARIANT, CLASS_STATUS_LABELS } from "../constants";
import { useClassActionText } from "../hooks/useClassActionText";
import { ClassRowActions } from "./ClassRowActions";

interface ClassInformationProps {
  organizationPublicId: string;
  studentClass: ClassResponse;
  programName?: string;
  classLabel: string;
  studentCount: number;
  onArchived: () => void;
}

export const ClassInformation = ({
  organizationPublicId,
  studentClass,
  programName,
  classLabel,
  studentCount,
  onArchived,
}: ClassInformationProps) => {
  const text = useClassActionText();
  const { t } = useLocale();
  const { showToast } = useToast();
  const update = useUpdateClass(
    organizationPublicId,
    studentClass.programPublicId,
    studentClass.publicId,
  );
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
        },
        onError: () => showToast(text.saveFailed, { tone: "error" }),
      },
    );
  };
  return (
    <ProfileAccountPanel
      title={text.information}
      actions={
        !editing ? (
          <ClassRowActions
            organizationPublicId={organizationPublicId}
            programPublicId={studentClass.programPublicId}
            studentCount={studentCount}
            classLabel={classLabel}
            studentClass={studentClass}
            onEdit={startEditing}
            showViewDetails={false}
            onArchived={onArchived}
          />
        ) : undefined
      }
    >
      {editing ? (
        <div className="flex flex-col gap-5">
          <Input
            label={text.className}
            value={name}
            error={nameError}
            disabled={update.isPending}
            onChange={(event) => {
              setName(event.target.value);
              setNameError(undefined);
            }}
          />
          <DescriptionList
            variant="inline"
            items={[
              { label: text.program, value: programName ?? studentClass.programPublicId },
              {
                label: text.status,
                value: (
                  <Badge variant={CLASS_STATUS_VARIANT[studentClass.status]}>
                    {t(
                      `tenant.classes.${studentClass.status.toLowerCase()}`,
                      CLASS_STATUS_LABELS[studentClass.status],
                    )}
                  </Badge>
                ),
              },
              { label: text.id, value: <CopyableId value={studentClass.publicId} /> },
            ]}
          />
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" onClick={cancelEditing} disabled={update.isPending}>
              {text.cancel}
            </Button>
            <Button onClick={save} isPending={update.isPending}>
              {text.save}
            </Button>
          </div>
        </div>
      ) : (
        <DescriptionList
          variant="inline"
          items={[
            { label: text.className, value: studentClass.name },
            { label: text.program, value: programName ?? studentClass.programPublicId },
            {
              label: text.status,
              value: (
                <Badge variant={CLASS_STATUS_VARIANT[studentClass.status]}>
                  {t(
                    `tenant.classes.${studentClass.status.toLowerCase()}`,
                    CLASS_STATUS_LABELS[studentClass.status],
                  )}
                </Badge>
              ),
            },
            { label: text.id, value: <CopyableId value={studentClass.publicId} /> },
          ]}
        />
      )}
    </ProfileAccountPanel>
  );
};
