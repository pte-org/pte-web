"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Select, LoadingState, Modal } from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { TRANSFER_STUDENT_TEXT } from "../constants";
import { useAllTenantClasses, useStudentEnrollments, useTransferStudent } from "../api";

interface TransferStudentModalProps {
  open: boolean;
  onClose: () => void;
  organizationPublicId: string;
  programPublicId: string;
  classPublicId: string;
  classLabel: string;
  membershipPublicId: string;
  studentPublicId: string;
}

const T = TRANSFER_STUDENT_TEXT;
const FORM_ID = "transfer-student-form";

function isPendingEnrollment(status: string, opensAt: string): boolean {
  return status !== "CLOSED" && new Date(opensAt).getTime() > Date.now();
}

export const TransferStudentModal = ({
  open,
  onClose,
  organizationPublicId,
  programPublicId,
  classPublicId,
  classLabel,
  membershipPublicId,
  studentPublicId,
}: TransferStudentModalProps): ReactElement => {
  const [targetClassPublicId, setTargetClassPublicId] = useState("");
  const { data: classes, isLoading: classesLoading } = useAllTenantClasses();
  const { data: enrollments, isLoading: enrollmentsLoading } = useStudentEnrollments(studentPublicId);
  const transfer = useTransferStudent(organizationPublicId, programPublicId, classPublicId);

  const targetOptions = (classes ?? [])
    .filter((option) => option.classPublicId !== classPublicId)
    .map((option) => ({
      label: `${option.className} (${option.programName})`,
      value: option.classPublicId,
    }));

  const pendingEnrollments = (enrollments ?? []).filter((enrollment) =>
    isPendingEnrollment(enrollment.status, enrollment.opensAt),
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!targetClassPublicId) return;
    transfer.mutate({ membershipPublicId, targetClassPublicId }, { onSuccess: onClose });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={T.title(classLabel)}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {T.cancel}
          </button>
          <button
            type="submit"
            form={FORM_ID}
            disabled={!targetClassPublicId || transfer.isPending}
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {transfer.isPending ? T.submitting : T.submit}
          </button>
        </>
      }
    >
      {!!transfer.error && (
        <div className="mb-4">
          <Alert tone="error">{errorMessage(transfer.error)}</Alert>
        </div>
      )}

      {enrollmentsLoading ? (
        <LoadingState rows={1} />
      ) : (
        pendingEnrollments.length > 0 && (
          <div className="mb-4">
            <Alert tone="warning" title={T.pendingEnrollmentTitle}>
              <p className="mb-2">{T.pendingEnrollmentText}</p>
              <ul className="list-inside list-disc">
                {pendingEnrollments.map((enrollment) => (
                  <li key={enrollment.enrollmentPublicId}>{enrollment.sessionName}</li>
                ))}
              </ul>
            </Alert>
          </div>
        )
      )}

      <form id={FORM_ID} onSubmit={handleSubmit} noValidate>
        <Select
          label={T.targetLabel}
          placeholder={T.targetPlaceholder}
          value={targetClassPublicId}
          disabled={classesLoading}
          onChange={(event) => setTargetClassPublicId(event.target.value)}
          options={targetOptions}
        />
      </form>
    </Modal>
  );
};
