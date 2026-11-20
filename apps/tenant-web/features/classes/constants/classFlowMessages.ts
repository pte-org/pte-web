/**
 * Bilingual copy for the roster, create/split/merge/transfer modals and the
 * non-ACTIVE target guard. Resolved through `useClassFlowText`
 * (`tenant.classFlows.{key}`), with the locale catalog as fallback.
 *
 * Placeholders: `{label}` (org class label as configured), `{labelLower}`,
 * `{labels}` / `{labelsLower}` (English plural), plus per-key values.
 */
export const CLASS_FLOW_EN = {
  cancel: "Cancel",
  done: "Done",
  // Roster
  exportButton: "Export to Excel",
  rosterLoadFailed: "Couldn't load this. Check the link and your access, then try again.",
  rowActionsLabel: "Actions: {name}",
  rowViewDetail: "View details",
  exportFileName: "{className} - Students - {date}",
  rowTransfer: "Transfer",
  rowUnassign: "Unassign",
  unassignTitle: "Unassign student?",
  unassignDescription:
    'Unassign {student} from "{className}"? They will lose access to any future exams scheduled for this roster.',
  unassignConfirm: "Unassign",
  selectedCount: "{count} selected",
  // Split
  splitStart: "Split {label}",
  splitConfirm: "Split Selected",
  splitTitle: "Split {label}",
  splitNameLabel: "New {labelLower} name",
  splitNamePlaceholder: "e.g. 12A2",
  splitMovingCount: "{count} student(s) will move to the new {labelLower}.",
  splitSubmit: "Split",
  splitSubmitting: "Splitting...",
  splitSuccess: '{count} student(s) moved to "{className}".',
  splitNameRequired: "New {labelLower} name is required.",
  // Create
  createTitle: "Create {label}",
  createNameLabel: "{label} name",
  createNamePlaceholder: "e.g. 12A1",
  createSubmit: "Create {label}",
  createSubmitting: "Creating...",
  nameRequired: "{label} name is required.",
  programRequired: "Select a {program} first.",
  // Merge
  mergeStart: "Merge {labels}",
  mergeConfirm: "Merge Selected",
  mergeTitle: "Merge {labels}",
  mergeDestination: "Merge into which {labelLower}?",
  mergeSources:
    "The rest will be merged into it and their students moved. Source {labelLower}(s) are not removed automatically. Remove them separately afterward if needed.",
  mergeSubmit: "Merge",
  mergeSubmitting: "Merging...",
  mergeSuccess: "{count} student(s) moved.",
  // Transfer
  transferTitle: "Transfer from {label}",
  transferTarget: "Target {label}",
  transferTargetPlaceholder: "Select a {labelLower}",
  transferSubmit: "Transfer",
  transferSubmitting: "Transferring...",
  pendingEnrollmentTitle: "This student has upcoming exam enrollment(s)",
  pendingEnrollmentText:
    "Transferring will not change or cancel these — the Host may want to review them separately:",
  // Non-active target guard
  nonActiveChip: "Not active",
  nonActiveBody:
    '"{name}" is not active. New students cannot be assigned to it, and any exam scheduled for it may be paused.',
  typeToConfirm: "Type {name} to confirm",
  mismatchHint: 'The text must match "{name}" exactly.',
  // Pick program (empty class list)
  pickProgramHeading: "No {labelsLower} yet",
  pickProgramSubheading: "Each row is a {program} you can add a {labelLower} to.",
  pickProgramRowCta: "+ Add {label}",
};

export type ClassFlowMessages = Record<keyof typeof CLASS_FLOW_EN, string>;

export const CLASS_FLOW_VI: ClassFlowMessages = {
  cancel: "Hủy",
  done: "Xong",
  exportButton: "Xuất Excel",
  rosterLoadFailed:
    "Không thể tải dữ liệu. Hãy kiểm tra đường dẫn và quyền truy cập, rồi thử lại.",
  rowActionsLabel: "Thao tác: {name}",
  rowViewDetail: "Xem chi tiết",
  exportFileName: "{className} - Danh sách học viên - {date}",
  rowTransfer: "Chuyển lớp",
  rowUnassign: "Gỡ khỏi lớp",
  unassignTitle: "Gỡ học viên khỏi lớp?",
  unassignDescription:
    'Gỡ {student} khỏi "{className}"? Học viên sẽ mất quyền truy cập các kỳ thi sắp tới đã lên lịch cho danh sách này.',
  unassignConfirm: "Gỡ khỏi lớp",
  selectedCount: "Đã chọn {count}",
  splitStart: "Tách {labelLower}",
  splitConfirm: "Tách mục đã chọn",
  splitTitle: "Tách {labelLower}",
  splitNameLabel: "Tên {labelLower} mới",
  splitNamePlaceholder: "Ví dụ: 12A2",
  splitMovingCount: "{count} học viên sẽ được chuyển sang {labelLower} mới.",
  splitSubmit: "Tách",
  splitSubmitting: "Đang tách...",
  splitSuccess: 'Đã chuyển {count} học viên sang "{className}".',
  splitNameRequired: "Vui lòng nhập tên {labelLower} mới.",
  createTitle: "Tạo {labelLower}",
  createNameLabel: "Tên {labelLower}",
  createNamePlaceholder: "Ví dụ: 12A1",
  createSubmit: "Tạo {labelLower}",
  createSubmitting: "Đang tạo...",
  nameRequired: "Vui lòng nhập tên {labelLower}.",
  programRequired: "Vui lòng chọn {program} trước.",
  mergeStart: "Gộp {labelLower}",
  mergeConfirm: "Gộp mục đã chọn",
  mergeTitle: "Gộp {labelLower}",
  mergeDestination: "Gộp vào {labelLower} nào?",
  mergeSources:
    "Các {labelLower} còn lại sẽ được gộp vào và học viên được chuyển sang. {label} nguồn không bị xóa tự động. Hãy gỡ bỏ riêng sau đó nếu cần.",
  mergeSubmit: "Gộp",
  mergeSubmitting: "Đang gộp...",
  mergeSuccess: "Đã chuyển {count} học viên.",
  transferTitle: "Chuyển khỏi {labelLower}",
  transferTarget: "{label} đích",
  transferTargetPlaceholder: "Chọn {labelLower}",
  transferSubmit: "Chuyển lớp",
  transferSubmitting: "Đang chuyển...",
  pendingEnrollmentTitle: "Học viên này có lượt đăng ký kỳ thi sắp diễn ra",
  pendingEnrollmentText:
    "Việc chuyển lớp sẽ không thay đổi hay hủy các lượt đăng ký này — Host có thể muốn xem xét riêng:",
  nonActiveChip: "Không hoạt động",
  nonActiveBody:
    '"{name}" không ở trạng thái hoạt động. Không thể phân công học viên mới và các kỳ thi đã lên lịch có thể bị tạm dừng.',
  typeToConfirm: "Nhập {name} để xác nhận",
  mismatchHint: 'Nội dung phải khớp chính xác với "{name}".',
  pickProgramHeading: "Chưa có {labelLower} nào",
  pickProgramSubheading: "Mỗi dòng là một {program} bạn có thể thêm {labelLower} vào.",
  pickProgramRowCta: "+ Thêm {labelLower}",
};
