export const RUBRIC_EDIT_CONFIG = { basePath: "/admin/scoring-rubric/versions", minWeight: 0, maxWeight: 10,
  maxWords: 600, maxReason: 1000 } as const;
/** The version states in which the numbers can still be changed. */
export const EDITABLE_STATUSES: readonly string[] = ["DRAFT", "REJECTED"];
/** One version: its task types to read. */
export const versionDetailHref = (id: string): string => `${RUBRIC_EDIT_CONFIG.basePath}/${id}`;
/** One version: the editor, where numbers change and the version goes to review. */
export const versionEditHref = (id: string): string => `${RUBRIC_EDIT_CONFIG.basePath}/${id}/edit`;
export const RUBRIC_EDIT_TEXT = {
  vi: {
    title: "Phiên bản rubric", create: "Tạo nháp từ bản đang hiệu lực", clone: "Tạo phiên bản mới từ bản này", open: "Mở",
    save: "Lưu", notSaved: "Chưa lưu", moreActions: "Thao tác khác", submit: "Gửi duyệt", activate: "Kích hoạt", reject: "Từ chối", discard: "Bỏ bản nháp",
    status: "Trạng thái", version: "Phiên bản", task: "Dạng bài", weight: "Trọng số", defaultWeight: "Trọng số tham chiếu Pearson",
    words: "Số từ", min: "Tối thiểu", max: "Tối đa", band: "Band Form", gate: "Bật điều kiện chặn", gateWarning: "Tắt điều kiện chặn có thể làm thay đổi điểm câu.",
    perWord: "Tiêu chí này theo độ dài đoạn văn: trọng số chỉnh được, thang động.", pending: "Bản này đang chờ duyệt và không thể chỉnh sửa.",
    readonly: "Phiên bản đã kích hoạt chỉ đọc. Tạo phiên bản mới để thay đổi tham số.", invalid: "Kiểm tra trọng số và khoảng số từ: không được chồng lấn, phải có band tối đa.",
    error: "Không thể xử lý rubric. Tải lại phiên bản và thử lại.", stale: "Phiên bản hoặc diff đã thay đổi. Xem lại và xác nhận diff mới.",
    diff: "So sánh với bản đang hiệu lực", path: "Tham số", before: "Trước", after: "Sau", noChanges: "Không có thay đổi tham số.",
    confirm: "Tôi đã đọc và xác nhận các thay đổi này.", cancel: "Hủy", reason: "Lý do từ chối", history: "Lịch sử kích hoạt", actor: "Người kích hoạt", time: "Thời điểm",
    emptyHistory: "Chưa có lần kích hoạt.", actionsHeader: "Thao tác", rowActions: "Thao tác phiên bản", searchVersions: "Tìm theo phiên bản hoặc trạng thái", allStatuses: "Tất cả trạng thái", lastChange: "Cập nhật gần nhất", updatedBy: "Người cập nhật", view: "Xem", editVersion: "Chỉnh sửa",
    statusDRAFT: "Bản nháp", statusPENDING: "Chờ duyệt", statusACTIVE: "Đang hiệu lực", statusREJECTED: "Bị từ chối", statusRETIRED: "Đã ngừng",
    discardTitle: "Bỏ bản nháp này?", discardBody: "Bản nháp và các thay đổi chưa kích hoạt trong đó sẽ bị xóa. Bản đang hiệu lực không đổi.",
    review: "Xem xét và duyệt", cloneVersion: "Tạo bản nháp từ phiên bản này", reasonLabel: "Lý do kích hoạt", reasonColumn: "Lý do",
    impactTitle: "Điểm mẫu trước và sau khi đổi", impactLoading: "Đang tính điểm mẫu…",
    impactError: "Không tính được điểm mẫu, hãy ghi lý do kích hoạt.", scenario: "Câu mẫu", scoreShift: "Chênh",
    scenarioMax: "Mọi tiêu chí ở mức cao nhất", scenarioMid: "Mọi tiêu chí ở mức giữa",
    scenarioChanged: "Giỏi tiêu chí vừa đổi, yếu các tiêu chí còn lại",
    scopeWarning: "Bản này chỉ áp dụng cho đề thi tạo sau khi kích hoạt. Đề thi và bài đã chấm trước đó giữ nguyên điểm.",
    bigSwing: "Điểm mẫu lệch tới {points} điểm trên thang 100. Hãy ghi lý do để người sau hiểu vì sao đổi.",
    changeWeight: "trọng số", changeScale: "thang điểm", changeGate: "điều kiện chặn", changeForm: "Band Form, khoảng số từ",
    on: "Bật", off: "Tắt", change: "Thay đổi", taskTypeColumn: "Dạng bài", empty: "Không có phiên bản rubric.",
  },
  en: {
    title: "Rubric versions", create: "Draft from the active version", clone: "Create a new version from this one", open: "Open",
    save: "Save", notSaved: "Unsaved", moreActions: "More actions", submit: "Submit for review", activate: "Activate", reject: "Reject", discard: "Discard draft",
    status: "Status", version: "Version", task: "Task type", weight: "Weight", defaultWeight: "Pearson reference weight",
    words: "Word count", min: "Minimum", max: "Maximum", band: "Form band", gate: "Enable gate", gateWarning: "Disabling a gate may change item scores.",
    perWord: "This trait follows passage length: its weight is editable and its scale is dynamic.", pending: "This version is pending review and cannot be edited.",
    readonly: "Activated versions are read-only. Create a new version to change parameters.", invalid: "Check weights and word ranges: no overlaps and at least one maximum band are required.",
    error: "Unable to process the rubric. Reload the version and try again.", stale: "The version or diff changed. Review and confirm the new diff.",
    diff: "Compare with the active version", path: "Parameter", before: "Before", after: "After", noChanges: "No parameter changes.",
    confirm: "I have read and confirm these changes.", cancel: "Cancel", reason: "Rejection reason", history: "Activation history", actor: "Activated by", time: "Time",
    emptyHistory: "No activations yet.", actionsHeader: "Actions", rowActions: "Version actions", searchVersions: "Search by version or status", allStatuses: "All statuses", lastChange: "Last change", updatedBy: "Updated by", view: "View", editVersion: "Edit",
    statusDRAFT: "Draft", statusPENDING: "Pending review", statusACTIVE: "Active", statusREJECTED: "Rejected", statusRETIRED: "Retired",
    discardTitle: "Discard this draft?", discardBody: "The draft and the changes in it that were never activated will be deleted. The active version is not affected.",
    review: "Review and approve", cloneVersion: "Create a draft from this version", reasonLabel: "Reason for activating", reasonColumn: "Reason",
    impactTitle: "Sample scores before and after the change", impactLoading: "Calculating sample scores…",
    impactError: "Sample scores could not be calculated; please give a reason for activating.", scenario: "Sample answer", scoreShift: "Shift",
    scenarioMax: "Every trait at the top level", scenarioMid: "Every trait at the middle level",
    scenarioChanged: "Strong in the changed traits, weak in the rest",
    scopeWarning: "This version applies only to exams created after it is activated. Existing exams and answers already scored keep their scores.",
    bigSwing: "A sample score moves by up to {points} points out of 100. Please give a reason so others understand the change.",
    changeWeight: "weight", changeScale: "scale", changeGate: "gate", changeForm: "Form band, word range",
    on: "On", off: "Off", change: "Change", taskTypeColumn: "Task type", empty: "No rubric versions.",
  },
} as const;
