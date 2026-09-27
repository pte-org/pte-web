"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@pte/ui";
import { DashboardChrome } from "@/features/auth/components";
import { HOST_ROLES } from "@/features/auth/constants";
import { ClassesListView } from "@/features/classes/components";
import { CreateClassModal } from "@/features/classes/components/CreateClassModal";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { useOrgLabels } from "@/features/orgLabels/useOrgLabels";
import { buildHostNav } from "@/lib/navigation";
import { useMyOrganizations, usePrograms } from "@/features/programs/api";
import { useCreateClass } from "@/features/classes/api";
import { CLASSES_LIST_TEXT } from "@/features/classes/constants";

export default function ClassesPage() {
  const labels = useOrgLabels();
  const { data: organizations } = useMyOrganizations();

  const [selectedOrganizationPublicId, setOrganizationPublicId] = useState("");
  const organizationPublicId = selectedOrganizationPublicId || organizations?.[0]?.publicId || "";

  const { data: programs } = usePrograms(organizationPublicId);

  const [selectedProgramPublicId, setSelectedProgramPublicId] = useState("");
  const create = useCreateClass(organizationPublicId, selectedProgramPublicId);
  const [createOpen, setCreateOpen] = useState(false);

  const programOptions = useMemo(
    () =>
      (programs ?? [])
        .map((program) => ({ value: program.publicId, label: program.name }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [programs],
  );

  // Reset picked-program when the user switches organization, so the picker
  // never points at a program that belongs to the previous org.
  const onOrgChange = (nextOrg: string): void => {
    setOrganizationPublicId(nextOrg);
    setSelectedProgramPublicId("");
    create.reset();
  };

  const onConfirmCreate = (name: string): void => {
    if (!selectedProgramPublicId) return;
    create.mutate(
      { name },
      {
        onSuccess: () => {
          setCreateOpen(false);
          setSelectedProgramPublicId("");
        },
      },
    );
  };

  return (
    <DashboardChrome navItems={buildHostNav(labels)} allowedRoles={HOST_ROLES}>
      <div className="flex flex-col gap-5">
        <PageHeader
          title={labels.class}
          actions={
            <button
              type="button"
              onClick={() => {
                create.reset();
                setCreateOpen(true);
              }}
              disabled={programOptions.length === 0}
              className="rounded-md bg-action px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-action/25 hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {CLASSES_LIST_TEXT.createClassButton}
            </button>
          }
        />

        <ClassesListView
          organizationOptions={(organizations ?? []).map((organization) => ({
            value: organization.publicId,
            label: organization.name,
          }))}
          selectedOrganizationPublicId={organizationPublicId}
          onOrganizationChange={onOrgChange}
        />

        <CreateClassModal
          key={createOpen ? "createClass-open" : "createClass-closed"}
          open={createOpen}
          onClose={() => {
            create.reset();
            setCreateOpen(false);
          }}
          onSubmit={onConfirmCreate}
          error={errorMessage(create.error)}
          isSubmitting={create.isPending}
          classLabel={labels.class}
          programs={programOptions}
          programLabel={CLASSES_LIST_TEXT.createClassPickerLabel(labels.program)}
          selectedProgramPublicId={selectedProgramPublicId}
          onProgramChange={setSelectedProgramPublicId}
        />
      </div>
    </DashboardChrome>
  );
}
