/**
 * Vietnamese messages for question generation feature
 * All user-facing strings are centralized here per CODING_STANDARDS_WEB.md
 */
export const generationMessages = {
  // Feature flag & permissions
  featureDisabled: "Tính năng tạo câu hỏi bằng AI hiện không khả dụng",
  featureDisabledTooltip:
    "Tính năng tạo câu hỏi bằng AI đang bảo trì. Vui lòng thử lại sau.",
  permissionDenied: "Bạn không có quyền tạo câu hỏi",

  // Drawer: Header
  drawerTitle: "Tạo đề bằng AI",
  drawerDescription: "Tạo câu hỏi chất lượng cao một cách tự động",

  // Drawer: Form Steps
  skillLabel: "Kỹ năng",
  taskTypeLabel: "Dạng bài",
  cefrLevelLabel: "Cấp CEFR",
  poolLabel: "Pool",
  topicLabel: "Chủ đề (Tùy chọn)",
  countLabel: "Số lượng câu hỏi",
  topicPlaceholder: "VD: Công nghệ, Môi trường, Giáo dục",
  topicHint: "Tối đa 200 ký tự",

  // Skills
  skillSpeaking: "Speaking",
  skillWriting: "Writing",
  skillReading: "Reading",
  skillListening: "Listening",

  // Pools
  poolPractice: "Luyện tập",
  poolExam: "Kiểm tra",

  // CEFR Levels
  cefrA1: "A1",
  cefrA2: "A2",
  cefrB1: "B1",
  cefrB2: "B2 (Mặc định)",
  cefrC1: "C1",
  cefrC2: "C2",

  // Form validation
  skillRequired: "Vui lòng chọn kỹ năng",
  taskTypeRequired: "Vui lòng chọn dạng bài",
  cefrLevelRequired: "Vui lòng chọn cấp CEFR",
  poolRequired: "Vui lòng chọn pool",
  countInvalid: "Vui lòng nhập số từ 1 đến 10",
  topicTooLong: "Chủ đề không được vượt quá 200 ký tự",

  // Info panel
  estimatedTimePerQuestion: "≈ 1–2 phút mỗi câu",
  quotaLabel: "Lượt hôm nay",
  quotaWarning: "{used}/{limit} câu hỏi đã dùng",
  quotaExceeded: "Hết lượt hôm nay. Bạn còn có thể tạo {remaining} câu nữa.",

  // Form actions
  cancelButton: "Hủy",
  startButton: "Bắt đầu tạo",
  startingGenerationMessage: "Đang bắt đầu tạo câu hỏi...",

  // Progress tray
  generatingTitle: "Đang tạo",
  generationProgressLabel: "{completed}/{total}",
  successCount: "{count} ✓",
  failureCount: "{count} ✗",
  expandButton: "Mở rộng",
  collapseButton: "Thu gọn",
  cancelGenerationButton: "Hủy",
  reviewQuestionsButton: "Duyệt {count} câu →",

  // Progress steps
  stepQueued: "Chờ xử lý",
  stepGenerating: "Đang viết",
  stepValidating: "Đang kiểm tra",
  stepReviewing: "Đang duyệt",
  stepRenderingMedia: "Đang tạo media",
  stepSaved: "Đã lưu",
  stepFailed: "Thất bại",

  // Failure codes & reasons
  failureReasonValidation: "Kiểm tra không đạt",
  failureReasonReview: "Reviewer từ chối câu này",
  failureReasonMedia: "Tạo media thất bại",
  failureReasonProvider: "Lỗi AI",
  failureReasonQuota: "Hết lượt",
  failureReasonUnknown: "Lỗi không xác định",

  // Failure code translations (from backend)
  failureCodeValidationFailed: "Kiểm tra không đạt",
  failureCodeReviewFailed: "Duyệt không đạt",
  failureCodeMediaRenderingFailed: "Tạo media thất bại",
  failureCodeAiProviderError: "Lỗi AI",
  failureCodeQuotaExceeded: "Hết lượt",

  // Cancel confirmation
  cancelConfirmTitle: "Hủy tạo câu hỏi?",
  cancelConfirmMessage: "Hành động này sẽ dừng quá trình tạo. Những câu hỏi chưa được lưu sẽ bị xóa.",
  cancelConfirmButton: "Hủy tạo",
  cancelCancelButton: "Tiếp tục",

  // Review page
  reviewPageTitle: "Duyệt câu hỏi AI",
  reviewPageDescription: "Duyệt từng câu hỏi trước khi thêm vào ngân hàng đề",

  // Review page: List
  questionIndexLabel: "#",
  questionTopicLabel: "Chủ đề",
  questionVerdictLabel: "Trạng thái",
  verdictPass: "Đạt",
  verdictFail: "Không đạt",

  // Review page: Preview tab
  previewTabLabel: "Xem trước",
  previewLoadingMessage: "Đang tải xem trước...",
  previewErrorMessage: "Không thể tải xem trước",
  missingMediaNote: "Media chưa được tạo",

  // Review page: Review AI tab
  reviewAiTabLabel: "Duyệt AI",
  reviewCheckTitle: "Kiểm tra AI",
  checkTaskFidelity: "Độ trung thực dạng bài",
  checkCefrFit: "Độ phù hợp CEFR",
  checkAnswerKey: "Đáp án",
  checkScorability: "Khả năng chấm",
  checkClarity: "Tính rõ ràng",
  checkSafety: "An toàn",
  checkOk: "✓ Đạt",
  checkFailed: "✗ Không đạt",
  reviewNotesLabel: "Ghi chú duyệt",
  verdictLabel: "Kết luận",
  estimatedCefrLabel: "CEFR ước lượng",
  fixSuggestionLabel: "Đề xuất sửa",
  metricsLabel: "Chỉ số (Tham khảo)",
  keyPointsLabel: "Điểm chính",
  mediaInfoLabel: "Media",

  // Review page: Edit tab
  editTabLabel: "Sửa",

  // Review page: Actions
  submitButton: "Gửi duyệt",
  editButton: "Sửa",
  deleteButton: "Xóa",
  deleteConfirmTitle: "Xóa câu hỏi?",
  deleteConfirmMessage: "Hành động này không thể hoàn tác.",

  // Review page: Bulk actions
  bulkSubmitAllLabel: "Gửi duyệt tất cả câu đạt",
  bulkSubmitAllDescription: "Sẽ gửi duyệt {count} câu hỏi",
  bulkSubmitAllConfirmMessage: "Gửi duyệt {count} câu hỏi đạt?",
  bulkDeleteLabel: "Xóa các câu đã chọn",
  bulkDeleteDescription: "Sẽ xóa vĩnh viễn {count} câu hỏi",
  bulkDeleteConfirmMessage: "Xóa {count} câu hỏi? Hành động này không thể hoàn tác.",
  noBulkSelectableQuestions: "Không có câu nào đạt để gửi duyệt",

  // Review page: Keyboard shortcuts
  shortcutNavigateUp: "Nhấn ↑ để xem câu trước",
  shortcutNavigateDown: "Nhấn ↓ để xem câu tiếp",
  shortcutNavigateHint: "Dùng phím mũi tên để chuyển câu khi danh sách được focus",

  // States
  emptyStateTitle: "Chưa có lượt tạo nào",
  emptyStateDescription: "Tạo bộ câu hỏi đầu tiên bằng nút \"Tạo bằng AI\"",
  emptyStateButtonLabel: "Tạo câu hỏi",

  // Questions list integration
  aiGeneratedBadge: "AI tạo",
  filterAll: "Tất cả",
  filterAiGenerated: "AI tạo",
  filterManual: "Tạo thủ công",

  // Errors
  jobNotFound: "Không tìm thấy lượt tạo",
  jobError: "Lỗi khi tải dữ liệu lượt tạo",
  quotaLoadError: "Không thể tải thông tin lượt",
  taskTypesLoadError: "Không thể tải danh sách dạng bài",
  fetchQuestionsError: "Không thể tải danh sách câu hỏi",
} as const;
