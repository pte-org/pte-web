"use client";
import { useLocale } from "@pte/ui";
import { EXAM_STAFF_TEXT } from "../constants";

export interface ExamStaffListText {
  addButton: string;
  fullName: string;
  account: string;
  email: string;
  role: string;
  status: string;
  actions: string;
  allRoles: string;
  allStatuses: string;
  proctor: string;
  examiner: string;
  active: string;
  suspended: string;
  viewDetails: string;
  sendEmail: string;
  reactivate: string;
  suspend: string;
  emptyTitle: string;
  emptyDescription: string;
  syncing: string;
  confirmSuspendTitle: string;
  confirmSuspendDescription: (name: string) => string;
  confirm: string;
  cancel: string;
  sendEmailConfirmTitle: string;
  sendEmailConfirmDescription: (name: string) => string;
  sendEmailConfirm: string;
}

export const useExamStaffListText = (): ExamStaffListText => {
  const { t } = useLocale();
  return {
    addButton: t("tenant.examStaff.add", EXAM_STAFF_TEXT.addButton),
    fullName: t("tenant.examStaff.fullName", EXAM_STAFF_TEXT.fullName),
    account: t("tenant.examStaff.account", EXAM_STAFF_TEXT.account),
    email: t("tenant.examStaff.email", EXAM_STAFF_TEXT.email),
    role: t("tenant.examStaff.role", EXAM_STAFF_TEXT.role),
    status: t("tenant.examStaff.status", EXAM_STAFF_TEXT.status),
    actions: t("tenant.examStaff.actions", EXAM_STAFF_TEXT.actions),
    allRoles: t("tenant.examStaff.allRoles", EXAM_STAFF_TEXT.allRoles),
    allStatuses: t("tenant.examStaff.allStatuses", EXAM_STAFF_TEXT.allStatuses),
    proctor: t("tenant.examStaff.proctor", EXAM_STAFF_TEXT.proctor),
    examiner: t("tenant.examStaff.examiner", EXAM_STAFF_TEXT.examiner),
    active: t("tenant.examStaff.active", EXAM_STAFF_TEXT.active),
    suspended: t("tenant.examStaff.suspended", EXAM_STAFF_TEXT.suspended),
    viewDetails: t("tenant.examStaff.viewDetails", EXAM_STAFF_TEXT.viewDetails),
    sendEmail: t("tenant.examStaff.sendEmail", EXAM_STAFF_TEXT.sendEmail),
    reactivate: t("tenant.examStaff.reactivate", EXAM_STAFF_TEXT.reactivate),
    suspend: t("tenant.examStaff.suspend", EXAM_STAFF_TEXT.suspend),
    emptyTitle: t("tenant.examStaff.empty", EXAM_STAFF_TEXT.emptyTitle),
    emptyDescription: t("tenant.examStaff.emptyDescription", EXAM_STAFF_TEXT.emptyDescription),
    syncing: t("tenant.examStaff.syncing", EXAM_STAFF_TEXT.syncing),
    confirmSuspendTitle: t(
      "tenant.examStaff.confirmSuspendTitle",
      EXAM_STAFF_TEXT.confirmSuspendTitle,
    ),
    confirmSuspendDescription: (name: string) =>
      t(
        "tenant.examStaff.confirmSuspendDescription",
        EXAM_STAFF_TEXT.confirmSuspendDescription(name),
        { name },
      ),
    confirm: t("tenant.examStaff.confirmSuspend", EXAM_STAFF_TEXT.confirm),
    cancel: t("tenant.examStaff.cancel", EXAM_STAFF_TEXT.cancel),
    sendEmailConfirmTitle: t(
      "tenant.examStaff.sendEmailConfirmTitle",
      EXAM_STAFF_TEXT.sendEmailConfirmTitle,
    ),
    sendEmailConfirmDescription: (name: string) =>
      t(
        "tenant.examStaff.sendEmailConfirmDescription",
        EXAM_STAFF_TEXT.sendEmailConfirmDescription(name),
        { name },
      ),
    sendEmailConfirm: t("tenant.examStaff.sendEmailConfirm", EXAM_STAFF_TEXT.sendEmailConfirm),
  };

};
