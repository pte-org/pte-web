/**
 * The backend stores each audit summary as a fixed English sentence next to a stable `action` code, with no
 * structured metadata. This turns the sentences it writes today into natural Vietnamese/English; anything it
 * does not recognise is shown as stored, so a new action is never hidden or mangled.
 */
export type AuditLocale = "vi" | "en";

interface Pair {
  vi: string;
  en: string;
}

/** Words that depend on the organization's own labels and on the code a sentence mentions. */
export interface AuditSummaryContext {
  program: string;
  class: string;
  examStatus: (code: string) => string;
  ticketStatus: (code: string) => string;
  ticketCategory: (code: string) => string;
}

interface Rule {
  actions: readonly string[];
  pattern: RegExp;
  render: (match: RegExpMatchArray, context: AuditSummaryContext) => Pair;
}

const same = (text: string): Pair => ({ vi: text, en: text });

const RULES: readonly Rule[] = [
  {
    actions: ["ExamAutoOpened", "ExamAutoClosed", "ExamScheduleUpdated"],
    pattern: /\((\w+) -> (\w+)\)/,
    render: (m, c) => same(`${c.examStatus(m[1])} → ${c.examStatus(m[2])}`),
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
    render: (m, c) => ({
      vi: `Thêm ${m[1]} học viên vào ${c.class} "${m[2]}" (${m[3]} đã có sẵn)`,
      en: `Added ${m[1]} students to ${c.class} "${m[2]}" (${m[3]} already in it)`,
    }),
  },
  {
    actions: ["TicketSubmitted"],
    pattern: /\[(\w+)\]/,
    render: (m, c) => ({
      vi: `Gửi yêu cầu · ${c.ticketCategory(m[1])}`,
      en: `Submitted · ${c.ticketCategory(m[1])}`,
    }),
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
    render: (m, c) => ({
      vi: `Chuyển sang ${c.ticketStatus(m[1])}`,
      en: `Changed to ${c.ticketStatus(m[1])}`,
    }),
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
    pattern: /under contract (\S+)/,
    render: (m) => ({ vi: `Cấp gói theo hợp đồng ${m[1]}`, en: `Plan granted under contract ${m[1]}` }),
  },
];

/** The summary in the viewer's language; null when it only repeats the resource name already shown beside it. */
export function describeAuditSummary(
  action: string,
  summary: string,
  resourceName: string | null | undefined,
  locale: AuditLocale,
  context: AuditSummaryContext,
): string | null {
  const text = summary.trim();
  if (resourceName && text === resourceName.trim()) return null;
  for (const rule of RULES) {
    if (!rule.actions.includes(action)) continue;
    const match = text.match(rule.pattern);
    if (match) return rule.render(match, context)[locale];
  }
  return text;
}

/** Class and program logs carry their name only inside the sentence, so lift it out for the resource column. */
export function resourceNameFromSummary(action: string, summary: string): string | null {
  if (!["ClassCreated", "ProgramCreated", "StudentAssignedToClass"].includes(action)) return null;
  return summary.match(/"(.+?)"/)?.[1] ?? null;
}
