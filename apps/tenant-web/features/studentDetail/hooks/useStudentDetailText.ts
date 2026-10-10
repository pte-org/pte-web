"use client";

import { useMemo } from "react";
import type { StudentAttemptStatus, StudentHistoryReportState } from "@pte/api-client";
import { useLocale, type Locale } from "@pte/ui";
import { STUDENT_DETAIL_TEXT, STUDENT_HISTORY_STATUS_VALUES } from "../constants";

type Translate = (
  key: string,
  fallback?: string,
  values?: Record<string, string | number>,
) => string;

export interface StudentDetailText {
  locale: Locale;
  backToStudents: string;
  profileLoadFailed: string;
  genericError: string;
  emptyValue: string;
  studentCodeMissing: string;
  status: {
    active: string;
    suspended: string;
  };
  tabs: {
    account: string;
    overview: string;
    history: string;
    ariaLabel: string;
  };
  actions: {
    menuLabel: string;
    generatePassword: string;
    reactivate: string;
    suspend: string;
  };
  suspendDialog: {
    title: string;
    description: (name: string) => string;
    confirm: string;
    cancel: string;
  };
  account: {
    title: string;
    subtitle: string;
    edit: string;
    save: string;
    saved: string;
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    username: string;
    studentCode: string;
    roles: string;
    status: string;
    className: string;
    programName: string;
    passwordChange: string;
    required: string;
    notRequired: string;
    noClass: string;
    noProgram: string;
  };
  overview: {
    attemptCount: string;
    averageOverall: string;
    averageFromPublished: string;
    averageInsufficient: string;
    latestAttempt: string;
    skillTitle: string;
    skillDescription: string;
    insufficientData: string;
    noScoredAttempt: string;
    progressLabel: (skill: string) => string;
    reportCount: (count: number) => string;
  };
  history: {
    from: string;
    to: string;
    status: string;
    statusOptions: readonly { value: StudentAttemptStatus | "ALL"; label: string }[];
    session: string;
    attempt: string;
    report: string;
    time: string;
    attemptStatusLabel: (status: StudentAttemptStatus) => string;
    reportStateLabel: (state: StudentHistoryReportState) => string;
    published: string;
    unpublished: string;
    legacy: string;
    unavailable: string;
    overallScore: (score: number) => string;
    emptyTitle: string;
    emptyDescription: string;
  };
  skillLabel: (skill: string) => string;
}

const translate = (t: Translate, key: string, fallback: string): string => t(key, fallback);

