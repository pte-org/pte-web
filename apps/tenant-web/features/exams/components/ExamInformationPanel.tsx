"use client";

import type { ReactElement } from "react";
import {
  ActionMenu,
  Alert,
  Badge,
  CopyableId,
  DescriptionList,
  ProfileAccountPanel,
  useLocale,
  type DropdownItem,
} from "@pte/ui";
import {
  EXAM_EDITOR_TEXT,
  EXAM_MODE_LABELS,
  EXAM_SKILL_OPTIONS,
  SESSION_DETAIL_TEXT,
  SESSION_STATUS_VARIANT,
} from "../constants";
import type { ExamSession } from "../types";
import { ExamEditForm } from "./ExamEditForm";
import type { ExamOverviewLifecycle } from "./ExamOverviewTab";

interface ExamInformationPanelProps {
  session: ExamSession;
  lifecycle: ExamOverviewLifecycle;
  editing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSaved: () => void;
}

const formatDateTime = (value: string, locale: "vi" | "en"): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export const ExamInformationPanel = ({
  session,
  lifecycle,
  editing,
  onEdit,
  onCancelEdit,
  onSaved,
}: ExamInformationPanelProps): ReactElement => {
  const { locale, t } = useLocale();
  const isEditable =
    session.status === "DRAFT" || session.status === "SCHEDULED" || session.status === "OPEN";
  const statusLabel = t(`tenant.examStatus.${session.status.toLowerCase()}`, session.status);
  const modeLabel = session.examMode
    ? t("tenant.createExam.MODE_REAL", EXAM_MODE_LABELS[session.examMode])
    : t("tenant.examDetails.legacyMode", SESSION_DETAIL_TEXT.LEGACY_MODE);
  const skillsLabel =
    session.selectedSkills.length > 0
      ? session.selectedSkills
          .map((skill) => {
            const fallback =
              EXAM_SKILL_OPTIONS.find((option) => option.value === skill)?.label ?? skill;
            return t(`tenant.createExam.skill.${skill}`, fallback);
          })
          .join(", ")
      : t("tenant.examDetails.legacySkills", SESSION_DETAIL_TEXT.LEGACY_SKILLS);
  const actionItems: DropdownItem[] = [];

  if (isEditable) {
    actionItems.push({
      label: t("tenant.examDetails.edit", EXAM_EDITOR_TEXT.EDIT),
      disabled: editing,
      onSelect: onEdit,
    });
  }
  if (lifecycle.canOpen || lifecycle.canClose || lifecycle.canCancel) {
    if (actionItems.length > 0) actionItems.push({ separator: true });
    if (lifecycle.canOpen) {
      actionItems.push({
        label: t("tenant.examOverview.open", SESSION_DETAIL_TEXT.OPEN_EXAM),
        disabled: lifecycle.openPending,
        onSelect: lifecycle.onOpen,
      });
    }
    if (lifecycle.canClose) {
      actionItems.push({
        label: t("tenant.examOverview.close", SESSION_DETAIL_TEXT.CLOSE_EXAM),
        disabled: lifecycle.closePending,
        onSelect: lifecycle.onClose,
      });
    }
    if (lifecycle.canCancel) {
      actionItems.push({
        label: t("tenant.examOverview.cancel", SESSION_DETAIL_TEXT.CANCEL_EXAM),
        danger: true,
        disabled: lifecycle.cancelPending,
        onSelect: lifecycle.onCancel,
      });
    }
  }
  if (actionItems.length === 0) {
    actionItems.push({
      label: t("tenant.examDetails.noActions", EXAM_EDITOR_TEXT.NO_ACTIONS),
      disabled: true,
    });
  }

  const details = [
    { label: t("tenant.examDetails.name", EXAM_EDITOR_TEXT.NAME), value: session.name },
    {
      label: t("tenant.examDetails.status", EXAM_EDITOR_TEXT.STATUS),
      value: <Badge variant={SESSION_STATUS_VARIANT[session.status]}>{statusLabel}</Badge>,
    },
    {
      label: t("tenant.examDetails.code", EXAM_EDITOR_TEXT.CODE),
      value: <CopyableId value={session.sessionCode} />,
    },
    { label: t("tenant.examDetails.mode", SESSION_DETAIL_TEXT.MODE_LABEL), value: modeLabel },
    {
      label: t("tenant.examDetails.opensAt", EXAM_EDITOR_TEXT.OPENS_AT),
      value: formatDateTime(session.opensAt, locale),
    },
    {
      label: t("tenant.examDetails.closesAt", EXAM_EDITOR_TEXT.CLOSES_AT),
      value: formatDateTime(session.closesAt, locale),
    },
    {
      label: t("tenant.examDetails.skillsIncluded", SESSION_DETAIL_TEXT.SKILLS_LABEL),
      value: skillsLabel,
    },
    { label: t("tenant.examDetails.capacity", EXAM_EDITOR_TEXT.CAPACITY), value: session.capacity },
  ];

  return (
    <ProfileAccountPanel
      title={t("tenant.examDetails.informationTitle", EXAM_EDITOR_TEXT.INFORMATION_TITLE)}
      description={t(
        "tenant.examDetails.informationDescription",
        EXAM_EDITOR_TEXT.INFORMATION_DESCRIPTION,
      )}
      actions={
        !editing && (
          <ActionMenu
            label={t("tenant.examDetails.actions", EXAM_EDITOR_TEXT.ACTIONS)}
            items={actionItems}
          />
        )
      }
    >
      {lifecycle.lifecycleError && <Alert tone="error">{lifecycle.lifecycleError}</Alert>}
      {editing ? (
        <>
          <ExamEditForm
            key={`${session.id}-${session.status}-editing`}
            session={session}
            onCancel={onCancelEdit}
            onSaved={onSaved}
          />
        </>
      ) : (
        <>
          <DescriptionList variant="inline" items={details} />
          {!isEditable && (
            <Alert tone="info">
              {t("tenant.examDetails.readOnlyHelp", EXAM_EDITOR_TEXT.READ_ONLY_HELP)}
            </Alert>
          )}
        </>
      )}
    </ProfileAccountPanel>
  );
};
