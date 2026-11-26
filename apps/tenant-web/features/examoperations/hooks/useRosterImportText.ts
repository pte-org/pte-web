"use client";

import { useLocale } from "@pte/ui";
import {
  ROSTER_COLUMN_WARNING_TEXT,
  ROSTER_FIELD_LABELS,
  ROSTER_ROW_ISSUES_TEXT,
  ROSTER_ROW_MESSAGES,
  ROSTER_ROW_UNKNOWN_MESSAGE,
  ROSTER_SEND_CREDENTIALS_TEXT,
} from "../constants";
import {
  SKIPPED_ROW_REASON_MESSAGES,
  SKIPPED_ROW_UNKNOWN_REASON,
  SKIPPED_ROWS_REPORT_TEXT,
} from "../components/constants";
import type { RosterField } from "../types";

const MESSAGE_TO_CODE: Record<string, string> = Object.fromEntries(
  Object.entries(ROSTER_ROW_MESSAGES).map(([code, message]) => [message, code]),
);

const VI_FIELD_LABELS: Record<RosterField, string> = {
  email: "Email",
  username: "Tên đăng nhập",
  fullName: "Họ và tên",
  studentCode: "Mã học viên",
  programName: "Chương trình",
  className: "Lớp học",
  phone: "Số điện thoại",
  dateOfBirth: "Ngày sinh",
};

const VI_ROW_MESSAGES: Record<string, string> = {
  EMAIL_REQUIRED: "Vui lòng nhập email.",
  EMAIL_INVALID: "Email không đúng định dạng.",
  EMAIL_TOO_LONG: "Email vượt quá 254 ký tự.",
  DUPLICATE_EMAIL_IN_BATCH: "Email này xuất hiện nhiều hơn một lần trong tệp.",
  FULL_NAME_REQUIRED: "Vui lòng nhập họ và tên.",
  FULL_NAME_TOO_LONG: "Họ và tên vượt quá 100 ký tự.",
  STUDENT_CODE_TOO_LONG: "Mã học viên vượt quá 50 ký tự.",
  PROGRAM_NAME_TOO_LONG: "Tên chương trình vượt quá 100 ký tự.",
  CLASS_NAME_TOO_LONG: "Tên lớp học vượt quá 100 ký tự.",
  PHONE_INVALID: "Số điện thoại phải có 9 đến 15 chữ số (có thể bắt đầu bằng +).",
  DATE_OF_BIRTH_INVALID: "Ngày sinh không hợp lệ. Học viên cần từ 6 tuổi trở lên.",
};

const VI_SKIPPED_REASONS: Record<string, string> = {
  EMAIL_ALREADY_USED: "Email này đã có tài khoản trong hệ thống.",
  ROSTER_IMPORT_FAILED: "Không thể tạo tài khoản cho dòng này. Vui lòng kiểm tra lại và thử lại.",
};

