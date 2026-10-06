"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Select, LoadingState, Modal, isTypedConfirmValid } from "@pte/ui";
import { errorMessage } from "@/features/examoperations/errorMessage";
import { CLASS_STATUS_LABELS, TRANSFER_STUDENT_TEXT } from "../constants";
import { useAllTenantClasses, useStudentEnrollments, useTransferStudent } from "../api";
import { isNonActiveClass } from "../utils/nonActiveTarget";
import { NonActiveTargetConfirm } from "./NonActiveTargetConfirm";

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
  const [typedConfirm, setTypedConfirm] = useState("");
  const { data: classes, isLoading: classesLoading } = useAllTenantClasses();
  const { data: enrollments, isLoading: enrollmentsLoading } =
    useStudentEnrollments(studentPublicId);
  const transfer = useTransferStudent(organizationPublicId, programPublicId, classPublicId);

  const targetOptions = (classes ?? [])
    .filter((option) => option.classPublicId !== classPublicId)
    .map((option) => ({
      // Non-ACTIVE targets are annotated inline so the Host sees the state before picking.
      label: isNonActiveClass(option.status)
        ? `${option.className} (${option.programName}) — ${CLASS_STATUS_LABELS[option.status]}`
        : `${option.className} (${option.programName})`,
      value: option.classPublicId,
    }));

  const selectedTarget = (classes ?? []).find(
    (option) => option.classPublicId === targetClassPublicId,
  );
  const targetIsNonActive = selectedTarget !== undefined && isNonActiveClass(selectedTarget.status);
  // Switching target invalidates any previously typed confirmation.
  const handleTargetChange = (nextPublicId: string): void => {
    setTargetClassPublicId(nextPublicId);
    setTypedConfirm("");
  };
  const typedConfirmSatisfied =
    !targetIsNonActive || isTypedConfirmValid(typedConfirm, selectedTarget?.className ?? "");

  const pendingEnrollments = (enrollments ?? []).filter((enrollment) =>
    isPendingEnrollment(enrollment.status, enrollment.opensAt),
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!targetClassPublicId || !typedConfirmSatisfied) return;
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
            disabled={!targetClassPublicId || !typedConfirmSatisfied || transfer.isPending}
            className="rounded-lg bg-action px-4 py-2 text-sm font-semibold text-white hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-60"
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
          onChange={(event) => handleTargetChange(event.target.value)}
          options={targetOptions}
        />
        {targetIsNonActive && selectedTarget && (
          <NonActiveTargetConfirm
            targetName={selectedTarget.className}
            typed={typedConfirm}
            onTypedChange={setTypedConfirm}
          />
        )}
      </form>
    </Modal>
  );
};
