import type { ManageStudentsText } from "../hooks/useManageStudentsText";

export const MANAGE_STUDENTS_TEXT_VI: ManageStudentsText = {
  title: "Thêm học viên",
  tabAdd: "Thêm học viên",
  tabImport: "Thêm hàng loạt",
  emailLabel: "Email",
  fullNameLabel: "Họ và tên",
  studentCodeLabel: "Mã học viên",
  classLabel: "Lớp",
  classPlaceholder: "Chọn lớp",
  classSearchPlaceholder: "Tìm theo lớp hoặc chương trình",
  classLoading: "Đang tải danh sách lớp...",
  classNoOptions: "Không tìm thấy lớp.",
  classLoadFailed: "Không thể tải danh sách lớp. Vui lòng thử lại.",
  classOptionLabel: (className, programName, status) =>
    status === "ACTIVE"
      ? `${className} · ${programName}`
      : `${className} · ${programName} (${status.toLowerCase()})`,
  phoneLabel: "Điện thoại",
  dateOfBirthLabel: "Ngày sinh",
  addSubmit: "Thêm học viên",
  adding: "Đang thêm...",
  fileLabel: "Danh sách học viên (.xlsx)",
  fileDescription: "Tải lên mẫu hệ thống đã điền (.xlsx).",
  reviewFile: "Kiểm tra tệp",
  reviewing: "Đang đọc tệp...",
  rowsFound: (count) => `Tìm thấy ${count} dòng`,
  importAccounts: "Nhập học viên",
  importingAccounts: "Đang nhập học viên...",
  accountsCreated: (count) => `Đã tạo ${count} tài khoản học viên.`,
  credentialsTitle: "Thông tin đăng nhập của học viên",
  credentialsDescription:
    "Dùng tên đăng nhập được tạo làm tài khoản đăng nhập của học viên. Mật khẩu chỉ hiển thị một lần, hãy lưu hoặc tải xuống ngay.",
  credentialLabel: (fullName, username) =>
    `Mật khẩu của ${fullName ?? "học viên"} (tài khoản: ${username})`,
  downloadCredentials: "Tải thông tin đăng nhập",
  noAccountsCreated: "Không có tài khoản mới nào được tạo.",
  close: "Đóng",
};
