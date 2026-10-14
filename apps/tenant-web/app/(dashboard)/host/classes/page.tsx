"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@pte/ui";
import { ClassesListView } from "@/features/classes/components";
import { CreateClassModal } from "@/features/classes/components/CreateClassModal";
import { buildAssignStudentsUrl } from "@/features/classes/utils/assignStudentsUrl";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { useOrgLabels } from "@/features/orgLabels/useOrgLabels";
import { useMyOrganizations, usePrograms } from "@/features/programs/api";
import { useCreateClass } from "@/features/classes/api";

export default function ClassesPage() {
  const labels = useOrgLabels();
  const { t } = useLocale();
  const classLabel = t("nav.class", labels.class);
  const programLabel = t("nav.program", labels.program);
  const router = useRouter();
  const searchParams = useSearchParams();
  const linkedOrganization = searchParams.get("organizationPublicId") ?? "";
  const linkedProgram = searchParams.get("programPublicId") ?? "";
  const openCreateFromLink = searchParams.get("create") === "1";
  const { data: organizations } = useMyOrganizations();

  const [selectedOrganizationPublicId, setOrganizationPublicId] = useState("");
  const organizationPublicId =
    selectedOrganizationPublicId || linkedOrganization || organizations?.[0]?.publicId || "";

  const { data: programs } = usePrograms(organizationPublicId);

  const [selectedProgramPublicId, setSelectedProgramPublicId] = useState("");
  const create = useCreateClass(organizationPublicId, selectedProgramPublicId);
  const [createOpen, setCreateOpen] = useState(false);
  const autoOpenedCreate = useRef(false);

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
  const onRequestCreateClass = useCallback((programPublicId = ""): void => {
    setSelectedProgramPublicId(programPublicId);
    create.reset();
    setCreateOpen(true);
  }, [create]);

  useEffect(() => {
    if (
      autoOpenedCreate.current ||
      !openCreateFromLink ||
      !linkedProgram ||
      !programs?.some((program) => program.publicId === linkedProgram)
    ) {
      return;
    }
    autoOpenedCreate.current = true;
    onRequestCreateClass(linkedProgram);
  }, [linkedProgram, onRequestCreateClass, openCreateFromLink, programs]);

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
    <div className="flex flex-col gap-5">
      <ClassesListView
        key={`${organizationPublicId}-${linkedProgram}`}
        initialProgramPublicId={organizationPublicId === linkedOrganization ? linkedProgram : ""}
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
        classLabel={classLabel}
        programs={programOptions}
        programLabel={programLabel}
        selectedProgramPublicId={selectedProgramPublicId}
        onProgramChange={setSelectedProgramPublicId}
      />
    </div>
  );
}
