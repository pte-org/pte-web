"use client";

import { useMemo } from "react";
import { useLocale, type Locale } from "@pte/ui";
import type { AttendanceStatus } from "@pte/api-client";
import { ATTENDANCE_EN, type AttendanceMessageKey, type AttendanceMessages } from "../messages/attendanceEn";
import { ATTENDANCE_VI } from "../messages/attendanceVi";

export interface AttendanceText extends AttendanceMessages {
  locale: Locale;
  statusLabel: (status: AttendanceStatus | null | undefined) => string;
  activityLabel: (status: string) => string;
  roleLabel: (role: string) => string;
  formatDateTime: (value: string | Date) => string;
  formatTime: (value: string | Date) => string;
  formatDate: (value: string | Date) => string;
}

/** Same date order as the Examiner screens: day first in both languages, 24-hour clock. */
const dateLocaleOf = (locale: Locale): string => (locale === "vi" ? "vi-VN" : "en-GB");

/** The attendance screens' text in the language the user picked; a key missing from the shared dictionary falls back to the catalog. */
export const useAttendanceText = (): AttendanceText => {
  const { locale, t } = useLocale();
  return useMemo(() => {
    const catalog = locale === "vi" ? ATTENDANCE_VI : ATTENDANCE_EN;
    // Both catalogs cover every AttendanceMessageKey, so translating each entry keeps the key set complete.
    const messages = Object.fromEntries(
      (Object.keys(catalog) as AttendanceMessageKey[]).map((key) => [
        key,
        t(`tenant.proctorAttendance.${key}`, catalog[key]),
      ]),
    ) as AttendanceMessages;
    const dateLocale = dateLocaleOf(locale);
    const asDate = (value: string | Date): Date => (value instanceof Date ? value : new Date(value));
    return {
      ...messages,
      locale,
      statusLabel: (status) => {
        switch (status) {
          case "PRESENT":
            return messages.statusPresent;
          case "LATE":
            return messages.statusLate;
          case "ABSENT":
            return messages.statusAbsent;
          default:
            return messages.statusUnmarked;
        }
      },
      activityLabel: (status) => {
        switch (status) {
          case "IN_PROGRESS":
            return messages.activityInProgress;
          case "SUBMITTED":
            return messages.activitySubmitted;
          case "ABANDONED":
            return messages.activityAbandoned;
          case "CREATED":
            return messages.activityCreated;
          case "NOT_STARTED":
            return messages.notStarted;
          default:
            return messages.activityUnknown;
        }
      },
      roleLabel: (role) => {
        switch (role) {
          case "PROCTOR":
            return messages.roleProctor;
          case "HOST_ADMIN":
            return messages.roleHostAdmin;
          case "PLATFORM_ADMIN":
            return messages.rolePlatformAdmin;
          case "PLATFORM_MANAGER":
            return messages.rolePlatformManager;
          case "EXAMINER":
            return messages.roleExaminer;
          default:
            return messages.roleUnknown;
        }
      },
      formatDateTime: (value) => asDate(value).toLocaleString(dateLocale),
      formatTime: (value) => asDate(value).toLocaleTimeString(dateLocale),
      formatDate: (value) => asDate(value).toLocaleDateString(dateLocale),
    };
  }, [locale, t]);
};