const buildText = (t: Translate, locale: Locale): StudentDetailText => {
  const text = STUDENT_DETAIL_TEXT;
  const statusLabels = {
    active: translate(t, "tenant.studentDetail.active", text.status.active),
    suspended: translate(t, "tenant.studentDetail.suspended", text.status.suspended),
  };
  const submitted = translate(t, "tenant.studentDetail.history.submitted", text.history.submitted);
  const inProgress = translate(
    t,
    "tenant.studentDetail.history.inProgress",
    text.history.inProgress,
  );
  const created = translate(t, "tenant.studentDetail.history.created", text.history.created);

  return {
    locale,
    backToStudents: translate(t, "tenant.studentDetail.backToStudents", text.backToStudents),
    profileLoadFailed: translate(
      t,
      "tenant.studentDetail.profileLoadFailed",
      text.profileLoadFailed,
    ),
    genericError: translate(t, "tenant.studentDetail.genericError", text.genericError),
    emptyValue: translate(t, "common.emptyValue", text.emptyValue),
    studentCodeMissing: translate(
      t,
      "tenant.studentDetail.studentCodeMissing",
      text.studentCodeMissing,
    ),
    status: statusLabels,
    tabs: {
      account: translate(t, "tenant.studentDetail.tabs.account", text.tabs.account),
      overview: translate(t, "tenant.studentDetail.tabs.overview", text.tabs.overview),
      history: translate(t, "tenant.studentDetail.tabs.history", text.tabs.history),
      ariaLabel: translate(t, "tenant.studentDetail.tabs.ariaLabel", text.tabs.ariaLabel),
    },
    actions: {
      menuLabel: translate(t, "tenant.studentDetail.actions.menuLabel", text.actions.menuLabel),
      generatePassword: translate(
        t,
        "tenant.studentDetail.actions.generatePassword",
        text.actions.generatePassword,
      ),
      reactivate: translate(t, "tenant.studentDetail.actions.reactivate", text.actions.reactivate),
      suspend: translate(t, "tenant.studentDetail.actions.suspend", text.actions.suspend),
    },
    suspendDialog: {
      title: translate(t, "tenant.studentDetail.suspend.title", text.suspendDialog.title),
      description: (name) =>
        t("tenant.studentDetail.suspend.description", text.suspendDialog.description(name), {
          name,
        }),
      confirm: translate(t, "tenant.studentDetail.suspend.confirm", text.suspendDialog.confirm),
      cancel: translate(t, "tenant.studentDetail.suspend.cancel", text.suspendDialog.cancel),
    },
    account: {
      title: translate(t, "tenant.studentDetail.account.title", text.account.title),
      subtitle: translate(t, "tenant.studentDetail.account.subtitle", text.account.subtitle),
      edit: translate(t, "tenant.studentDetail.account.edit", text.account.edit),
      save: translate(t, "tenant.studentDetail.account.save", text.account.save),
      saved: translate(t, "tenant.studentDetail.account.saved", text.account.saved),
      fullName: translate(t, "tenant.students.fullName", text.account.fullName),
      email: translate(t, "tenant.students.email", text.account.email),
      phone: translate(t, "tenant.students.phone", text.account.phone),
      dateOfBirth: translate(
        t,
        "tenant.studentDetail.account.dateOfBirth",
        text.account.dateOfBirth,
      ),
      username: translate(t, "tenant.studentDetail.account.username", text.account.username),
      studentCode: translate(t, "tenant.students.studentCode", text.account.studentCode),
      roles: translate(t, "tenant.studentDetail.account.roles", text.account.roles),
      status: translate(t, "tenant.students.status", text.account.status),
      className: translate(t, "tenant.students.class", text.account.className),
      programName: translate(t, "tenant.students.program", text.account.programName),
      passwordChange: translate(
        t,
        "tenant.studentDetail.account.passwordChange",
        text.account.passwordChange,
      ),
      required: translate(t, "tenant.studentDetail.account.required", text.account.required),
      notRequired: translate(
        t,
        "tenant.studentDetail.account.notRequired",
        text.account.notRequired,
      ),
      noClass: translate(t, "tenant.studentDetail.account.noClass", text.account.noClass),
      noProgram: translate(t, "tenant.studentDetail.account.noProgram", text.account.noProgram),
    },
    overview: {
      attemptCount: translate(
        t,
        "tenant.studentDetail.overview.attemptCount",
        text.overview.attemptCount,
      ),
      averageOverall: translate(
        t,
        "tenant.studentDetail.overview.averageOverall",
        text.overview.averageOverall,
      ),
      averageFromPublished: translate(
        t,
        "tenant.studentDetail.overview.averageFromPublished",
        text.overview.averageFromPublished,
      ),
      averageInsufficient: translate(
        t,
        "tenant.studentDetail.overview.averageInsufficient",
        text.overview.averageInsufficient,
      ),
      latestAttempt: translate(
        t,
        "tenant.studentDetail.overview.latestAttempt",
        text.overview.latestAttempt,
      ),
      skillTitle: translate(
        t,
        "tenant.studentDetail.overview.skillTitle",
        text.overview.skillTitle,
      ),
      skillDescription: translate(
        t,
        "tenant.studentDetail.overview.skillDescription",
        text.overview.skillDescription,
      ),
      insufficientData: translate(
        t,
        "tenant.studentDetail.overview.insufficientData",
        text.overview.insufficientData,
      ),
      noScoredAttempt: translate(
        t,
        "tenant.studentDetail.overview.noScoredAttempt",
        text.overview.noScoredAttempt,
      ),
      progressLabel: (skill) =>
        t("tenant.studentDetail.overview.progressLabel", text.overview.progressLabel(skill), {
          skill,
        }),
      reportCount: (count) =>
        t("tenant.studentDetail.overview.reportCount", text.overview.reportCount(count), { count }),
    },
    history: {
      from: translate(t, "tenant.studentDetail.history.from", text.history.from),
      to: translate(t, "tenant.studentDetail.history.to", text.history.to),
      status: translate(t, "tenant.studentDetail.history.status", text.history.status),
      statusOptions: STUDENT_HISTORY_STATUS_VALUES.map((value) => ({
        value,
        label:
          value === "ALL"
            ? translate(t, "tenant.studentDetail.history.allStatuses", text.history.allStatuses)
            : value === "SUBMITTED"
              ? submitted
              : value === "IN_PROGRESS"
                ? inProgress
                : created,
      })),
      session: translate(t, "tenant.studentDetail.history.session", text.history.session),
      attempt: translate(t, "tenant.studentDetail.history.attempt", text.history.attempt),
      report: translate(t, "tenant.studentDetail.history.report", text.history.report),
      time: translate(t, "tenant.studentDetail.history.time", text.history.time),
      attemptStatusLabel: (status) =>
        status === "SUBMITTED" ? submitted : status === "IN_PROGRESS" ? inProgress : created,
      reportStateLabel: (state) =>
        state === "PUBLISHED"
          ? translate(t, "tenant.studentDetail.history.published", text.history.published)
          : state === "UNPUBLISHED"
            ? translate(t, "tenant.studentDetail.history.unpublished", text.history.unpublished)
            : state === "PUBLISHED_LEGACY"
              ? translate(t, "tenant.studentDetail.history.legacy", text.history.legacy)
              : translate(t, "tenant.studentDetail.history.unavailable", text.history.unavailable),
      published: translate(t, "tenant.studentDetail.history.published", text.history.published),
      unpublished: translate(
        t,
        "tenant.studentDetail.history.unpublished",
        text.history.unpublished,
      ),
      legacy: translate(t, "tenant.studentDetail.history.legacy", text.history.legacy),
      unavailable: translate(
        t,
        "tenant.studentDetail.history.unavailable",
        text.history.unavailable,
      ),
      overallScore: (score) =>
        t("tenant.studentDetail.history.overallScore", text.history.overallScore(score), { score }),
      emptyTitle: translate(t, "tenant.studentDetail.history.emptyTitle", text.history.emptyTitle),
      emptyDescription: translate(
        t,
        "tenant.studentDetail.history.emptyDescription",
        text.history.emptyDescription,
      ),
    },
    skillLabel: (skill) =>
      t(
        `tenant.studentDetail.skills.${skill}`,
        text.skills[skill as keyof typeof text.skills] ?? skill,
      ),
  };
};

export const useStudentDetailText = (): StudentDetailText => {
  const { locale, t } = useLocale();
  return useMemo(() => buildText(t, locale), [locale, t]);
};
