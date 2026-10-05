"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@pte/ui";
import { DashboardChrome } from "@/features/auth/components";
import { HOST_ROLES } from "@/features/auth/constants";
import { ClassesListView } from "@/features/classes/components";
import { CreateClassModal } from "@/features/classes/components/CreateClassModal";
import { buildAssignStudentsUrl } from "@/features/classes/utils/assignStudentsUrl";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { useOrgLabels } from "@/features/orgLabels/useOrgLabels";
import { buildHostNav } from "@/lib/navigation";
import { useMyOrganizations, usePrograms } from "@/features/programs/api";
import { useCreateClass } from "@/features/classes/api";
import { CLASSES_LIST_TEXT } from "@/features/classes/constants";

export default function ClassesPage() {
  const labels = useOrgLabels();
  const router = useRouter();
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

  // Called from the per-program "+ Add Class" rows in the empty state, and
  // also reusable for any future entry point. Pre-fills the modal picker
  // and opens it; the user can still change program before submitting.
  const onRequestCreateClass = (programPublicId: string): void => {
    setSelectedProgramPublicId(programPublicId);
    create.reset();
    setCreateOpen(true);
  };

  // Navigate to the Students page with the row's class pre-filled.
  // The Students page reads the query params, prefills Program + Class
  // filters, and auto-opens the Add Individually modal.
  const onRequestAssignStudents = (input: {
    organizationPublicId: string;
    programPublicId: string;
    classPublicId: string;
  }): void => {
    router.push(buildAssignStudentsUrl("/host/students", input));
  };

  const onConfirmCreate = (name: string): void => {
    // `CreateClassModal` already blocks submit with a field error when no
    // Program is picked, so reaching here without one means the picker was
    // bypassed. Keep the guard so we can never fire an un-scoped request.
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
              title={
                programOptions.length === 0
                  ? CLASSES_LIST_TEXT.createClassButtonTitle
                  : undefined
              }
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
          allPrograms={programOptions}
          onRequestCreateClass={onRequestCreateClass}
          onRequestAssignStudents={onRequestAssignStudents}
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
