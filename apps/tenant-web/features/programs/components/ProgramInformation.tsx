"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import {
  ActionMenu,
  Badge,
  Button,
  CopyableId,
  DateInput,
  DescriptionList,
  Input,
  ProfileAccountPanel,
  Textarea,
  useToast,
  type BadgeVariant,
} from "@pte/ui";
import type { ProgramResponse, UpdateProgramRequest } from "@pte/api-client";
import { PROGRAM_STATUS_VARIANT } from "../constants";
import { useUpdateProgram } from "../api";
import { useProgramDetailText } from "../hooks/useProgramDetailText";

type ProgramCommand = "activate" | "suspend" | "archive";
type ProgramFormValues = {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
};

interface ProgramInformationProps {
  organizationPublicId: string;
  program: ProgramResponse;
  dashboardAvailable: boolean;
  pending: boolean;
  onCommand: (command: ProgramCommand) => void;
}

interface ProgramEditFormProps {
  form: ProgramFormValues;
  programId: string;
  nameError?: string;
  dateError?: string;
  pending: boolean;
  text: ReturnType<typeof useProgramDetailText>;
  statusLabel: string;
  statusVariant: BadgeVariant;
  onChange: (field: keyof ProgramFormValues, value: string) => void;
  onCancel: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

const formFromProgram = (program: ProgramResponse): ProgramFormValues => ({
  name: program.name,
  description: program.description ?? "",
  startDate: program.startDate?.slice(0, 10) ?? "",
  endDate: program.endDate?.slice(0, 10) ?? "",
});

const formatDate = (value: string | null, locale: string, empty: string): string =>
  value
    ? new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(`${value.slice(0, 10)}T00:00:00`))
    : empty;

const ProgramEditForm = ({
  form,
  programId,
  nameError,
  dateError,
  pending,
  text,
  statusLabel,
  statusVariant,
  onChange,
  onCancel,
  onSubmit,
}: ProgramEditFormProps): ReactElement => (
  <form className="flex flex-col gap-5" onSubmit={onSubmit} noValidate>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Input
        label={text.name}
        value={form.name}
        required
        error={nameError}
        onChange={(event) => onChange("name", event.target.value)}
        disabled={pending}
      />
      <Textarea
        label={text.description}
        value={form.description}
        onChange={(event) => onChange("description", event.target.value)}
        disabled={pending}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DateInput
          label={text.startDate}
          value={form.startDate}
          onChange={(event) => onChange("startDate", event.target.value)}
          disabled={pending}
        />
        <DateInput
          label={text.endDate}
          value={form.endDate}
          min={form.startDate || undefined}
          error={dateError}
          onChange={(event) => onChange("endDate", event.target.value)}
          disabled={pending}
        />
      </div>
    </div>
    <DescriptionList
      variant="inline"
      items={[
        {
          label: text.status,
          value: <Badge variant={statusVariant}>{statusLabel}</Badge>,
        },
        { label: text.id, value: <CopyableId value={programId} /> },
      ]}
    />
    <div className="flex flex-wrap justify-end gap-2">
      <Button variant="secondary" onClick={onCancel} disabled={pending}>
        {text.cancel}
      </Button>
      <Button type="submit" isPending={pending}>
        {text.save}
      </Button>
    </div>
  </form>
);

export const ProgramInformation = ({
  organizationPublicId,
  program,
  dashboardAvailable,
  pending,
  onCommand,
}: ProgramInformationProps): ReactElement => {
  const text = useProgramDetailText();
  const { showToast } = useToast();
  const update = useUpdateProgram(organizationPublicId, program.publicId);
  const [editing, setEditing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<ProgramFormValues>(() => formFromProgram(program));
  const statusLabels = {
    ACTIVE: text.active,
    INACTIVE: text.inactive,
    SUSPENDED: text.suspended,
  };
  const nameError = submitted && !form.name.trim() ? text.nameRequired : undefined;
  const dateError =
    form.startDate && form.endDate && form.endDate < form.startDate ? text.dateOrder : undefined;

  const startEditing = (): void => {
    setForm(formFromProgram(program));
    setSubmitted(false);
    setEditing(true);
  };
  const cancelEditing = (): void => {
    setSubmitted(false);
    setEditing(false);
  };
  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setSubmitted(true);
    if (!form.name.trim() || dateError) return;
    const payload: UpdateProgramRequest = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
    };
    update.mutate(payload, {
      onSuccess: () => {
        setEditing(false);
        setSubmitted(false);
        showToast(text.saved, { tone: "success" });
      },
      onError: () => showToast(text.failed, { tone: "error" }),
    });
  };

  return (
    <ProfileAccountPanel
      title={text.information}
      actions={
        !editing ? (
          <ActionMenu
            label={text.actions}
            items={[
              { label: text.edit, disabled: pending, onSelect: startEditing },
              { separator: true },
              {
                label: program.status === "ACTIVE" ? text.suspend : text.activate,
                danger: program.status === "ACTIVE",
                disabled: pending,
                onSelect: () => onCommand(program.status === "ACTIVE" ? "suspend" : "activate"),
              },
              { separator: true },
              {
                label: text.archive,
                danger: true,
                disabled: pending || !dashboardAvailable,
                onSelect: () => onCommand("archive"),
              },
            ]}
          />
        ) : undefined
      }
    >
      {editing ? (
        <ProgramEditForm
          form={form}
          programId={program.publicId}
          nameError={nameError}
          dateError={dateError}
          pending={update.isPending}
          text={text}
          statusLabel={statusLabels[program.status]}
          statusVariant={PROGRAM_STATUS_VARIANT[program.status]}
          onChange={(field, value) => setForm((current) => ({ ...current, [field]: value }))}
          onCancel={cancelEditing}
          onSubmit={submit}
        />
      ) : (
        <DescriptionList
          variant="inline"
          items={[
            {
              label: text.status,
              value: (
                <Badge variant={PROGRAM_STATUS_VARIANT[program.status]}>
                  {statusLabels[program.status]}
                </Badge>
              ),
            },
            { label: text.name, value: program.name },
            {
              label: text.startDate,
              value: formatDate(program.startDate, text.locale, text.empty),
            },
            { label: text.endDate, value: formatDate(program.endDate, text.locale, text.empty) },
            {
              label: text.description,
              value: program.description?.trim() || text.empty,
              fullWidth: true,
            },
            { label: text.id, value: <CopyableId value={program.publicId} />, fullWidth: true },
          ]}
        />
      )}
    </ProfileAccountPanel>
  );
};
