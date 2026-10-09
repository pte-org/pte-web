"use client";

import { useMemo } from "react";
import { useLocale, type Locale } from "@pte/ui";

/**
 * Feature copy in vendor-web predates the shared locale provider and is kept
 * in feature constants so that API/domain code does not depend on UI locale.
 * This dictionary is the single adapter between those constants and the
 * shared VI/EN switch. API values (codes, enum keys, names and identifiers)
 * are deliberately not passed through this helper.
 */
const ADMIN_VI: Record<string, string> = {
  "Welcome Back": "Chào mừng trở lại",
  "Please enter your institutional credentials to continue.":
    "Vui lòng nhập thông tin đăng nhập của tổ chức để tiếp tục.",
  "Ready to Manage?": "Sẵn sàng quản lý?",
  "Sign in to access your institutional dashboard, manage exams, and track your results.":
    "Đăng nhập để truy cập bảng điều khiển tổ chức, quản lý kỳ thi và theo dõi kết quả.",
  Username: "Tên đăng nhập",
  Organization: "Tổ chức",
  "Select your organization": "Chọn tổ chức",
  "Please select your organization.": "Vui lòng chọn tổ chức.",
  Password: "Mật khẩu",
  "Forgot password?": "Quên mật khẩu?",
  Login: "Đăng nhập",
  "Signing in...": "Đang đăng nhập...",
  "Show password": "Hiện mật khẩu",
  "Hide password": "Ẩn mật khẩu",
  "Please enter username and password.": "Vui lòng nhập tên đăng nhập và mật khẩu.",
  "Username or password is incorrect.": "Tên đăng nhập hoặc mật khẩu không đúng.",
  "This account is not allowed to use the vendor portal.":
    "Tài khoản này không được phép sử dụng cổng quản trị.",
  "Login failed. Please try again.": "Đăng nhập thất bại. Vui lòng thử lại.",

  "Good morning, Administrator": "Chào buổi sáng, Quản trị viên",
  "Add Tenant": "Thêm tenant",
  "System Notice": "Thông báo hệ thống",
  "The system is operating normally. The next scheduled maintenance window is Sunday, 00:00 - 04:00 (GMT+7).":
    "Hệ thống đang hoạt động bình thường. Khung bảo trì tiếp theo là Chủ nhật, 00:00 - 04:00 (GMT+7).",
  "Recently Updated Tenants": "Tenant cập nhật gần đây",
  "View all ->": "Xem tất cả ->",
  "Total Tenants": "Tổng số tenant",
  "Active Learners": "Học viên đang hoạt động",
  "Tenants Expiring Soon": "Tenant sắp hết hạn",
  "Renewal required": "Cần gia hạn",
  "Tenant Distribution": "Phân bổ tenant",
  Mapped: "Đã gắn vị trí",
  "New tenants will appear on the map after a province or city is selected in the tenant creation form.":
    "Tenant mới sẽ xuất hiện trên bản đồ sau khi chọn tỉnh hoặc thành phố trong biểu mẫu tạo tenant.",
  "Vietnam map showing tenant locations": "Bản đồ Việt Nam hiển thị vị trí tenant",
  tenant: "tenant",
  "Tenant Details": "Chi tiết tenant",
  "Tenant Name": "Tên tenant",
  Slug: "Slug",
  "Login Email": "Email đăng nhập",
  Plan: "Gói",
  Status: "Trạng thái",
  "Seats Used/Total": "Số chỗ đã dùng/Tổng số",
  "Activated On": "Ngày kích hoạt",
  "Expires On": "Ngày hết hạn",
  Location: "Địa điểm",
  Close: "Đóng",
  Actions: "Thao tác",

  "Platform settings": "Cài đặt nền tảng",
  "Commercial defaults": "Thiết lập thương mại mặc định",
  "Loading settings...": "Đang tải cài đặt...",
  Save: "Lưu",
  "Settings could not be loaded or saved.": "Không thể tải hoặc lưu cài đặt.",
  "Tenant applications": "Đơn đăng ký tenant",
  "Filter applications by status": "Lọc đơn đăng ký theo trạng thái",
  "All statuses": "Tất cả trạng thái",
  Pending: "Đang chờ",
  Approved: "Đã duyệt",
  Rejected: "Bị từ chối",
  Contact: "Liên hệ",
  Type: "Loại",
  "Tax code": "Mã số thuế",
  "Applications could not be loaded. Try again shortly.":
    "Không thể tải danh sách đơn đăng ký. Vui lòng thử lại sau.",
  Retry: "Thử lại",
  "Total applications": "Tổng số đơn đăng ký",
  "Needs review": "Cần xem xét",
  "No applications found": "Không tìm thấy đơn đăng ký",
  "Try another status filter.": "Hãy thử bộ lọc trạng thái khác.",
  "Loading application...": "Đang tải đơn đăng ký...",
  "Back to applications": "Quay lại danh sách đơn đăng ký",
  "This application was not found or is no longer available.":
    "Không tìm thấy đơn đăng ký hoặc đơn không còn khả dụng.",
  "The application could not be updated. Please try again.":
    "Không thể cập nhật đơn đăng ký. Vui lòng thử lại.",
  "Application details": "Chi tiết đơn đăng ký",
  "Review decision": "Quyết định xét duyệt",
  "Current status": "Trạng thái hiện tại",
  "Rejection reason": "Lý do từ chối",
  "Explain what must be corrected": "Giải thích nội dung cần chỉnh sửa",
  "Approving...": "Đang duyệt...",
  "Approve application": "Duyệt đơn đăng ký",
  "Rejecting...": "Đang từ chối...",
  "Reject application": "Từ chối đơn đăng ký",
  "Organization type": "Loại tổ chức",
  "Requested tenant code": "Mã tenant yêu cầu",
  "Work email": "Email công việc",
  "Phone number": "Số điện thoại",
  "Reviewed by": "Người xét duyệt",
  "Reviewed at": "Thời điểm xét duyệt",

  "Plan catalog": "Danh mục gói",
  "+ Add plan": "+ Thêm gói",
  "Total plans": "Tổng số gói",
  "Active plans": "Gói đang hoạt động",
  "Draft plans": "Gói bản nháp",
  "Edit plan": "Chỉnh sửa gói",
  "Create plan": "Tạo gói",
  General: "Thông tin chung",
  "Pricing & limits": "Giá và giới hạn",
  "Plan name": "Tên gói",
  "Plan type": "Loại gói",
  "Exam package": "Gói kỳ thi",
  "Student capacity": "Sức chứa học viên",
  Description: "Mô tả",
  Price: "Giá",
  Currency: "Đơn vị tiền tệ",
  "Duration (days)": "Thời hạn (ngày)",
  "Students per session": "Số học viên mỗi lượt",
  "Extra student slots": "Số chỗ học viên bổ sung",
  "Maximum 2,000 students.": "Tối đa 2.000 học viên.",
  "Catalog plans use VND. Legacy values are not converted automatically.":
    "Các gói trong danh mục sử dụng VND. Giá trị cũ không được tự động quy đổi.",
  "Save changes": "Lưu thay đổi",
  "Create draft": "Tạo bản nháp",
  Cancel: "Hủy",
  "Published catalog": "Danh mục đã phát hành",
  "Filter plans by type": "Lọc gói theo loại",
  All: "Tất cả",
  "Capacity add-ons": "Gói bổ sung sức chứa",
  Term: "Thời hạn",
  Capacity: "Sức chứa",
  Permanent: "Vĩnh viễn",
  Edit: "Chỉnh sửa",
  Activate: "Kích hoạt",
  Archive: "Lưu trữ",
  "Delete draft": "Xóa bản nháp",
  "Delete this draft?": "Xóa bản nháp này?",
  "No plans found": "Không tìm thấy gói nào",
  "Loading plans...": "Đang tải danh sách gói...",
  "Plans could not be loaded or saved.": "Không thể tải hoặc lưu danh sách gói.",
  "Plan updated.": "Đã cập nhật gói.",
  "Plan draft created.": "Đã tạo bản nháp gói.",
  "Plan activated.": "Đã kích hoạt gói.",
  "Plan archived.": "Đã lưu trữ gói.",

  "License codes": "Mã bản quyền",
  "Issue a code": "Phát hành mã",
  "Select active exam package": "Chọn gói kỳ thi đang hoạt động",
  "Refresh plans": "Làm mới danh sách gói",
  "Code expiry": "Thời hạn mã",
  "Recover issuance result": "Khôi phục kết quả phát hành",
  "Start a new issuance": "Bắt đầu phát hành mới",
  "Start another issuance?": "Bắt đầu một lần phát hành khác?",
  "Issue code": "Phát hành mã",
  "License inventory": "Kho mã bản quyền",
  "Masked code": "Mã đã ẩn",
  Recipient: "Bên nhận",
  "Public ID": "ID công khai",
  Issued: "Đã phát hành",
  Expires: "Hết hạn",
  Revoke: "Thu hồi",
  "Loading codes...": "Đang tải mã...",
  "No license codes found": "Không tìm thấy mã bản quyền",
  "No codes match these filters.": "Không có mã phù hợp với bộ lọc.",
  "Recipient tenant ID": "ID tenant nhận",
  "Apply filters": "Áp dụng bộ lọc",
  Reset: "Đặt lại",
  Previous: "Trước",
  Next: "Sau",
  "Refresh list": "Làm mới danh sách",
  "Find a code safely": "Tra cứu mã an toàn",
  "License code": "Mã bản quyền",
  Lookup: "Tra cứu",
  "Lookup result": "Kết quả tra cứu",
  "No matching code was found.": "Không tìm thấy mã phù hợp.",
  Reveal: "Hiển thị mã",
  "Reveal license code": "Hiển thị mã bản quyền",
  "Copy code": "Sao chép mã",
  "Code copied.": "Đã sao chép mã.",
  "Revoke license code?": "Thu hồi mã bản quyền?",
  "Revoke code": "Thu hồi mã",
  Subscription: "Gói đăng ký",
  "Code only": "Chỉ mã",
  "Exam subscription": "Gói đăng ký kỳ thi",
  "Scheduled sessions cancelled": "Số lượt đã lên lịch bị hủy",
  "Open sessions preserved": "Giữ nguyên lượt đang mở",
  "Closed sessions preserved": "Giữ nguyên lượt đã đóng",
  "Refresh preview": "Làm mới xem trước",
  "No scheduled sessions": "Không có lượt đã lên lịch",
  "Revoked by platform administrator": "Được thu hồi bởi quản trị viên nền tảng",

  "Task Type Catalog": "Danh mục dạng bài",
  "Create task type": "Tạo dạng bài",
  "Submit for approval": "Gửi duyệt",
  "Approve and activate": "Duyệt và kích hoạt",
  "Edit task type": "Chỉnh sửa dạng bài",
  "Task type created.": "Đã tạo dạng bài.",
  "Task type updated.": "Đã cập nhật dạng bài.",
  "Task type removed from the active catalog.": "Đã xóa dạng bài khỏi danh mục đang hoạt động.",
  "Could not load the task type catalog. Please refresh.":
    "Không thể tải danh mục dạng bài. Vui lòng làm mới.",
  "Task type": "Dạng bài",
  Section: "Phần thi",
  Requirements: "Yêu cầu",
  Scored: "Tính điểm",
  "Task type actions": "Thao tác dạng bài",
  "Search task types, keys, or sections": "Tìm dạng bài, mã hoặc phần thi",
  "Search task types": "Tìm dạng bài",
  "Filter task types by section": "Lọc dạng bài theo phần thi",
  "Filter task types by status": "Lọc dạng bài theo trạng thái",
  "Filter task types by scoring": "Lọc dạng bài theo tính điểm",
  "All sections": "Tất cả phần thi",
  "All scoring modes": "Tất cả chế độ tính điểm",
  Yes: "Có",
  No: "Không",
  "No task types are currently in the catalog.": "Hiện chưa có dạng bài trong danh mục.",
  "Loading task type catalog...": "Đang tải danh mục dạng bài...",
  "Prompt text": "Nội dung đề bài",
  Audio: "Âm thanh",
  Image: "Hình ảnh",
  Options: "Các lựa chọn",
  "Correct answer": "Đáp án đúng",
  "Word count": "Số từ",
  "Single correct": "Một đáp án đúng",
  "Ordered options": "Thứ tự lựa chọn",
  "Task type key": "Mã dạng bài",
  "Display name": "Tên hiển thị",
  "Short name": "Tên viết tắt",
  "Display order": "Thứ tự hiển thị",
  "Available for new questions": "Cho phép dùng cho câu hỏi mới",
  "Screen key": "Mã màn hình",
  "Contract version": "Phiên bản contract",
  "Select a released screen": "Chọn màn hình đã phát hành",
  "Select a contract version": "Chọn phiên bản contract",

  "Platform users": "Người dùng nền tảng",
  "Manage platform managers and academic staff accounts.":
    "Quản lý tài khoản quản lý nền tảng và nhân sự học thuật.",
  "Create platform user": "Tạo người dùng nền tảng",
  "Update platform roles": "Cập nhật vai trò nền tảng",
  Email: "Email",
  "Full name": "Họ và tên",
  "Temporary password": "Mật khẩu tạm thời",
  Role: "Vai trò",
  "Filter by role": "Lọc theo vai trò",
  "Filter by status": "Lọc theo trạng thái",
  "All roles": "Tất cả vai trò",
  "Platform user created.": "Đã tạo người dùng nền tảng.",
  "Platform roles updated.": "Đã cập nhật vai trò nền tảng.",
  "Platform user suspended.": "Đã tạm ngưng người dùng nền tảng.",
  "Platform user reactivated.": "Đã kích hoạt lại người dùng nền tảng.",
  "Loading platform users...": "Đang tải người dùng nền tảng...",
  "No platform users found.": "Không tìm thấy người dùng nền tảng.",
  "Unable to load platform users.": "Không thể tải người dùng nền tảng.",
  "Use at least 8 characters. The password is shown only during creation.":
    "Sử dụng ít nhất 8 ký tự. Mật khẩu chỉ hiển thị khi tạo mới.",
  Suspend: "Tạm ngưng",
  Reactivate: "Kích hoạt lại",
  "Update roles": "Cập nhật vai trò",
  "Platform manager": "Quản lý nền tảng",
  "Academic manager": "Quản lý học thuật",
  "Academic staff": "Nhân sự học thuật",
  Active: "Đang hoạt động",
  Suspended: "Đã tạm ngưng",
  "Expiring soon": "Sắp hết hạn",
  Expired: "Đã hết hạn",
  Inactive: "Không hoạt động",
  "Starter (500 users)": "Starter (500 người dùng)",
  "Professional (1000 users)": "Professional (1.000 người dùng)",
  "Enterprise (Unlimited)": "Enterprise (Không giới hạn)",

  "Question Bank": "Ngân hàng câu hỏi",
  "Add question": "Thêm câu hỏi",
  "Enter a code or question content...": "Nhập mã hoặc nội dung câu hỏi...",
  "Total questions": "Tổng số câu hỏi",
  Listening: "Nghe",
  Reading: "Đọc",
  Writing: "Viết",
  Speaking: "Nói",
  Draft: "Bản nháp",
  Publish: "Phát hành",
  "View details": "Xem chi tiết",
  "No questions found": "Không tìm thấy câu hỏi",
  "Clear filters": "Xóa bộ lọc",
  "Question information": "Thông tin câu hỏi",
  Identity: "Định danh",
  Classification: "Phân loại",
  "Question code": "Mã câu hỏi",
  Visibility: "Hiển thị",
  Revision: "Phiên bản chỉnh sửa",
  Prompt: "Đề bài",
  "Prompt media": "Tệp phương tiện của đề bài",
  Answers: "Đáp án",
  "Answer key": "Đáp án chuẩn",
  "New question": "Câu hỏi mới",
  "Create PTE Question": "Tạo câu hỏi PTE",
  "Minimum word count": "Số từ tối thiểu",
  "Maximum word count": "Số từ tối đa",
  "Add option": "Thêm lựa chọn",
  Remove: "Xóa",
  "Save Draft": "Lưu bản nháp",
  "Create Draft": "Tạo bản nháp",
  "Edit Question Revision": "Chỉnh sửa phiên bản câu hỏi",
  "Loading task types...": "Đang tải danh sách dạng bài...",
  Title: "Tiêu đề",
  "Audio prompt": "Âm thanh đề bài",
  "Image prompt": "Hình ảnh đề bài",
  "Question prompt preview": "Xem trước đề bài",
  "Reference answer": "Đáp án tham khảo",
  "Correct answer text": "Nội dung đáp án đúng",
  "Question created as a draft.": "Đã tạo câu hỏi ở trạng thái bản nháp.",
  "Question draft saved.": "Đã lưu bản nháp câu hỏi.",
  "Media upload failed. Please try again.": "Tải tệp phương tiện thất bại. Vui lòng thử lại.",
  "Task type configuration is unavailable. Please refresh and try again.":
    "Không có cấu hình dạng bài. Vui lòng làm mới và thử lại.",
  "Title is required.": "Tiêu đề là bắt buộc.",
  "Prompt text is required for this task.": "Dạng bài này yêu cầu nội dung đề bài.",
  "An audio prompt is required for this task.": "Dạng bài này yêu cầu âm thanh đề bài.",
  "An image prompt is required for this task.": "Dạng bài này yêu cầu hình ảnh đề bài.",
  "Minimum and maximum word counts are required for this task.":
    "Dạng bài này yêu cầu số từ tối thiểu và tối đa.",
  "A correct answer is required for this task.": "Dạng bài này yêu cầu đáp án đúng.",
  "Every option must contain text.": "Mỗi lựa chọn phải có nội dung.",
  "Select at least one correct option.": "Hãy chọn ít nhất một lựa chọn đúng.",
  "Single-choice tasks require exactly one correct option.":
    "Dạng bài một đáp án yêu cầu chính xác một lựa chọn đúng.",
  "Could not load task types. Please refresh.": "Không thể tải dạng bài. Vui lòng làm mới.",
  "Could not save the question. Check the required fields and try again.":
    "Không thể lưu câu hỏi. Hãy kiểm tra các trường bắt buộc và thử lại.",
  "Could not load this question.": "Không thể tải câu hỏi.",
  "Could not create a draft revision for this question.":
    "Không thể tạo phiên bản nháp cho câu hỏi này.",
  "This question is waiting for admin approval and cannot be edited yet.":
    "Câu hỏi đang chờ quản trị viên duyệt nên chưa thể chỉnh sửa.",
  "Archived questions cannot be edited.": "Câu hỏi đã lưu trữ không thể chỉnh sửa.",
  "Could not update this question's status. Please try again.":
    "Không thể cập nhật trạng thái câu hỏi. Vui lòng thử lại.",
  "Cloudinary upload failed": "Tải lên Cloudinary thất bại",

  "Exam Templates": "Mẫu bài thi",
  "Clone to new draft": "Nhân bản thành bản nháp mới",
  "Create template": "Tạo mẫu",
  Delete: "Xóa",
  "Create exam template": "Tạo mẫu bài thi",
  Code: "Mã",
  Name: "Tên",
  "Template policy": "Chính sách mẫu",
  "Standard PTE": "PTE tiêu chuẩn",
  "Custom task set": "Bộ dạng bài tùy chỉnh",
  "Custom templates may use selected task types without requiring the complete standard PTE catalog.":
    "Mẫu tùy chỉnh có thể dùng các dạng bài đã chọn mà không cần toàn bộ danh mục PTE tiêu chuẩn.",
  "Could not create this exam template.": "Không thể tạo mẫu bài thi này.",
  "Could not delete this exam template.": "Không thể xóa mẫu bài thi này.",
  "Delete this DRAFT exam template? This cannot be undone.":
    "Xóa mẫu bài thi BẢN NHÁP này? Thao tác không thể hoàn tác.",
  "Back to list": "Quay lại danh sách",
  View: "Xem",
  "Export JSON": "Xuất JSON",
  "Add task type": "Thêm dạng bài",
  "Select section first": "Chọn phần thi trước",
  "Select a task type": "Chọn dạng bài",
  DRAFT: "BẢN NHÁP",
  "No active task types are available in this section.":
    "Không có dạng bài đang hoạt động trong phần thi này.",
  "No active task types are available in the platform catalog. Ask a platform administrator to enable the standard catalog before editing this template.":
    "Không có dạng bài đang hoạt động trong danh mục nền tảng. Hãy nhờ quản trị viên bật danh mục tiêu chuẩn trước khi chỉnh sửa mẫu này.",
  "All active task types in this section are already in the template. Choose another section or remove one before adding it again.":
    "Tất cả dạng bài đang hoạt động trong phần thi này đã có trong mẫu. Hãy chọn phần thi khác hoặc xóa một dạng bài trước khi thêm lại.",
  "The available task types in this section are not compatible with the current app runtime. Ask the platform team to release support before using them.":
    "Các dạng bài khả dụng trong phần thi này không tương thích với runtime hiện tại. Hãy nhờ đội nền tảng phát hành hỗ trợ trước khi sử dụng.",
  "Task types come from the active platform catalog. Their screen, authoring, and scoring behavior comes from the released runtime contract.":
    "Dạng bài được lấy từ danh mục nền tảng đang hoạt động. Màn hình, cách nhập liệu và hành vi tính điểm do contract runtime đã phát hành quyết định.",
  "Could not load the active task type catalog. Please refresh before editing.":
    "Không thể tải danh mục dạng bài đang hoạt động. Vui lòng làm mới trước khi chỉnh sửa.",
  "This template cannot be activated until every selected task type has a supported active runtime profile. Review the task type catalog and try again.":
    "Không thể kích hoạt mẫu cho đến khi mọi dạng bài đã chọn có runtime profile đang hoạt động và được hỗ trợ. Hãy kiểm tra danh mục dạng bài rồi thử lại.",
  "This template cannot be activated until the question bank contains enough approved questions for every selected task type.":
    "Không thể kích hoạt mẫu cho đến khi ngân hàng câu hỏi có đủ câu hỏi đã duyệt cho mọi dạng bài đã chọn.",
  "The readiness check could not be completed. Refresh before activating this template.":
    "Không thể hoàn tất kiểm tra khả năng sẵn sàng. Vui lòng làm mới trước khi kích hoạt mẫu.",
  "Submit for review": "Gửi xét duyệt",
  Approve: "Duyệt",
  "Return for changes": "Yêu cầu chỉnh sửa",
  "Return template for changes": "Trả mẫu để chỉnh sửa",
  "Reason for returning": "Lý do yêu cầu chỉnh sửa",
  "Explain what the author should update.": "Giải thích nội dung tác giả cần cập nhật.",
  "Add a short reason before returning this template.":
    "Hãy thêm lý do ngắn trước khi trả mẫu để chỉnh sửa.",
  "Template submitted for platform admin review.":
    "Đã gửi mẫu để quản trị viên nền tảng xét duyệt.",
  "Template approved and returned to draft for activation.":
    "Mẫu đã được duyệt và chuyển về bản nháp để kích hoạt.",
  "Template returned to the author with your feedback.":
    "Mẫu đã được trả lại cho tác giả kèm phản hồi của bạn.",
  "Review feedback": "Phản hồi xét duyệt",
  "Activate this template?": "Kích hoạt mẫu này?",
  "The current ACTIVE template will be retired immediately. Every new exam published from now on uses this template's weights and timing — exams already published keep the template they were published with.":
    "Mẫu ĐANG HOẠT ĐỘNG hiện tại sẽ bị ngừng sử dụng ngay lập tức. Mọi kỳ thi phát hành sau thời điểm này sẽ dùng trọng số và thời lượng của mẫu này; các kỳ thi đã phát hành vẫn giữ mẫu cũ.",
  "This template is no longer editable — it stopped being a DRAFT (e.g. someone else activated a newer version). Reload the list to see the current state.":
    "Mẫu này không còn chỉnh sửa được vì không còn ở trạng thái BẢN NHÁP (ví dụ một người khác đã kích hoạt phiên bản mới hơn). Hãy làm mới danh sách để xem trạng thái hiện tại.",
  "Another admin changed this template's family at the same moment. Reload and try again.":
    "Một quản trị viên khác vừa thay đổi nhóm mẫu này. Hãy làm mới và thử lại.",
  "Could not load exam templates. Please refresh.": "Không thể tải mẫu bài thi. Vui lòng làm mới.",
  "Could not clone this template. Please try again.":
    "Không thể nhân bản mẫu này. Vui lòng thử lại.",
  "This exam template could not be found. Refresh the list and try again.":
    "Không tìm thấy mẫu bài thi. Hãy làm mới danh sách và thử lại.",
  "This template version is locked. Clone it to create a new editable version.":
    "Phiên bản mẫu này đã bị khóa. Hãy nhân bản để tạo phiên bản mới có thể chỉnh sửa.",
  "Another platform user changed this template. Refresh the page and review your changes again.":
    "Một người dùng nền tảng khác đã thay đổi mẫu này. Hãy làm mới trang và kiểm tra lại thay đổi.",
  "This template is already awaiting platform admin review.":
    "Mẫu này đang chờ quản trị viên nền tảng xét duyệt.",
  "This template is not ready yet. Review the selected task types, counts, timing, and skill weights.":
    "Mẫu chưa sẵn sàng. Hãy kiểm tra dạng bài, số lượng, thời lượng và trọng số kỹ năng đã chọn.",
  "One selected task type has no runtime profile. Ask the platform team to enable it before activating this template.":
    "Một dạng bài đã chọn chưa có runtime profile. Hãy nhờ đội nền tảng bật profile trước khi kích hoạt mẫu.",
  "One selected task type is retired for new templates. Choose an active standard task type.":
    "Một dạng bài đã chọn đã ngừng dùng cho mẫu mới. Hãy chọn dạng bài tiêu chuẩn đang hoạt động.",
  "One selected task type uses a runtime profile that the platform no longer supports. Ask the platform team to release support.":
    "Một dạng bài đã chọn dùng runtime profile không còn được nền tảng hỗ trợ. Hãy nhờ đội nền tảng phát hành hỗ trợ.",
  "This template is missing runtime information for one task type. Save it again or ask the platform team to repair the template.":
    "Mẫu đang thiếu thông tin runtime cho một dạng bài. Hãy lưu lại hoặc nhờ đội nền tảng sửa mẫu.",
  "One task type has an invalid runtime configuration. Ask the platform team to repair the catalog before activating this template.":
    "Một dạng bài có cấu hình runtime không hợp lệ. Hãy nhờ đội nền tảng sửa danh mục trước khi kích hoạt mẫu.",
  "One task type has an incompatible scoring configuration. Ask the platform team to publish a compatible template.":
    "Một dạng bài có cấu hình tính điểm không tương thích. Hãy nhờ đội nền tảng phát hành mẫu tương thích.",
  "This template contains a task type the platform no longer recognizes. Refresh the catalog before continuing.":
    "Mẫu chứa dạng bài mà nền tảng không còn nhận diện. Hãy làm mới danh mục trước khi tiếp tục.",
  "You do not have permission to perform this template action.":
    "Bạn không có quyền thực hiện thao tác này với mẫu.",
  Min: "Tối thiểu",
  "Prep (s)": "Chuẩn bị (giây)",
  "Response (s)": "Trả lời (giây)",
  "Overall %": "Tổng thể %",
  "Speaking %": "Nói %",
  "Writing %": "Viết %",
  "Reading %": "Đọc %",
  "Listening %": "Nghe %",
  "Pending approval": "Đang chờ duyệt",
  Retired: "Đã ngừng sử dụng",
  Version: "Phiên bản",
  Items: "Số mục",
  Policy: "Chính sách",

  Tenants: "Tenant",
  "Search by tenant name, code, or tax code": "Tìm theo tên, mã hoặc mã số thuế tenant",
  "Grant quota": "Cấp hạn mức",
  "View quota history": "Xem lịch sử hạn mức",
  "No tenants yet": "Chưa có tenant",
  "Start by adding the first partner or school to set up a managed learning environment.":
    "Hãy bắt đầu bằng cách thêm đối tác hoặc trường học đầu tiên để thiết lập môi trường học tập được quản lý.",
  "Tenant suspended.": "Đã tạm ngưng tenant.",
  "Tenant reactivated.": "Đã kích hoạt lại tenant.",
  "Tenant created.": "Đã tạo tenant.",
  "Tenant Code": "Mã tenant",
  "Organization Type": "Loại tổ chức",
  "Student Limit": "Giới hạn học viên",
  "All plans": "Tất cả gói",
  "All organization types": "Tất cả loại tổ chức",
  School: "Trường học",
  University: "Đại học",
  "Training Center": "Trung tâm đào tạo",
  Corporate: "Doanh nghiệp",
  "System Health": "Tình trạng hệ thống",
  "API Error Rate": "Tỷ lệ lỗi API",
  "AI Queue Depth": "Độ dài hàng đợi AI",
  exams: "kỳ thi",
  "Delivery Errors": "Lỗi phân phối",
  errors: "lỗi",
  "Server Status": "Trạng thái máy chủ",
  "All systems operational.": "Tất cả hệ thống đang hoạt động bình thường.",
  "View Logs": "Xem nhật ký",
  "Confirm Suspension": "Xác nhận tạm ngưng",
  "This action will temporarily stop access for users under this tenant. The license will remain frozen until reactivated.":
    "Thao tác này sẽ tạm dừng quyền truy cập của người dùng thuộc tenant này. Bản quyền sẽ được giữ nguyên cho đến khi tenant được kích hoạt lại.",
  "To confirm, enter the exact tenant name:": "Để xác nhận, hãy nhập chính xác tên tenant:",
  "Tenant name": "Tên tenant",
  "Enter tenant name to confirm": "Nhập tên tenant để xác nhận",
  "General Information": "Thông tin chung",
  "e.g. fpt-university": "Ví dụ: fpt-university",
  "3–32 lowercase letters, numbers, or hyphens. This code cannot change later.":
    "Từ 3–32 ký tự chữ thường, số hoặc dấu gạch ngang. Mã này không thể thay đổi sau đó.",
  "Enter school or organization name...": "Nhập tên trường học hoặc tổ chức...",
  "Select a type": "Chọn loại",
  "Enter the organization's tax code": "Nhập mã số thuế của tổ chức",
  "Required for organization verification.": "Bắt buộc để xác minh tổ chức.",
  "Select a plan": "Chọn gói",
  "e.g. 500": "Ví dụ: 500",
  "Create Tenant": "Tạo tenant",
  "Total tenants": "Tổng số tenant",
  "Active tenants": "Tenant đang hoạt động",
  "Suspended tenants": "Tenant đã tạm ngưng",
  "Tenant Created Successfully": "Tạo tenant thành công",
  "The new tenant has been added to the platform.": "Tenant mới đã được thêm vào nền tảng.",
  "Tenant information": "Thông tin tenant",
  "Plan & capacity": "Gói và sức chứa",
  "Tenant ID": "ID tenant",
  "Tenant code": "Mã tenant",
  "Student limit": "Giới hạn học viên",
  "White-Label Branding": "Thương hiệu white-label",
  "Logo URL": "URL logo",
  "Paste a link to an already-hosted image. File upload isn't available yet.":
    "Dán liên kết đến hình ảnh đã được lưu trữ. Tải tệp lên chưa khả dụng.",
  "Primary Color": "Màu chính",
  "Enter a 6-digit hex color like #1A2B3C.": "Nhập mã màu hex 6 ký tự, ví dụ #1A2B3C.",
  "Save Branding": "Lưu thương hiệu",
  "Branding saved.": "Đã lưu thương hiệu.",
  "Organization not provisioned": "Tổ chức chưa được khởi tạo",
  "A default organization is created automatically with the tenant.":
    "Một tổ chức mặc định sẽ được tự động tạo cùng tenant.",
  "Facility Type": "Loại cơ sở",
  Address: "Địa chỉ",
  "Main Campus": "Cơ sở chính",
  Branch: "Chi nhánh",
  "Test Center": "Trung tâm khảo thí",
  "Login Account": "Tài khoản đăng nhập",
  "No login account yet": "Chưa có tài khoản đăng nhập",
  "Create the Host's first login so they can sign in.":
    "Tạo tài khoản đăng nhập đầu tiên cho Host để họ có thể đăng nhập.",
  "Verifying the tenant's Host account...": "Đang xác minh tài khoản Host của tenant...",
  "The Host account could not be verified. Retry before changing credentials.":
    "Không thể xác minh tài khoản Host. Hãy thử lại trước khi thay đổi thông tin đăng nhập.",
  "More than one HOST_ADMIN account is linked to this tenant. Verify the target manually before creating or resetting an account.":
    "Có nhiều hơn một tài khoản HOST_ADMIN được liên kết với tenant này. Hãy xác minh thủ công tài khoản đích trước khi tạo hoặc đặt lại tài khoản.",
  "Create Login": "Tạo tài khoản đăng nhập",
  "Reset Password": "Đặt lại mật khẩu",
  Account: "Tài khoản",
  "Student info": "Thông tin học viên",
  Security: "Bảo mật",
  "User ID": "ID người dùng",
  Roles: "Vai trò",
  "Student code": "Mã học viên",
  "Class name": "Tên lớp",
  Phone: "Số điện thoại",
  "Date of birth": "Ngày sinh",
  "First-login password change": "Đổi mật khẩu lần đầu đăng nhập",
  Required: "Bắt buộc",
  "Not required": "Không bắt buộc",
  "Password reset. Relay it to the Host directly — it won't be shown again.":
    "Đã đặt lại mật khẩu. Hãy gửi trực tiếp cho Host vì mật khẩu sẽ không hiển thị lại.",
  "The reset result could not be confirmed. Verify the target account manually before trying again.":
    "Không thể xác nhận kết quả đặt lại. Hãy xác minh thủ công tài khoản đích trước khi thử lại.",
  "Initial Password": "Mật khẩu ban đầu",
  "At least 8 characters. Relay it to the Host directly.":
    "Ít nhất 8 ký tự. Hãy gửi trực tiếp cho Host.",
  "Full Name": "Họ và tên",
  "Enter the Host's name...": "Nhập tên Host...",
  "This email is already in use. Please use another email.":
    "Email này đã được sử dụng. Vui lòng dùng email khác.",
  "New Password": "Mật khẩu mới",
  "Resetting...": "Đang đặt lại...",
  "Target account": "Tài khoản đích",
  "Target name": "Tên tài khoản đích",
  "Target roles": "Vai trò tài khoản đích",
  "I confirm this is the account I intend to reset.": "Tôi xác nhận đây là tài khoản cần đặt lại.",
  "Confirm the tenant, username, and role before resetting the password.":
    "Hãy xác nhận tenant, tên đăng nhập và vai trò trước khi đặt lại mật khẩu.",

  Licenses: "Bản quyền",
  "No licenses found": "Không tìm thấy bản quyền",
  "Grant Quota": "Cấp hạn mức",
  "Added on top of the current student limit.": "Được cộng thêm vào giới hạn học viên hiện tại.",
  "This tenant's quota was just changed by someone else. Please review the current value and try again.":
    "Hạn mức của tenant vừa được người khác thay đổi. Hãy kiểm tra giá trị hiện tại và thử lại.",
  "No quota transactions yet.": "Chưa có giao dịch hạn mức.",

  "Export report": "Xuất báo cáo",
  Renew: "Gia hạn",
  "View History": "Xem lịch sử",
  "Export PDF": "Xuất PDF",
  "Total licenses": "Tổng số bản quyền",
  "Total student seats": "Tổng số chỗ học viên",
  Package: "Gói",
  "Select a package": "Chọn gói",
  "Additional Seats": "Số chỗ bổ sung",
  Note: "Ghi chú",
  "Optional reason for this grant...": "Lý do cấp hạn mức (không bắt buộc)...",
  "Quota History": "Lịch sử hạn mức",
  Date: "Ngày",
  Action: "Thao tác",
  Amount: "Số lượng",
  Granted: "Đã cấp",
  Deducted: "Đã trừ",
  Revoked: "Đã thu hồi",
  "All actions": "Tất cả thao tác",

  "Granting...": "Đang cấp hạn mức...",
  Impact: "Tác động",
  "Preview valid until": "Xem trước có hiệu lực đến",
  "Creating...": "Đang tạo...",
  "Saving...": "Đang lưu...",
  "Date range": "Khoảng thời gian",
  Hanoi: "Hà Nội",
  "Hai Phong": "Hải Phòng",
  "Da Nang": "Đà Nẵng",
  "Khanh Hoa": "Khánh Hòa",
  "Lam Dong": "Lâm Đồng",
  "Ho Chi Minh City": "Thành phố Hồ Chí Minh",
  "Can Tho": "Cần Thơ",
  "All facility types": "Tất cả loại cơ sở",
  "No organizations found": "Không tìm thấy tổ chức",
  "This field is required.": "Trường này là bắt buộc.",
  "Use 3–32 lowercase letters, numbers, or hyphens.":
    "Sử dụng 3–32 ký tự chữ thường, số hoặc dấu gạch ngang.",
  "Enter a whole number of at least 1.": "Nhập số nguyên ít nhất bằng 1.",
  "This tenant code already exists. Please use another code.":
    "Mã tenant này đã tồn tại. Vui lòng dùng mã khác.",
  "This tenant name already exists. Please use another name.":
    "Tên tenant này đã tồn tại. Vui lòng dùng tên khác.",
  "This tax code is already used by another tenant. Please check and try again.":
    "Mã số thuế này đã được tenant khác sử dụng. Hãy kiểm tra và thử lại.",
  "The tenant code or name already exists. Please check the information and try again.":
    "Mã hoặc tên tenant đã tồn tại. Hãy kiểm tra thông tin và thử lại.",
  "The tenant name already exists. Please check the information and try again.":
    "Tên tenant đã tồn tại. Hãy kiểm tra thông tin và thử lại.",
  "Enter a valid email address.": "Nhập địa chỉ email hợp lệ.",
  "Enter at least 8 characters.": "Nhập ít nhất 8 ký tự.",
  "No score template items": "Chưa có mục nào trong mẫu chấm điểm",
  Notifications: "Thông báo",
  "Notification filter": "Bộ lọc thông báo",
  "Notification category": "Danh mục thông báo",
  "All notifications": "Tất cả thông báo",
  "Unread only": "Chỉ chưa đọc",
  "Mark all read": "Đánh dấu tất cả đã đọc",
  "System notice": "Thông báo hệ thống",
  Maintenance: "Bảo trì",
  Session: "Phiên thi",
  Application: "Đơn đăng ký",
  Billing: "Thanh toán",
  Support: "Hỗ trợ",
  "Edit announcement draft": "Chỉnh sửa bản nháp thông báo",
  "New announcement": "Thông báo mới",
  Message: "Nội dung",
  "Affected from": "Bắt đầu ảnh hưởng",
  "Affected until": "Kết thúc ảnh hưởng",
  Informational: "Thông tin",
  Important: "Quan trọng",
  "Announcement draft saved.": "Đã lưu bản nháp thông báo.",
  "Announcement published.": "Đã phát hành thông báo.",
  "Draft deleted.": "Đã xóa bản nháp.",
  "Draft changed elsewhere": "Bản nháp đã thay đổi ở nơi khác",
  "Reload the latest draft before editing or publishing it.":
    "Hãy tải lại bản nháp mới nhất trước khi chỉnh sửa hoặc phát hành.",
  "Reload list": "Tải lại danh sách",
  Importance: "Mức độ quan trọng",
  Recipients: "Người nhận",
  delivered: "đã nhận",
  "Not published": "Chưa phát hành",
  Updated: "Cập nhật",
  "No announcement drafts": "Không có bản nháp thông báo",
  "Create a draft when the platform needs to communicate a global notice.":
    "Tạo bản nháp khi nền tảng cần gửi thông báo chung.",
  "Retry failed delivery": "Thử lại phân phối thất bại",
  "Delivery retry queued.": "Đã xếp hàng yêu cầu thử lại phân phối.",
  "Publish announcement?": "Phát hành thông báo?",
  "This publishes immutable content to the eligible host audience immediately.":
    "Nội dung không thể thay đổi sẽ được phát hành ngay cho nhóm Host đủ điều kiện.",
  "This draft will be removed and cannot be restored.":
    "Bản nháp sẽ bị xóa và không thể khôi phục.",
  "Published announcement": "Thông báo đã phát hành",
  "Draft version": "Phiên bản bản nháp",
  "This announcement is no longer available.": "Thông báo này không còn khả dụng.",
  "Eligible tenants": "Tenant đủ điều kiện",
  "Delivered / audience": "Đã gửi / đối tượng",
  "Reload the latest server version before trying again.":
    "Hãy tải lại phiên bản mới nhất từ máy chủ trước khi thử lại.",
  Reload: "Tải lại",

  "Support Tickets": "Yêu cầu hỗ trợ",
  "Review and manage support requests from tenants.":
    "Xem xét và quản lý yêu cầu hỗ trợ từ các tenant.",
  "No support tickets": "Không có yêu cầu hỗ trợ",
  "Failed to load support tickets.": "Không thể tải yêu cầu hỗ trợ.",
  "No tickets match the current filters.": "Không có yêu cầu phù hợp với bộ lọc hiện tại.",
  "All categories": "Tất cả danh mục",
  "All tenants": "Tất cả tenant",
  Tenant: "Tenant",
  Category: "Danh mục",
  Submitted: "Đã gửi",
  Open: "Mở",
  "In Progress": "Đang xử lý",
  Resolved: "Đã xử lý",
  "Closed by host": "Host đã đóng",
  Bug: "Lỗi",
  "Content Complaint": "Khiếu nại nội dung",
  "General Feedback": "Phản hồi chung",
  Start: "Bắt đầu",
  Resolve: "Xử lý",
  "Ticket Details": "Chi tiết yêu cầu",
  "Ticket information": "Thông tin yêu cầu",
  "Admin notes": "Ghi chú quản trị",
  "Related entity type": "Loại đối tượng liên quan",
  "Last updated": "Cập nhật lần cuối",
  "No notes yet": "Chưa có ghi chú",
  "Add the first note to document your findings.":
    "Thêm ghi chú đầu tiên để lưu lại kết quả xử lý.",
  "Add a note": "Thêm ghi chú",
  "Write a note visible to the tenant…": "Viết ghi chú hiển thị cho tenant…",
  "Add note": "Thêm ghi chú",
  "Note added.": "Đã thêm ghi chú.",
  "Status updated.": "Đã cập nhật trạng thái.",

  // Shared status, identity, and fallback copy used by the remaining admin screens.
  "Loading applications...": "Đang tải danh sách đơn đăng ký...",
  "Application approved. Verify the Host account manually; credentials delivery is not confirmed here.":
    "Đã duyệt đơn đăng ký. Hãy xác minh tài khoản Host thủ công; hệ thống chưa xác nhận việc gửi thông tin đăng nhập.",
  "Application details could not be loaded.": "Không thể tải chi tiết đơn đăng ký.",
  "You do not have permission to view this application.": "Bạn không có quyền xem đơn đăng ký này.",
  "The result is uncertain. Refresh the application before trying the action again.":
    "Kết quả chưa chắc chắn. Hãy tải lại đơn đăng ký trước khi thử lại thao tác.",
  "The action result is uncertain and the latest application state could not be loaded. Do not retry yet.":
    "Kết quả thao tác chưa chắc chắn và không thể tải trạng thái đơn mới nhất. Chưa nên thử lại.",
  Archived: "Đã lưu trữ",
  Redeemed: "Đã sử dụng",
  Published: "Đã phát hành",
  Public: "Công khai",
  Private: "Riêng tư",
  "All policies": "Tất cả chính sách",
  "No exam templates found": "Không tìm thấy mẫu bài thi",
  "Back to Tenants": "Quay lại danh sách tenant",
  "Tenant details could not be loaded. Retry before changing access.":
    "Không thể tải chi tiết tenant. Hãy thử lại trước khi thay đổi quyền truy cập.",
  "← Back to tickets": "← Quay lại danh sách yêu cầu",
  "Loading ticket…": "Đang tải yêu cầu hỗ trợ…",
  "Ticket not found.": "Không tìm thấy yêu cầu hỗ trợ.",
  "Please complete all required fields.": "Vui lòng hoàn thành tất cả trường bắt buộc.",
  "Suspend this platform user? They will no longer be able to sign in.":
    "Tạm ngưng người dùng nền tảng này? Người dùng sẽ không thể đăng nhập nữa.",
  "e.g. 100": "Ví dụ: 100",
  "Platform administrator": "Quản trị viên nền tảng",
  "Platform admin": "Quản trị viên nền tảng",
  "Academic staff (legacy)": "Nhân sự học thuật (cũ)",
  "Host admin": "Quản trị viên Host",
  Proctor: "Giám thị",
  Examiner: "Giám khảo",
  Student: "Học viên",
  Max: "Tối đa",
  "Select a section first": "Trước tiên hãy chọn một khu vực",

  // Commercialization and licensing validation/recovery states.
  "Plan name must be at most 255 characters.": "Tên gói không được dài quá 255 ký tự.",
  "Description must be at most 255 characters.": "Mô tả không được dài quá 255 ký tự.",
  "Enter a non-negative price with at most 17 integer digits and 2 decimals.":
    "Nhập giá không âm, tối đa 17 chữ số phần nguyên và 2 chữ số thập phân.",
  "This plan changed while you were editing": "Gói này đã thay đổi trong lúc bạn chỉnh sửa",
  "Your form still contains the values you entered. Review the latest server values before deciding what to do.":
    "Biểu mẫu vẫn giữ các giá trị bạn đã nhập. Hãy xem lại dữ liệu mới nhất trên máy chủ trước khi quyết định.",
  "Latest server values": "Dữ liệu mới nhất trên máy chủ",
  "Reload server values": "Tải lại dữ liệu máy chủ",
  "Keep my changes": "Giữ thay đổi của tôi",
  "This draft will be removed from the catalog. Audit history is retained, but it cannot be restored from this UI.":
    "Bản nháp này sẽ bị xóa khỏi danh mục. Lịch sử audit vẫn được giữ lại nhưng không thể khôi phục từ giao diện này.",
  "Plan draft deleted.": "Đã xóa bản nháp gói.",
  "This draft has usage history and cannot be deleted.":
    "Bản nháp này đã có lịch sử sử dụng nên không thể xóa.",
  "Archive is blocked while issued codes remain redeemable. Revoke them or wait for expiry.":
    "Không thể lưu trữ khi mã đã cấp vẫn còn có thể sử dụng. Hãy thu hồi mã hoặc chờ mã hết hạn.",
  "Reload to check which cleanup actions are available.":
    "Tải lại để kiểm tra các thao tác dọn dẹp khả dụng.",
  "Archive this plan?": "Lưu trữ gói này?",
  "This plan will no longer be available for new purchases. Existing subscriptions and audit history are retained. Retirement cannot be undone from this UI.":
    "Gói này sẽ không còn khả dụng cho giao dịch mua mới. Các gói đăng ký hiện tại và lịch sử audit vẫn được giữ lại. Không thể hoàn tác việc lưu trữ từ giao diện này.",
  "Archive plan": "Lưu trữ gói",
  "The previous request may already have created a license code. Refresh the list before retrying.":
    "Yêu cầu trước đó có thể đã tạo mã bản quyền. Hãy tải lại danh sách trước khi thử lại.",
  "The issuance result has not been confirmed. Refresh the list before retrying.":
    "Chưa xác nhận được kết quả cấp mã. Hãy tải lại danh sách trước khi thử lại.",
  "This request was rejected before a license code was created.":
    "Yêu cầu này đã bị từ chối trước khi mã bản quyền được tạo.",
  "Confirming the issuance result…": "Đang xác nhận kết quả cấp mã…",
  "Clear this rejected request": "Xóa yêu cầu bị từ chối này",
  "Enter a valid future date and time.": "Nhập ngày giờ hợp lệ trong tương lai.",
  "Optional UUID filter; this never searches bearer values.":
    "Bộ lọc UUID tùy chọn; bộ lọc này không bao giờ tìm trong giá trị mã.",
  "Showing the last successful page...": "Đang hiển thị trang tải thành công gần nhất...",
  "Plans could not be loaded...": "Không thể tải danh sách gói...",
  "The bearer is shown locally...": "Mã cấp quyền chỉ được hiển thị cục bộ...",
  "The code could not be revealed...": "Không thể hiển thị mã...",
  "Code revealed locally...": "Mã đã được hiển thị cục bộ...",
  "Review the live subscription impact...":
    "Đang kiểm tra ảnh hưởng đến gói đăng ký đang hoạt động...",
  "Loading the current impact...": "Đang tải ảnh hưởng hiện tại...",
  "The revoke preview could not be loaded...": "Không thể tải bản xem trước thu hồi...",
  "This preview expired...": "Bản xem trước này đã hết hạn...",
  "Give a short audit reason...": "Nhập lý do audit ngắn...",
  "I understand...": "Tôi hiểu...",
  "The scope changed...": "Phạm vi đã thay đổi...",
  "Expired codes cannot be revoked.": "Không thể thu hồi mã đã hết hạn.",
  "License codes could not be loaded or saved.": "Không thể tải hoặc lưu mã bản quyền.",
  "Clear this rejected request so you can correct the plan or expiry.":
    "Xóa yêu cầu bị từ chối này để bạn có thể sửa gói hoặc thời hạn.",
  "Code revealed locally. It is not retained in the page cache.":
    "Mã đã được hiển thị cục bộ. Mã không được giữ trong bộ nhớ đệm của trang.",
  "Give a short audit reason. This reason is retained with the code.":
    "Nhập lý do audit ngắn. Lý do này sẽ được lưu cùng mã.",
  "I understand all currently scheduled sessions in this scope will be cancelled.":
    "Tôi hiểu tất cả phiên thi đã lên lịch trong phạm vi này sẽ bị hủy.",
  "I understand open and closed sessions will be preserved.":
    "Tôi hiểu các phiên đang mở và đã đóng sẽ được giữ lại.",
  "I understand the linked exam subscription will be cancelled.":
    "Tôi hiểu gói đăng ký kỳ thi liên kết sẽ bị hủy.",
  "Plans could not be loaded. Issuance is temporarily unavailable.":
    "Không thể tải danh sách gói. Tính năng cấp mã tạm thời không khả dụng.",
  "Review the live subscription impact before confirming. The action cannot be undone.":
    "Hãy xem lại ảnh hưởng đến gói đăng ký đang hoạt động trước khi xác nhận. Không thể hoàn tác thao tác này.",
  "Showing the last successful page while a refresh is pending.":
    "Đang hiển thị trang tải thành công gần nhất trong khi chờ tải lại.",
  "The bearer is shown locally for up to 60 seconds. Copy is available only after an explicit click.":
    "Mã cấp quyền chỉ hiển thị cục bộ tối đa 60 giây. Chỉ có thể sao chép sau khi chủ động nhấn nút.",
  "The code could not be revealed. Refresh and try again.":
    "Không thể hiển thị mã. Hãy tải lại và thử lại.",
  "The issuance result has not been confirmed. Recover this request before starting another issuance.":
    "Chưa xác nhận được kết quả cấp mã. Hãy khôi phục yêu cầu này trước khi bắt đầu cấp mã khác.",
  "The previous request may already have created a license. Recover its result first. Starting another request can create a second license.":
    "Yêu cầu trước đó có thể đã tạo mã bản quyền. Hãy khôi phục kết quả trước. Bắt đầu yêu cầu khác có thể tạo mã thứ hai.",
  "The revoke preview could not be loaded. Refresh and try again.":
    "Không thể tải bản xem trước thu hồi. Hãy tải lại và thử lại.",
  "The scope changed while you were confirming. Review the refreshed preview and acknowledge it again.":
    "Phạm vi đã thay đổi trong lúc bạn xác nhận. Hãy xem lại bản xem trước mới và xác nhận lại.",
  "This preview expired. A fresh preview is required.":
    "Bản xem trước này đã hết hạn. Cần tạo bản xem trước mới.",
  "This request was rejected. Start a new issuance to correct the input.":
    "Yêu cầu này đã bị từ chối. Hãy bắt đầu lần cấp mã mới để sửa dữ liệu nhập.",

  "Could not load the question bank. Please try again.":
    "Không thể tải ngân hàng câu hỏi. Vui lòng thử lại.",
  "Updating question bank...": "Đang cập nhật ngân hàng câu hỏi...",
  "Could not add this task type. Check the key, display name, and selected screen.":
    "Không thể thêm dạng bài này. Hãy kiểm tra khóa, tên hiển thị và màn hình đã chọn.",
  "Could not remove this task type. Please try again.":
    "Không thể xóa dạng bài này. Vui lòng thử lại.",
  "Could not update the task type workflow. Please try again.":
    "Không thể cập nhật quy trình dạng bài. Vui lòng thử lại.",
  "Could not update this task type. Please try again.":
    "Không thể cập nhật dạng bài này. Vui lòng thử lại.",
  "Choose a standard PTE task type with the section supplied by the platform.":
    "Hãy chọn dạng bài PTE tiêu chuẩn với khu vực do nền tảng cung cấp.",
  "Enter a display name between 1 and 128 characters.": "Nhập tên hiển thị từ 1 đến 128 ký tự.",
  "Enter a unique task type key and choose a released screen contract. The platform derives runtime behavior from that contract.":
    "Nhập khóa dạng bài duy nhất và chọn hợp đồng màn hình đã phát hành. Nền tảng sẽ suy ra hành vi chạy từ hợp đồng đó.",
  "Remove this task type from the active catalog? Existing questions remain available, but new questions and templates cannot use it.":
    "Xóa dạng bài này khỏi danh mục đang hoạt động? Câu hỏi hiện tại vẫn khả dụng nhưng câu hỏi và mẫu mới không thể dùng dạng bài này.",
  "Task type approved and activated.": "Dạng bài đã được duyệt và kích hoạt.",
  "Task type submitted for academic review.": "Đã gửi dạng bài để nhân sự học thuật duyệt.",
  "That task type is already in the catalog. Refresh the page to see the current entry.":
    "Dạng bài đó đã có trong danh mục. Hãy tải lại trang để xem mục hiện tại.",
  "The selected released screen contract supplies authoring, interaction, and scoring behavior.":
    "Hợp đồng màn hình đã phát hành được chọn cung cấp hành vi biên soạn, tương tác và chấm điểm.",
  "This display name is already used. Choose a different name.":
    "Tên hiển thị này đã được sử dụng. Hãy chọn tên khác.",
  "This task type has not been enabled for the current platform runtime yet.":
    "Dạng bài này chưa được bật cho môi trường chạy hiện tại của nền tảng.",
  "This task type is no longer available. Refresh the catalog and try again.":
    "Dạng bài này không còn khả dụng. Hãy tải lại danh mục và thử lại.",
  "This task type is temporarily unavailable for new authoring or templates.":
    "Dạng bài này tạm thời không khả dụng cho việc biên soạn hoặc tạo mẫu mới.",
  "This task type is used by a published template. Its screen, contract, and section are locked; only display metadata can be changed.":
    "Dạng bài này đang được mẫu đã phát hành sử dụng. Màn hình, hợp đồng và khu vực đã bị khóa; chỉ có thể thay đổi siêu dữ liệu hiển thị.",
  "This task type key is already used. Choose a different key.":
    "Khóa dạng bài này đã được sử dụng. Hãy chọn khóa khác.",
  "This task type uses a runtime profile that the platform no longer supports. Contact the platform administrator.":
    "Dạng bài này dùng cấu hình chạy không còn được nền tảng hỗ trợ. Hãy liên hệ quản trị viên nền tảng.",
  "Use 2–64 characters: start with A–Z, then use only A–Z, 0–9, or underscore.":
    "Dùng 2–64 ký tự: bắt đầu bằng A–Z, sau đó chỉ dùng A–Z, 0–9 hoặc dấu gạch dưới.",
  "You can update the display metadata and runtime binding while this task type has not been used by a published template.":
    "Bạn có thể cập nhật siêu dữ liệu hiển thị và liên kết chạy khi dạng bài này chưa được mẫu đã phát hành sử dụng.",
  "Delete draft?": "Xóa bản nháp?",
  "Edit draft": "Chỉnh sửa bản nháp",
  "Publish now": "Phát hành ngay",
  "Save draft": "Lưu bản nháp",
  "This notification is no longer available.": "Thông báo này không còn khả dụng.",
  "System Error": "Lỗi hệ thống",
  "Something went wrong. Please reload the page.":
    "Đã xảy ra lỗi. Vui lòng tải lại trang.",
  "Something went wrong": "Đã xảy ra lỗi",
  "We could not load this page. Please try again.":
    "Không thể tải trang này. Vui lòng thử lại.",
  "Try again": "Thử lại",

  // Question bank and task type workflow copy.
  "Could not load this question. Please try again.": "Không thể tải câu hỏi này. Vui lòng thử lại.",
  "This question could not be found.": "Không tìm thấy câu hỏi này.",
  "Play audio prompt": "Phát âm thanh câu hỏi",
  "Question image prompt": "Hình ảnh câu hỏi",
  "Edit question": "Chỉnh sửa câu hỏi",
  "Question Code": "Mã câu hỏi",
  Skill: "Kỹ năng",
  Content: "Nội dung",
  "All skills": "Tất cả kỹ năng",
  First: "Đầu tiên",
  Last: "Cuối cùng",
  "This draft will be removed from authoring. Audit history and media are retained, but it cannot be restored from this UI.":
    "Bản nháp này sẽ bị xóa khỏi khu vực biên soạn. Lịch sử audit và tệp phương tiện vẫn được giữ lại nhưng không thể khôi phục từ giao diện này.",
  "Question draft deleted.": "Đã xóa bản nháp câu hỏi.",
  "Draft cleanup is unavailable because publication or revision history is protected or unknown.":
    "Không thể dọn dẹp bản nháp vì lịch sử phát hành hoặc phiên bản đang được bảo vệ hoặc chưa xác định.",
  "Archive this question?": "Lưu trữ câu hỏi này?",
  "This question will be excluded from new exam generation. Existing exam snapshots and publication history are retained.":
    "Câu hỏi này sẽ không được dùng để tạo kỳ thi mới. Ảnh chụp kỳ thi hiện tại và lịch sử phát hành vẫn được giữ lại.",
  "Archive question": "Lưu trữ câu hỏi",
  Unarchive: "Bỏ lưu trữ",
  Reject: "Từ chối",
  "No questions match your search or filters. Try adjusting them.":
    "Không có câu hỏi phù hợp với tìm kiếm hoặc bộ lọc. Hãy thử điều chỉnh lại.",
  "The question bank is empty. Add your first question to get started.":
    "Ngân hàng câu hỏi đang trống. Hãy thêm câu hỏi đầu tiên để bắt đầu.",
  "Please revise this question.": "Vui lòng chỉnh sửa lại câu hỏi này.",
  "Reject this question?": "Từ chối câu hỏi này?",
  "It will go back to Draft so the author can revise it.":
    "Câu hỏi sẽ trở về trạng thái bản nháp để tác giả chỉnh sửa.",
  "Reason for rejection": "Lý do từ chối",
  "Explain what needs to change...": "Giải thích nội dung cần thay đổi...",
  "A reason is required so the author knows what to fix.":
    "Cần nhập lý do để tác giả biết nội dung cần sửa.",
  "Reject question": "Từ chối câu hỏi",
  "Question submitted for approval.": "Đã gửi câu hỏi để duyệt.",
  "Question approved and published.": "Câu hỏi đã được duyệt và phát hành.",
  "Question rejected and sent back to draft.": "Câu hỏi đã bị từ chối và chuyển về bản nháp.",
  "Question archived.": "Đã lưu trữ câu hỏi.",
  "Question unarchived.": "Đã bỏ lưu trữ câu hỏi.",
  "← Back to Question Bank": "← Quay lại ngân hàng câu hỏi",
  "This question has no text prompt.": "Câu hỏi này không có đề bài dạng văn bản.",
  "Loading media preview...": "Đang tải bản xem trước tệp phương tiện...",
  "The media preview could not be loaded. The media reference is still saved.":
    "Không thể tải bản xem trước tệp phương tiện. Tham chiếu tệp vẫn được lưu.",
  "No audio or image is attached to this question.":
    "Câu hỏi này không có âm thanh hoặc hình ảnh đính kèm.",
  "Task type keys are configurable metadata. Interaction and scoring behavior come from a released screen contract selected below.":
    "Khóa dạng bài là siêu dữ liệu có thể cấu hình. Hành vi tương tác và chấm điểm lấy từ hợp đồng màn hình đã phát hành được chọn bên dưới.",
  "· contributes to scoring": "· tham gia chấm điểm",
  "· not scored": "· không chấm điểm",
  "Authoring requirements": "Yêu cầu biên soạn",
};

