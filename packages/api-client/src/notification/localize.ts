import type { InboxItemResponse } from "../types/notification";
import {
  AUDIT_TICKET_CATEGORY_LABELS,
  AUDIT_TICKET_STATUS_LABELS,
  auditWord,
  type AuditLocale,
} from "../audit/labels";

/**
 * The backend stores each notification as one fixed English sentence (the values already filled in) beside a stable
 * `notificationType`. This words the ones the platform writes itself in the viewer's language, by type; an
 * announcement a person wrote, or a sentence it does not recognise, is shown exactly as stored.
 */
export interface InboxItemText {
  title: string;
  body: string;
}

type Pair = { vi: string; en: string };

const SEVERITY: Record<string, Pair> = {
  LOW: { vi: "thấp", en: "low" },
  MEDIUM: { vi: "trung bình", en: "medium" },
  HIGH: { vi: "cao", en: "high" },
  CRITICAL: { vi: "nghiêm trọng", en: "critical" },
};

/** "2026-11-24T04:27:51Z" as "11:27 · 24/11/2026" in the person's own time zone; anything else is left as it is. */
function instantText(value: string, locale: AuditLocale): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const tag = locale === "vi" ? "vi-VN" : "en-GB";
  const time = date.toLocaleTimeString(tag, { hour: "2-digit", minute: "2-digit", hour12: false });
  const day = date.toLocaleDateString(tag, { day: "2-digit", month: "2-digit", year: "numeric" });
  return `${time} · ${day}`;
}

interface Template {
  title: Pair;
  /** Sentences the backend writes for this type; the first that matches wins. */
  bodies: readonly { pattern: RegExp; render: (match: RegExpMatchArray, locale: AuditLocale) => Pair }[];
}

