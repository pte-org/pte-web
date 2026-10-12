import type { StudentDetailResponse, StudentHistoryReportState } from "@pte/api-client";
import type { Locale } from "@pte/ui";

export interface StudentProfileForm {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
}

export const formFromAccount = (account: StudentDetailResponse): StudentProfileForm => ({
  fullName: account.fullName ?? "",
  email: account.email ?? "",
  phone: account.phone ?? "",
  dateOfBirth: account.dateOfBirth ?? "",
});

export const formatStudentDate = (value: string, locale: Locale): string =>
  new Date(value).toLocaleString(locale === "vi" ? "vi-VN" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

export const reportStateVariant = (
  state: StudentHistoryReportState,
): "success" | "warning" | "neutral" =>
  state === "PUBLISHED" ? "success" : state === "UNPUBLISHED" ? "warning" : "neutral";
