import { IMPORT_OR_ASSIGN_TEXT, PENDING_CLASS_ASSIGNMENT_TEXT } from "../constants";

export const STUDENT_IMPORT_EN = {
  ...IMPORT_OR_ASSIGN_TEXT,
  ...PENDING_CLASS_ASSIGNMENT_TEXT,
  tabsLabel: "Student addition methods",
  importHelper: "Fill in the system template: one student per row, starting on row 2.",
} as const;

export type StudentImportMessages = Record<keyof typeof STUDENT_IMPORT_EN, string>;

export const STUDENT_IMPORT_VI: StudentImportMessages = {
  alreadyInThisClass: "Học viên này đã có trong lớp này.",
  alreadyAssigned: "Học viên này đã được phân công vào một lớp.",
  title: "Thêm học viên",
  tabExisting: "Chọn học viên có sẵn",
  tabImport: "Nhập từ Excel",
  tabAdd: "Thêm từng học viên",
  close: "Đóng",
  existingLabel: "Học viên",
  existingPlaceholder: "Chọn học viên",
  noExisting: "Chưa có học viên chưa được phân công — hãy nhập hoặc thêm mới bên dưới.",
  assign: "Phân công vào lớp",
  assigning: "Đang phân công...",
  alreadyInAnotherClass:
    "Học viên này đã được phân công vào lớp khác. Hãy dùng chức năng chuyển từ danh sách học viên của lớp đó.",
  importHeading: "Nhập học viên",
  dropPrompt: "Kéo tệp .xlsx vào đây hoặc bấm để chọn tệp",
  checkFile: "Xem trước tệp",
  reviewRows: "Số dòng tìm thấy",
  createAccounts: "Tạo tài khoản",
  creating: "Đang tạo tài khoản...",
  accountsCreated: "Đã tạo {count} tài khoản.",
  download: "Tải thông tin đăng nhập",
  assignAll: "Phân công vào lớp",
  assigningAll: "Đang phân công",
  assignErrorTitle: "Đã tạo tài khoản nhưng phân công thất bại — hãy thử lại",
  addIndividuallyHeading: "Thêm một học viên",
  emailLabel: "Email",
  fullNameLabel: "Họ và tên",
  studentCodeLabel: "Mã học viên",
  phoneLabel: "Số điện thoại",
  dobLabel: "Ngày sinh",
  submit: "Thêm học viên",
  submitting: "Đang thêm...",
  recoveryTitle: "Phát hiện lần nhập chưa hoàn tất",
  recoveryText:
    "Tài khoản đã được tạo nhưng chưa xác nhận phân công vào lớp. Hãy tải thông tin đăng nhập nếu chưa tải, sau đó thử phân công lại.",
  redownload: "Tải lại thông tin đăng nhập",
  retryAssign: "Thử phân công lại",
  dismiss: "Bỏ qua (sẽ phân công sau)",
  tabsLabel: "Cách thêm học viên",
  importHelper: "Điền mẫu hệ thống: mỗi dòng một học viên, bắt đầu từ dòng 2.",
};
