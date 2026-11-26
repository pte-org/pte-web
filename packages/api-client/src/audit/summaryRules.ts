import type { Pair, Rule } from "./summary";

/**
 * Wording for the rest of the sentences the backend writes: announcements, plans, users, organizations, classes,
 * programs, question and exam-template lifecycles, scoring. Kept apart from the first rules so each file stays short.
 */
const same = (text: string): Pair => ({ vi: text, en: text });

/** A summary the backend writes as one fixed sentence: the same words in each language, whatever the action. */
const fixed = (actions: readonly string[], sentence: string, vi: string, en: string): Rule => ({
  actions,
  pattern: new RegExp(`^${sentence.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`),
  render: () => ({ vi, en }),
});

export const EXTRA_RULES: readonly Rule[] = [
  fixed(["CREATE_DRAFT"], "Announcement draft created", "Tạo bản nháp thông báo", "Created an announcement draft"),
  fixed(["UPDATE_DRAFT"], "Announcement draft updated", "Cập nhật bản nháp thông báo", "Updated an announcement draft"),
  fixed(["DELETE_DRAFT"], "Announcement draft deleted", "Xóa bản nháp thông báo", "Deleted an announcement draft"),
  {
    actions: ["PUBLISH"],
    pattern: /^Announcement published to (\d+) eligible hosts?$/,
    render: (m) => ({
      vi: `Phát hành tới ${m[1]} tổ chức đủ điều kiện`,
      en: `Published to ${m[1]} eligible ${Number(m[1]) === 1 ? "organization" : "organizations"}`,
    }),
  },
  {
    actions: ["RETRY_DELIVERY"],
    pattern: /^Reset (\d+) failed announcement deliveries$/,
    render: (m) => ({
      vi: `Đặt lại ${m[1]} lượt giao thất bại`,
      en: `Reset ${m[1]} failed ${Number(m[1]) === 1 ? "delivery" : "deliveries"}`,
    }),
  },
  fixed(["PLAN_TRANSITION"], "Created plan draft", "Tạo bản nháp gói", "Created a plan draft"),
  fixed(["PLAN_TRANSITION"], "Updated plan", "Cập nhật gói", "Updated the plan"),
  fixed(["PLAN_TRANSITION"], "Archived plan", "Lưu trữ gói", "Archived the plan"),
  fixed(["PlanDraftDeleted"], "Unused plan draft removed.", "Xóa bản nháp gói không dùng", "Removed an unused plan draft"),
  fixed(["LICENSE_ISSUE"], "Issued masked license code", "Phát hành mã bản quyền (đã che)", "Issued a masked license code"),
  fixed(
    ["LicenseCodeRevealed"],
    "License bearer revealed by an authorized platform administrator.",
    "Quản trị viên nền tảng đã xem mã bản quyền",
    "A platform administrator viewed the license code",
  ),
  {
    actions: ["PLATFORM_SETTING_UPDATED"],
    pattern: /^Updated platform setting (\S+) from (.*) to (.*)$/,
    render: (m) => ({ vi: `Đổi ${m[1]}: ${m[2]} → ${m[3]}`, en: `Changed ${m[1]}: ${m[2]} → ${m[3]}` }),
  },
  fixed(["TenantOnboarded"], "Onboarded tenant", "Khởi tạo tổ chức", "Onboarded the organization"),
  fixed(["TenantSuspended"], "Suspended tenant", "Tạm ngưng tổ chức", "Suspended the organization"),
  fixed(["TenantReactivated"], "Reactivated tenant", "Kích hoạt lại tổ chức", "Reactivated the organization"),
  fixed(["TenantBrandingUpdated"], "Updated tenant branding", "Cập nhật nhận diện tổ chức", "Updated the organization branding"),
  {
    actions: ["ProgramUpdated"],
    pattern: /^Updated Program "(.+)"$/,
    render: (m, c) => ({ vi: `Cập nhật ${c.program} "${m[1]}"`, en: `Updated ${c.program} "${m[1]}"` }),
  },
  {
    actions: ["ProgramArchived"],
    pattern: /^Archived Program "(.+)"$/,
    render: (m, c) => ({ vi: `Lưu trữ ${c.program} "${m[1]}"`, en: `Archived ${c.program} "${m[1]}"` }),
  },
  {
    actions: ["ProgramStatusChanged"],
    pattern: /^Changed Program status to (\w+)$/,
    render: (m, c) => ({ vi: `Đổi trạng thái ${c.program} sang ${m[1]}`, en: `Changed ${c.program} status to ${m[1]}` }),
  },
  {
    actions: ["ClassStatusChanged"],
    pattern: /^Changed Class status to (\w+)$/,
    render: (m, c) => ({ vi: `Đổi trạng thái ${c.class} sang ${m[1]}`, en: `Changed ${c.class} status to ${m[1]}` }),
  },
  {
    actions: ["ClassArchived"],
    pattern: /^Archived Class "(.+)"$/,
    render: (m, c) => ({ vi: `Lưu trữ ${c.class} "${m[1]}"`, en: `Archived ${c.class} "${m[1]}"` }),
  },
  {
    actions: ["ClassUpdated"],
    pattern: /^Renamed Class to "(.+)"$/,
    render: (m, c) => ({ vi: `Đổi tên ${c.class} thành "${m[1]}"`, en: `Renamed ${c.class} to "${m[1]}"` }),
  },
  {
    actions: ["ClassesMerged"],
    pattern: /^Merged (\d+) Class\(es\) into "(.+)" \((\d+) student\(s\) moved\)$/,
    render: (m, c) => ({
      vi: `Gộp ${m[1]} ${c.class} vào "${m[2]}" (chuyển ${m[3]} học viên)`,
      en: `Merged ${m[1]} ${c.class} into "${m[2]}" (${m[3]} students moved)`,
    }),
  },
  {
    actions: ["StudentUnassignedFromClass"],
    pattern: /^Unassigned student from Class "(.+)"$/,
    render: (m, c) => ({ vi: `Xóa học viên khỏi ${c.class} "${m[1]}"`, en: `Removed a student from ${c.class} "${m[1]}"` }),
  },
  {
    actions: ["StudentTransferredClass"],
    pattern: /^Transferred student to Class "(.+)"$/,
    render: (m, c) => ({ vi: `Chuyển học viên sang ${c.class} "${m[1]}"`, en: `Transferred a student to ${c.class} "${m[1]}"` }),
  },
  fixed(["UserPasswordResetSelf"], "User reset their own password from an e-mailed link.", "Tự đặt lại mật khẩu qua liên kết email", "Reset their own password from an emailed link"),
  fixed(["UserCredentialsEmailed"], "Authorized administrator e-mailed a temporary password.", "Quản trị viên gửi mật khẩu tạm qua email", "An administrator emailed a temporary password"),
  fixed(["PlatformUserCreated"], "Platform user created.", "Tạo người dùng nền tảng", "Created a platform user"),
  fixed(["PlatformUserRolesUpdated"], "Platform user roles updated.", "Cập nhật vai trò", "Updated the roles"),
  fixed(["PlatformUserProfileUpdated"], "Platform user profile updated.", "Cập nhật hồ sơ", "Updated the profile"),
  fixed(["PlatformUserPasswordReset"], "Platform user password reset.", "Đặt lại mật khẩu", "Reset the password"),
  fixed(["PlatformUserSuspended"], "Platform user suspended.", "Tạm ngưng tài khoản", "Suspended the account"),
  fixed(["PlatformUserReactivated"], "Platform user reactivated.", "Kích hoạt lại tài khoản", "Reactivated the account"),
  fixed(["PlatformUserArchived"], "Platform user archived.", "Lưu trữ tài khoản", "Archived the account"),
  fixed(["PlatformUserRestored"], "Platform user restored.", "Khôi phục tài khoản", "Restored the account"),
  fixed(["PlatformAuthorizationDenied"], "Platform-user management authorization denied.", "Từ chối quyền quản lý người dùng nền tảng", "Platform-user management was denied"),
  fixed(["SUBMITTED_FOR_APPROVAL"], "Submitted question for approval", "Gửi duyệt câu hỏi", "Submitted the question for approval"),
  fixed(["APPROVED"], "Approved question", "Duyệt câu hỏi", "Approved the question"),
  {
    actions: ["REJECTED_TO_DRAFT"],
    pattern: /^Rejected question: (.*)$/,
    render: (m) => ({ vi: `Trả câu hỏi về bản nháp: ${m[1]}`, en: `Returned the question to draft: ${m[1]}` }),
  },
  {
    actions: ["REVISION_CREATED"],
    pattern: /^Created question revision (\d+)$/,
    render: (m) => ({ vi: `Tạo phiên bản chỉnh sửa ${m[1]}`, en: `Created revision ${m[1]}` }),
  },
  fixed(["ARCHIVED"], "Archived question", "Lưu trữ câu hỏi", "Archived the question"),
  fixed(["UNARCHIVED"], "Restored question to draft", "Khôi phục câu hỏi về bản nháp", "Restored the question to draft"),
  fixed(["UPDATED"], "Updated question draft", "Cập nhật bản nháp câu hỏi", "Updated the question draft"),
  fixed(["QuestionDraftDeleted"], "Unused question draft removed.", "Xóa bản nháp câu hỏi không dùng", "Removed an unused question draft"),
  {
    actions: ["QUESTION_GENERATION_BATCH_CREATED"],
    pattern: /^rows=(\d+),items=(\d+),children=(\d+)$/,
    render: (m) => ({
      vi: `${m[1]} dòng, ${m[2]} câu hỏi, ${m[3]} đợt con`,
      en: `${m[1]} rows, ${m[2]} items, ${m[3]} child batches`,
    }),
  },
  {
    actions: ["QUESTION_GENERATION_BATCH_DRAFTS_DELETED"],
    pattern: /^processed=(\d+),deleted=(\d+),remaining=(\d+)$/,
    render: (m) => ({
      vi: `Xử lý ${m[1]}, đã xóa ${m[2]}, còn lại ${m[3]}`,
      en: `Processed ${m[1]}, deleted ${m[2]}, ${m[3]} remaining`,
    }),
  },
  {
    actions: ["SOURCE_SELECTED"],
    pattern: /^Selected (\w+) as the score source for (\d+) answers$/,
    render: (m) => ({
      vi: `Chọn ${m[1]} làm nguồn điểm cho ${m[2]} câu trả lời`,
      en: `Selected ${m[1]} as the score source for ${m[2]} answers`,
    }),
  },
  fixed(
    ["RUNTIME_CONTRACT_FAILURE"],
    "Attempt delivery was blocked because the frozen exam runtime contract was incompatible",
    "Không thể phát bài thi vì hợp đồng chạy bài đã chốt không tương thích",
    "Attempt delivery was blocked: the frozen exam runtime contract was incompatible",
  ),
  {
    actions: ["CREATED"],
    pattern: /^Created (blueprint) draft$/,
    render: () => ({ vi: "Tạo bản nháp cấu trúc kỳ thi", en: "Created a blueprint draft" }),
  },
  {
    actions: ["UPDATED"],
    pattern: /^Updated blueprint draft$/,
    render: () => ({ vi: "Cập nhật bản nháp cấu trúc kỳ thi", en: "Updated a blueprint draft" }),
  },
  fixed(["SUBMITTED_FOR_APPROVAL"], "Submitted blueprint for approval", "Gửi duyệt cấu trúc kỳ thi", "Submitted the blueprint for approval"),
  fixed(["APPROVED"], "Approved blueprint and published snapshot", "Duyệt cấu trúc kỳ thi và phát hành bản chốt", "Approved the blueprint and published a snapshot"),
  {
    actions: ["SUBMITTED_FOR_APPROVAL", "APPROVED", "ACTIVATED", "UPDATED", "DELETED_DRAFT", "CEFR_TARGETS_UPDATED", "TIME_FRAME_UPDATED", "CREATED"],
    pattern: /^(Submitted|Approved|Activated|Updated|Deleted|Created|Updated CEFR mix of|Updated time frame of) (?:draft )?version (\d+)(?: for (approval|activation))?$/,
    render: (m) => {
      const v = m[2];
      const table: Record<string, Pair> = {
        Submitted: { vi: `Gửi duyệt phiên bản ${v}`, en: `Submitted version ${v} for approval` },
        Approved: { vi: `Duyệt phiên bản ${v} để kích hoạt`, en: `Approved version ${v} for activation` },
        Activated: { vi: `Kích hoạt phiên bản ${v}`, en: `Activated version ${v}` },
        Updated: { vi: `Cập nhật bản nháp phiên bản ${v}`, en: `Updated draft version ${v}` },
        Deleted: { vi: `Xóa bản nháp phiên bản ${v}`, en: `Deleted draft version ${v}` },
        Created: { vi: `Tạo bản nháp phiên bản ${v}`, en: `Created draft version ${v}` },
        "Updated CEFR mix of": { vi: `Cập nhật tỷ lệ CEFR của bản nháp ${v}`, en: `Updated the CEFR mix of draft version ${v}` },
        "Updated time frame of": { vi: `Cập nhật khung thời gian của bản nháp ${v}`, en: `Updated the time frame of draft version ${v}` },
      };
      return table[m[1]] ?? same(m[0]);
    },
  },
  {
    actions: ["CLONED"],
    pattern: /^Cloned from version (\d+)$/,
    render: (m) => ({ vi: `Nhân bản từ phiên bản ${m[1]}`, en: `Cloned from version ${m[1]}` }),
  },
  {
    actions: ["RETIRED"],
    pattern: /^Retired version (\d+)(?: after activating version (\d+))?$/,
    render: (m) => ({
      vi: m[2] ? `Ngừng phiên bản ${m[1]} sau khi kích hoạt phiên bản ${m[2]}` : `Ngừng phiên bản ${m[1]}`,
      en: m[2] ? `Retired version ${m[1]} after activating version ${m[2]}` : `Retired version ${m[1]}`,
    }),
  },
  {
    actions: ["CREATED", "UPDATED", "RETIRED"],
    pattern: /^(Created|Updated|Deleted|Retired) (?:standard )?task type(?: metadata)? (\S+)$/,
    render: (m) => {
      const key = m[2];
      const table: Record<string, Pair> = {
        Created: { vi: `Tạo dạng bài ${key}`, en: `Created task type ${key}` },
        Updated: { vi: `Cập nhật dạng bài ${key}`, en: `Updated task type ${key}` },
        Deleted: { vi: `Xóa dạng bài ${key}`, en: `Deleted task type ${key}` },
        Retired: { vi: `Ngừng dạng bài ${key}`, en: `Retired task type ${key}` },
      };
      return table[m[1]] ?? same(m[0]);
    },
  },
  {
    actions: ["RUNTIME_CONTRACT_UPDATED"],
    pattern: /^Updated runtime contract for task type (\S+)$/,
    render: (m) => ({ vi: `Cập nhật hợp đồng chạy bài của dạng ${m[1]}`, en: `Updated the runtime contract of task type ${m[1]}` }),
  },
  fixed(["SUBMITTED_FOR_APPROVAL"], "Submitted task type for academic approval", "Gửi duyệt dạng bài", "Submitted the task type for academic approval"),
  fixed(["APPROVED"], "Approved and activated task type", "Duyệt và kích hoạt dạng bài", "Approved and activated the task type"),
  fixed(["PUBLISHED"], "Published task type runtime catalog entry", "Phát hành dạng bài vào danh mục chạy bài", "Published the task type to the runtime catalog"),
];