export const useRosterImportText = () => {
  const { locale, t } = useLocale();
  const isVi = locale === "vi";

  return {
    locale,
    issuesTitle: (count: number) =>
      t(
        "tenant.roster.issuesTitle",
        isVi ? "Cần sửa {count} lỗi trước khi tạo tài khoản" : ROSTER_ROW_ISSUES_TEXT.TITLE(count),
        { count },
      ),
    issuesHint: t(
      "tenant.roster.issuesHint",
      isVi
        ? "Hãy sửa các ô này trong tệp Excel rồi tải lên lại. Chưa có tài khoản nào được tạo."
        : ROSTER_ROW_ISSUES_TEXT.HINT,
    ),
    issueRow: (row: number) =>
      t("tenant.roster.row", isVi ? "Dòng {row}" : ROSTER_ROW_ISSUES_TEXT.ROW(row), { row }),
    issueMore: (count: number) =>
      t("tenant.roster.moreIssues", isVi ? "…và {count} lỗi khác." : ROSTER_ROW_ISSUES_TEXT.MORE(count), {
        count,
      }),
    fieldLabel: (field: RosterField) =>
      t(
        `tenant.roster.field.${field}`,
        isVi ? VI_FIELD_LABELS[field] : ROSTER_FIELD_LABELS[field],
      ),
    issueMessage: (rawMessage: string) => {
      if (rawMessage === ROSTER_ROW_UNKNOWN_MESSAGE) {
        return t(
          "tenant.roster.issue.UNKNOWN",
          isVi ? "Giá trị này không hợp lệ." : ROSTER_ROW_UNKNOWN_MESSAGE,
        );
      }
      const code = MESSAGE_TO_CODE[rawMessage];
      if (!code) return rawMessage;
      return t(
        `tenant.roster.issue.${code}`,
        isVi ? (VI_ROW_MESSAGES[code] ?? rawMessage) : (ROSTER_ROW_MESSAGES[code] ?? rawMessage),
      );
    },
    sendCredentialsLabel: t(
      "tenant.roster.sendCredentialsLabel",
      isVi
        ? "Gửi email tên đăng nhập và mật khẩu tạm thời cho từng học viên"
        : ROSTER_SEND_CREDENTIALS_TEXT.LABEL,
    ),
    sendCredentialsHelper: t(
      "tenant.roster.sendCredentialsHelper",
      isVi
        ? "Được gửi sau khi tạo tài khoản. Bạn cũng luôn có thể tải tệp thông tin đăng nhập."
        : ROSTER_SEND_CREDENTIALS_TEXT.HELPER,
    ),
    columnWarningTitle: t(
      "tenant.roster.columnWarningTitle",
      isVi ? "Một số cột cần bạn kiểm tra lại" : ROSTER_COLUMN_WARNING_TEXT.TITLE,
    ),
    columnWarningMissing: (columns: string) =>
      t(
        "tenant.roster.columnWarningMissing",
        isVi
          ? "Không tìm thấy cột bắt buộc trong tệp: {columns}."
          : "Required column not found in your file: {columns}.",
        { columns },
      ),
    columnWarningIgnored: (columns: string) =>
      t(
        "tenant.roster.columnWarningIgnored",
        isVi
          ? "Các cột sau không nằm trong mẫu hệ thống nên đã được bỏ qua: {columns}."
          : "Not part of the system template, so these columns are ignored: {columns}.",
        { columns },
      ),
    skippedHeading: (count: number) =>
      t(
        "tenant.roster.skippedHeading",
        isVi ? "Đã bỏ qua {count} dòng" : SKIPPED_ROWS_REPORT_TEXT.HEADING,
        { count },
      ),
    skippedRow: t("tenant.roster.skippedRow", isVi ? "Dòng" : SKIPPED_ROWS_REPORT_TEXT.ROW_HEADER),
    skippedEmail: t("tenant.roster.skippedEmail", SKIPPED_ROWS_REPORT_TEXT.EMAIL_HEADER),
    skippedReason: t(
      "tenant.roster.skippedReason",
      isVi ? "Lý do" : SKIPPED_ROWS_REPORT_TEXT.REASON_HEADER,
    ),
    skippedReasonMessage: (reason: string) => {
      const knownEn = SKIPPED_ROW_REASON_MESSAGES[reason];
      if (!knownEn) {
        return t(
          "tenant.roster.skippedReason.UNKNOWN",
          isVi ? "Không thể nhập dòng này. Vui lòng kiểm tra lại và thử lại." : SKIPPED_ROW_UNKNOWN_REASON,
        );
      }
      return t(
        `tenant.roster.skippedReason.${reason}`,
        isVi ? (VI_SKIPPED_REASONS[reason] ?? knownEn) : knownEn,
      );
    },
    genericError: isVi
      ? "Không thể thực hiện thao tác. Vui lòng thử lại."
      : "We couldn't complete this action. Please try again.",
  };
};