const translatePattern = (value: string): string | undefined => {
  let match = value.match(/^(\d+) days$/);
  if (match) return `${match[1]} ngày`;
  match = value.match(/^(\d+) \/ session$/);
  if (match) return `${match[1]} / lượt`;
  match = value.match(/^\+(\d+) students$/);
  if (match) return `+${match[1]} học viên`;
  match = value.match(/^Version (\d+)$/);
  if (match) return `Phiên bản ${match[1]}`;
  match = value.match(/^Showing 0 of (\d+) tenants$/);
  if (match) return `Đang hiển thị 0 trên ${match[1]} tenant`;
  match = value.match(/^Showing 1-(\d+) of (\d+) tenants$/);
  if (match) return `Đang hiển thị 1-${match[1]} trên ${match[2]} tenant`;
  match = value.match(/^(\d+) ticket(?:s)?$/);
  if (match) return `${match[1]} yêu cầu hỗ trợ`;
  match = value.match(/^Requested code (.+)$/);
  if (match) return `Mã được yêu cầu: ${match[1]}`;
  match = value.match(/^Media ID: (.+)$/);
  if (match) return `ID tệp phương tiện: ${match[1]}`;
  match = value.match(/^(\d+) seconds$/);
  if (match) return `${match[1]} giây`;
  match = value.match(/^Setting (.+) saved\.$/);
  if (match) return `Đã lưu cài đặt ${match[1]}.`;
  match = value.match(/^(\d+) questions$/);
  if (match) return `${match[1]} câu hỏi`;
  match = value.match(/^(\d+) codes$/);
  if (match) return `${match[1]} mã`;
  match = value.match(/^Uploaded media: (.+)$/);
  if (match) return `Đã tải tệp phương tiện: ${match[1]}`;
  match = value.match(/^Correct option (\d+)$/);
  if (match) return `Lựa chọn đúng ${match[1]}`;
  match = value.match(/^Option (\d+)$/);
  if (match) return `Lựa chọn ${match[1]}`;
  return undefined;
};

export function translateAdminText(value: string, locale: Locale): string {
  if (locale !== "vi") return value;
  return ADMIN_VI[value] ?? translatePattern(value) ?? value;
}

type LocalizableFunction = (...args: never[]) => unknown;

function localizeValue(value: unknown, locale: Locale): unknown {
  if (typeof value === "string") return translateAdminText(value, locale);
  if (typeof value === "function") {
    return (...args: never[]) => localizeValue((value as LocalizableFunction)(...args), locale);
  }
  if (Array.isArray(value)) return value.map((item) => localizeValue(item, locale));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, localizeValue(item, locale)]),
    );
  }
  return value;
}

export function useAdminCopy<T>(copy: T): T {
  const { locale } = useLocale();
  return useMemo(() => localizeValue(copy, locale) as T, [copy, locale]);
}
