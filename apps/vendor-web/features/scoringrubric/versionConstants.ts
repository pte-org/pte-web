export const RUBRIC_EDIT_CONFIG = { basePath: "/admin/scoring-rubric/versions", minWeight: 0, maxWeight: 10,
  maxWords: 600, maxReason: 1000 } as const;
export const RUBRIC_EDIT_TEXT = {
  vi: {
    title: "Phiên bản rubric", create: "Tạo nháp từ bản đang hiệu lực", clone: "Tạo phiên bản mới từ bản này", open: "Mở",
    save: "Lưu bản nháp", submit: "Gửi duyệt", activate: "Kích hoạt", reject: "Từ chối", discard: "Bỏ bản nháp",
    status: "Trạng thái", version: "Phiên bản", task: "Dạng bài", weight: "Trọng số", defaultWeight: "Trọng số tham chiếu Pearson",
    words: "Số từ", min: "Tối thiểu", max: "Tối đa", band: "Band Form", gate: "Bật điều kiện chặn", gateWarning: "Tắt điều kiện chặn có thể làm thay đổi điểm câu.",
    perWord: "Tiêu chí này theo độ dài đoạn văn: trọng số chỉnh được, thang động.", pending: "Bản này đang chờ duyệt và không thể chỉnh sửa.",
    readonly: "Phiên bản đã kích hoạt chỉ đọc. Tạo phiên bản mới để thay đổi tham số.", invalid: "Kiểm tra trọng số và khoảng số từ: không được chồng lấn, phải có band tối đa.",
    error: "Không thể xử lý rubric. Tải lại phiên bản và thử lại.", stale: "Phiên bản hoặc diff đã thay đổi. Xem lại và xác nhận diff mới.",
    diff: "So sánh với bản đang hiệu lực", path: "Tham số", before: "Trước", after: "Sau", noChanges: "Không có thay đổi tham số.",
    confirm: "Tôi đã đọc và xác nhận các thay đổi này.", cancel: "Hủy", reason: "Lý do từ chối", history: "Lịch sử kích hoạt", actor: "Người kích hoạt", time: "Thời điểm",
    emptyHistory: "Chưa có lần kích hoạt.", unsaved: "Lưu bản nháp trước khi gửi duyệt hoặc kích hoạt.", empty: "Không có phiên bản rubric.",
  },
  en: {
    title: "Rubric versions", create: "Draft from the active version", clone: "Create a new version from this one", open: "Open",
    save: "Save draft", submit: "Submit for review", activate: "Activate", reject: "Reject", discard: "Discard draft",
    status: "Status", version: "Version", task: "Task type", weight: "Weight", defaultWeight: "Pearson reference weight",
    words: "Word count", min: "Minimum", max: "Maximum", band: "Form band", gate: "Enable gate", gateWarning: "Disabling a gate may change item scores.",
    perWord: "This trait follows passage length: its weight is editable and its scale is dynamic.", pending: "This version is pending review and cannot be edited.",
    readonly: "Activated versions are read-only. Create a new version to change parameters.", invalid: "Check weights and word ranges: no overlaps and at least one maximum band are required.",
    error: "Unable to process the rubric. Reload the version and try again.", stale: "The version or diff changed. Review and confirm the new diff.",
    diff: "Compare with the active version", path: "Parameter", before: "Before", after: "After", noChanges: "No parameter changes.",
    confirm: "I have read and confirm these changes.", cancel: "Cancel", reason: "Rejection reason", history: "Activation history", actor: "Activated by", time: "Time",
    emptyHistory: "No activations yet.", unsaved: "Save the draft before submitting or activating.", empty: "No rubric versions.",
  },
} as const;
