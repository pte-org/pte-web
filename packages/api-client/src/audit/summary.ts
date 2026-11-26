import {
  AUDIT_EXAM_STATUS_LABELS,
  AUDIT_TICKET_CATEGORY_LABELS,
  AUDIT_TICKET_STATUS_LABELS,
  auditWord,
  type AuditLocale,
} from "./labels";

/**
 * The backend stores each audit summary as a fixed English sentence next to a stable `action` code, with no
 * structured metadata. This words the sentences it writes today in the viewer's language; anything it does not
 * recognise is shown as stored, so a new action is never hidden or mangled.
 */
export interface AuditSummaryWording {
  /** What the organization calls a program / a class; the two are renamable per organization. */
  program: string;
  class: string;
}

interface Pair {
  vi: string;
  en: string;
}

interface RuleContext extends AuditSummaryWording {
  locale: AuditLocale;
}

interface Rule {
  actions: readonly string[];
  pattern: RegExp;
  render: (match: RegExpMatchArray, context: RuleContext) => Pair;
}

const same = (text: string): Pair => ({ vi: text, en: text });
const shortDate = (iso: string, locale: AuditLocale): string | null => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const RULES: readonly Rule[] = [
  {
    actions: ["ExamAutoOpened", "ExamAutoClosed", "ExamScheduleUpdated"],
    pattern: /\((\w+) -> (\w+)\)/,
    render: (m, c) =>
      same(
        `${auditWord(AUDIT_EXAM_STATUS_LABELS, m[1], c.locale)} → ${auditWord(AUDIT_EXAM_STATUS_LABELS, m[2], c.locale)}`,
      ),
  },
  {
    actions: ["ExamAudienceSourceAdded"],
    pattern: /^(\d+) sources?$/,
    render: (m) => ({
      vi: `Thêm ${m[1]} nguồn thí sinh`,
      en: `${m[1]} audience ${Number(m[1]) === 1 ? "source" : "sources"} added`,
    }),
  },
  {
    actions: ["OrganizationUpdated"],
    pattern: /^Updated organization profile$/,
    render: () => ({ vi: "Cập nhật hồ sơ tổ chức", en: "Updated organization profile" }),
  },
  {
    actions: ["ProgramCreated"],
    pattern: /^Created Program "(.+)"$/,
    render: (m, c) => ({ vi: `Tạo ${c.program} "${m[1]}"`, en: `Created ${c.program} "${m[1]}"` }),
  },
  {
    actions: ["ClassCreated"],
    pattern: /^Created Class "(.+)"$/,
    render: (m, c) => ({ vi: `Tạo ${c.class} "${m[1]}"`, en: `Created ${c.class} "${m[1]}"` }),
  },
  {
    actions: ["ClassSplit"],
    pattern: /^Split Class into new Class "(.+)" \((\d+) student\(s\) moved\)$/,
    render: (m, c) => ({
      vi: `Tách ${c.class} thành ${c.class} mới "${m[1]}" (chuyển ${m[2]} học viên)`,
      en: `Split ${c.class} into a new ${c.class} "${m[1]}" (${m[2]} students moved)`,
    }),
  },
  {
    actions: ["StudentAssignedToClass"],
    pattern: /^Assigned student to Class "(.+)"$/,
    render: (m, c) => ({
      vi: `Thêm học viên vào ${c.class} "${m[1]}"`,
      en: `Added a student to ${c.class} "${m[1]}"`,
    }),
  },
  {
    actions: ["StudentAssignedToClass"],
    pattern: /^Bulk-assigned (\d+) student\(s\) to Class "(.+)" \((\d+) already assigned\)$/,
    // The skipped count is only worth saying when someone was actually skipped.
    render: (m, c) => {
      const skipped = Number(m[3]);
      return {
        vi: `Thêm ${m[1]} học viên vào ${c.class} "${m[2]}"${skipped > 0 ? ` (${skipped} đã có sẵn)` : ""}`,
        en: `Added ${m[1]} students to ${c.class} "${m[2]}"${skipped > 0 ? ` (${skipped} already in it)` : ""}`,
      };
    },
  },
  {
    actions: ["TicketSubmitted"],
    pattern: /\[(\w+)\]/,
    render: (m, c) => {
      const category = auditWord(AUDIT_TICKET_CATEGORY_LABELS, m[1], c.locale);
      return { vi: `Gửi yêu cầu · ${category}`, en: `Submitted · ${category}` };
    },
  },
  {
    actions: ["TicketClosed"],
    pattern: /^Host closed ticket$/,
    render: () => ({ vi: "Tổ chức đã đóng yêu cầu", en: "Closed by the organization" }),
  },
  {
    actions: ["TicketNoteAdded"],
    pattern: /^Admin added note$/,
    render: () => ({ vi: "Quản trị viên đã phản hồi", en: "An administrator replied" }),
  },
  {
    actions: ["TicketStatusUpdated"],
    pattern: /^Status updated to (\w+)$/,
    render: (m, c) => {
      const status = auditWord(AUDIT_TICKET_STATUS_LABELS, m[1], c.locale);
      return { vi: `Chuyển sang ${status}`, en: `Changed to ${status}` };
    },
  },
  {
    actions: ["UserPasswordChangedSelf"],
    pattern: /^User changed their own password\.$/,
    render: () => ({ vi: "Tự đổi mật khẩu", en: "Changed their own password" }),
  },
  {
    actions: ["UserPasswordReset"],
    pattern: /^Authorized administrator reset the password\.$/,
    render: () => ({ vi: "Quản trị viên đặt lại mật khẩu", en: "An administrator reset the password" }),
  },
  {
    actions: ["UserProfileUpdated"],
    pattern: /^User updated their profile\.$/,
    render: () => ({ vi: "Cập nhật hồ sơ cá nhân", en: "Updated their profile" }),
  },
  {
    actions: ["PLAN_TRANSITION"],
    pattern: /^Activated plan$/,
    render: () => ({ vi: "Kích hoạt gói", en: "Activated plan" }),
  },
  {
    actions: ["LICENSE_GRANT"],
    pattern: /under contract (\S+)(?: starting (\S+))?/,
    // The plan and organization ids in the sentence mean nothing to a reader; the contract and start date do.
    render: (m, c) => {
      const start = m[2] && m[2] !== "null" ? shortDate(m[2], c.locale) : null;
      return {
        vi: `Cấp gói theo hợp đồng ${m[1]}${start ? `, hiệu lực từ ${start}` : ""}`,
        en: `Plan granted under contract ${m[1]}${start ? `, starting ${start}` : ""}`,
      };
    },
  },
  {
    actions: ["REVIEW_APPLICATION"],
    pattern: /^(Approved|Rejected) tenant application$/,
    render: (m) =>
      m[1] === "Approved"
        ? { vi: "Duyệt đơn đăng ký tổ chức", en: "Approved organization application" }
        : { vi: "Từ chối đơn đăng ký tổ chức", en: "Rejected organization application" },
  },
  {
    actions: ["CREATED"],
    pattern: /^Created question draft$/,
    render: () => ({ vi: "Tạo bản nháp câu hỏi", en: "Created question draft" }),
  },
  {
    actions: ["PUBLISHED"],
    pattern: /^Published question$/,
    render: () => ({ vi: "Phát hành câu hỏi", en: "Published question" }),
  },
  {
    actions: ["CREATED"],
    pattern: /^Created host template from default version (\d+)$/,
    render: (m) => ({
      vi: `Tạo mẫu điểm cho tổ chức từ phiên bản mặc định ${m[1]}`,
      en: `Created an organization template from default version ${m[1]}`,
    }),
  },
];

/** The summary in the viewer's language; null when it only repeats the resource name shown beside it. */
export function describeAuditSummary(
  action: string,
  summary: string,
  resourceName: string | null | undefined,
  locale: AuditLocale,
  wording: AuditSummaryWording,
): string | null {
  const text = summary.trim();
  if (resourceName && text === resourceName.trim()) return null;
  for (const rule of RULES) {
    if (!rule.actions.includes(action)) continue;
    const match = text.match(rule.pattern);
    if (match) return rule.render(match, { ...wording, locale })[locale];
  }
  return text;
}

/** Class and program logs carry their name only inside the sentence, so lift it out for the resource column. */
export function resourceNameFromSummary(action: string, summary: string): string | null {
  if (!["ClassCreated", "ProgramCreated", "StudentAssignedToClass"].includes(action)) return null;
  return summary.match(/"(.+?)"/)?.[1] ?? null;
}