const TEMPLATES: Record<string, Template> = {
  APPLICATION_SUBMITTED: {
    title: { vi: "Đơn đăng ký tổ chức mới", en: "New organization application" },
    bodies: [
      {
        pattern: /^Organization '(.+)' submitted an application for platform review\.$/,
        render: (m) => ({
          vi: `Tổ chức "${m[1]}" đã gửi đơn đăng ký chờ nền tảng xét duyệt.`,
          en: `Organization "${m[1]}" submitted an application for platform review.`,
        }),
      },
    ],
  },
  COMMERCIAL_OUTCOME_CONFIRMED: {
    title: { vi: "Quyền sử dụng đã được cập nhật", en: "Commercial access updated" },
    bodies: [
      {
        pattern: /^Your exam package is active from (.+)\. Open the billing target to review access\.$/,
        render: (m) => ({
          vi: `Gói thi của bạn có hiệu lực từ ${m[1]}. Mở mục Gói và thanh toán để xem chi tiết.`,
          en: `Your exam package is active from ${m[1]}. Open Plans & billing to review access.`,
        }),
      },
      {
        pattern: /^Your student capacity increased by (\d+) slots from (.+)\.$/,
        render: (m) => ({
          vi: `Hạn mức học viên của bạn tăng thêm ${m[1]} chỗ từ ${m[2]}.`,
          en: `Your student capacity increased by ${m[1]} slots from ${m[2]}.`,
        }),
      },
    ],
  },
  ORDER_EXPIRED: {
    title: { vi: "Đơn thanh toán đã hết hạn", en: "Payment order expired" },
    bodies: [
      {
        pattern: /^Payment order (.+) expired before payment was confirmed\.$/,
        render: (m) => ({
          vi: `Đơn thanh toán ${m[1]} đã hết hạn trước khi thanh toán được xác nhận.`,
          en: `Payment order ${m[1]} expired before payment was confirmed.`,
        }),
      },
    ],
  },
  SUBSCRIPTION_REVOKED: {
    title: { vi: "Gói đăng ký đã bị thu hồi", en: "Subscription revoked" },
    bodies: [
      {
        pattern: /^Subscription (\S+) was revoked(.*)\.$/,
        render: (m) => ({
          vi: `Gói đăng ký ${m[1]} đã bị thu hồi${m[2]}.`,
          en: `Subscription ${m[1]} was revoked${m[2]}.`,
        }),
      },
    ],
  },
  SESSION_CLOSING_SOON: {
    title: { vi: "Kỳ thi sắp đóng", en: "Exam closing soon" },
    bodies: [
      {
        pattern: /^Exam session '(.+)' closes at (.+)\.$/,
        render: (m, locale) => ({
          vi: `Kỳ thi "${m[1]}" sẽ đóng lúc ${instantText(m[2], "vi")}.`,
          en: `Exam "${m[1]}" closes at ${instantText(m[2], locale)}.`,
        }),
      },
    ],
  },
  SESSION_GRADING_COMPLETED: {
    title: { vi: "Đã chấm xong kỳ thi", en: "Exam grading completed" },
    bodies: [
      {
        pattern: /^Grading for exam session '(.+)' is complete and ready for host review\.$/,
        render: (m) => ({
          vi: `Kỳ thi "${m[1]}" đã chấm xong, sẵn sàng để bạn xem xét.`,
          en: `Grading for exam "${m[1]}" is complete and ready for your review.`,
        }),
      },
    ],
  },
  SESSION_PREVIEW_READY: {
    title: { vi: "Bản xem trước kỳ thi đã sẵn sàng", en: "Exam preview ready" },
    bodies: [
      {
        pattern: /^Exam session '(.+)' \((.+)\) is ready\. Log in to PTE App as a host to preview it without changing the exam status\.$/,
        render: (m) => ({
          vi: `Kỳ thi "${m[1]}" (${m[2]}) đã sẵn sàng. Đăng nhập ứng dụng PTE bằng tài khoản host để xem trước mà không đổi trạng thái kỳ thi.`,
          en: `Exam "${m[1]}" (${m[2]}) is ready. Log in to the PTE app as a host to preview it without changing the exam's status.`,
        }),
      },
    ],
  },
  EXAM_INCIDENT_REPORTED: {
    title: { vi: "Có sự cố trong kỳ thi", en: "Exam incident reported" },
    bodies: [
      {
        pattern: /^A (\w+) incident was reported: ([\s\S]*)$/,
        render: (m, locale) => {
          const severity = SEVERITY[m[1]]?.[locale] ?? m[1].toLowerCase();
          return {
            vi: `Có sự cố mức ${severity} được báo cáo: ${m[2]}`,
            en: `A ${severity} incident was reported: ${m[2]}`,
          };
        },
      },
    ],
  },
  SUPPORT_TICKET_SUBMITTED: {
    title: { vi: "Có yêu cầu hỗ trợ mới", en: "New support request" },
    bodies: [
      {
        pattern: /^New (\w+) feedback was submitted for admin review\.$/,
        render: (m, locale) => {
          const category = auditWord(AUDIT_TICKET_CATEGORY_LABELS, m[1], locale);
          return {
            vi: `Có yêu cầu hỗ trợ mới (${category}) đang chờ quản trị viên xem xét.`,
            en: `A new support request (${category}) is waiting for an administrator.`,
          };
        },
      },
    ],
  },
  SUPPORT_TICKET_NOTE_ADDED: {
    title: { vi: "Quản trị viên đã phản hồi yêu cầu của bạn", en: "An administrator replied to your request" },
    bodies: [
      {
        pattern: /^An admin responded to your (\w+) feedback ticket\.$/,
        render: (m, locale) => {
          const category = auditWord(AUDIT_TICKET_CATEGORY_LABELS, m[1], locale);
          return {
            vi: `Quản trị viên đã phản hồi yêu cầu hỗ trợ (${category}) của bạn.`,
            en: `An administrator replied to your support request (${category}).`,
          };
        },
      },
    ],
  },
  SUPPORT_TICKET_STATUS_CHANGED: {
    title: { vi: "Trạng thái yêu cầu hỗ trợ đã đổi", en: "Support request status changed" },
    bodies: [
      {
        pattern: /^Your (\w+) feedback ticket is now (\w+)\.$/,
        render: (m, locale) => {
          const category = auditWord(AUDIT_TICKET_CATEGORY_LABELS, m[1], locale);
          const status = auditWord(AUDIT_TICKET_STATUS_LABELS, m[2], locale);
          return {
            vi: `Yêu cầu hỗ trợ (${category}) của bạn đã chuyển sang trạng thái "${status}".`,
            en: `Your support request (${category}) is now "${status}".`,
          };
        },
      },
    ],
  },
};

/** The notification's title and text in the viewer's language. */
export function localizeInboxItem(
  item: Pick<InboxItemResponse, "notificationType" | "title" | "body">,
  locale: AuditLocale,
): InboxItemText {
  const template = TEMPLATES[item.notificationType];
  if (!template) return { title: item.title, body: item.body };
  for (const entry of template.bodies) {
    const match = item.body.match(entry.pattern);
    // The title follows the type; the body only changes when its sentence is one the backend writes today.
    if (match) return { title: template.title[locale], body: entry.render(match, locale)[locale] };
  }
  return { title: template.title[locale], body: item.body };
}
