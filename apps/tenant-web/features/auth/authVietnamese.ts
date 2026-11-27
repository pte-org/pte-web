import type { ForgotPasswordFormText, ResetPasswordFormText } from "@pte/ui";
import type { AuthText, PasswordChangeText, PasswordResetLinks } from "./constants";

/** Vietnamese copy for the sign-in portal screens; the English tables live in `constants.ts`. */

export const AUTH_TEXT_VI: AuthText = {
  BRAND: "PTE Prep",
  PORTAL_LABEL: "Cổng tổ chức",
  FOOTER_LABEL: "Pháp lý và hỗ trợ",
  FOOTER_COPYRIGHT: "© {year} PTE Prep",
  FOOTER_TERMS: "Điều khoản",
  FOOTER_PRIVACY: "Quyền riêng tư",
  FOOTER_SUPPORT: "Liên hệ hỗ trợ",
  WELCOME_TITLE: "Chào mừng trở lại",
  WELCOME_SUBTITLE: "Đăng nhập để quản lý học viên và kỳ thi của tổ chức bạn.",
  USERNAME_LABEL: "Tên đăng nhập",
  USERNAME_PLACEHOLDER: "school.nguyenvana",
  USERNAME_HINT: "Dùng tên đăng nhập mà tổ chức đã gửi vào email của bạn.",
  PASSWORD_LABEL: "Mật khẩu",
  PASSWORD_PLACEHOLDER: "Nhập mật khẩu của bạn",
  FORGOT: "Quên mật khẩu?",
  LOGIN_BUTTON: "Đăng nhập",
  LOGGING_IN: "Đang đăng nhập...",
  SHOW_PASSWORD: "Hiện mật khẩu",
  HIDE_PASSWORD: "Ẩn mật khẩu",
  USERNAME_REQUIRED: "Vui lòng nhập tên đăng nhập.",
  PASSWORD_REQUIRED: "Vui lòng nhập mật khẩu.",
  INVALID_CREDENTIALS: "Tên đăng nhập hoặc mật khẩu không đúng.",
  STUDENT_ACCOUNT_NOT_ALLOWED:
    "Tài khoản học viên không thể đăng nhập vào cổng này. Kết quả của bạn sẽ được gửi qua email khi được công bố.",
  GENERIC_ERROR: "Đăng nhập thất bại. Vui lòng thử lại.",
  NETWORK_ERROR: "Không thể kết nối tới máy chủ. Hãy kiểm tra kết nối và thử lại.",
  SERVICE_UNAVAILABLE: "Đăng nhập tạm thời không khả dụng. Vui lòng thử lại sau.",
  RATE_LIMITED: "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng đợi một lát rồi thử lại.",
};

export const PASSWORD_CHANGE_TEXT_VI: PasswordChangeText = {
  TITLE: "Đổi mật khẩu của bạn",
  SUBTITLE: "Bạn cần thay mật khẩu tạm trước khi vào không gian làm việc.",
  VOLUNTARY_SUBTITLE: "Nhập mật khẩu hiện tại, rồi chọn mật khẩu mới.",
  CANCEL: "Hủy",
  SUCCESS_VOLUNTARY: "Đã đổi mật khẩu.",
  CURRENT_LABEL: "Mật khẩu hiện tại",
  NEW_LABEL: "Mật khẩu mới",
  CONFIRM_LABEL: "Xác nhận mật khẩu mới",
  REQUIRED: "Nhập đầy đủ các ô mật khẩu.",
  MISMATCH: "Mật khẩu mới không khớp.",
  EDGE_SPACES: "Mật khẩu không được bắt đầu hoặc kết thúc bằng dấu cách.",
  TOO_SHORT: "Mật khẩu mới cần ít nhất 8 ký tự.",
  TOO_LONG: "Mật khẩu quá dài. Tối đa 72 byte: khoảng 72 ký tự thường, ít hơn nếu có dấu hoặc emoji.",
  SUBMIT: "Đổi mật khẩu",
  SUBMITTING: "Đang đổi mật khẩu...",
  FAILED: "Không đổi được mật khẩu. Hãy kiểm tra mật khẩu hiện tại rồi thử lại.",
  SUCCESS: "Đã đổi mật khẩu. Bạn đã đăng nhập.",
};

export const FORGOT_PASSWORD_TEXT_VI: ForgotPasswordFormText = {
  title: "Quên mật khẩu?",
  subtitle:
    "Nhập tên đăng nhập và email của tài khoản đó, chúng tôi sẽ gửi liên kết để bạn chọn mật khẩu mới. Quên tên đăng nhập? Hãy hỏi quản trị viên tổ chức của bạn.",
  usernameLabel: "Tên đăng nhập",
  emailLabel: "Email",
  submit: "Gửi liên kết đặt lại",
  submitting: "Đang gửi...",
  required: "Nhập địa chỉ email.",
  usernameRequired: "Nhập tên đăng nhập.",
  sentTitle: "Hãy kiểm tra hộp thư",
  sentMessage:
    "Nếu tên đăng nhập và email này thuộc cùng một tài khoản, liên kết đặt lại đang được gửi đi. Liên kết chỉ dùng được một lần và hết hạn sau 30 phút.",
};

export const RESET_PASSWORD_TEXT_VI: ResetPasswordFormText & { failed: string } = {
  title: "Chọn mật khẩu mới",
  subtitle: "Chọn mật khẩu bạn chưa từng dùng ở đây. Liên kết chỉ dùng được một lần.",
  newLabel: "Mật khẩu mới",
  confirmLabel: "Xác nhận mật khẩu mới",
  submit: "Đặt lại mật khẩu",
  submitting: "Đang lưu...",
  required: "Nhập cả hai ô mật khẩu.",
  tooShort: "Mật khẩu mới cần ít nhất 8 ký tự.",
  mismatch: "Mật khẩu mới không khớp.",
  edgeSpaces: "Mật khẩu không được bắt đầu hoặc kết thúc bằng dấu cách.",
  tooLong: "Mật khẩu quá dài. Tối đa 72 byte: khoảng 72 ký tự thường, ít hơn nếu có dấu hoặc emoji.",
  invalidLinkTitle: "Không thể dùng liên kết này",
  invalidLinkMessage: "Liên kết đặt lại bị thiếu, không hợp lệ hoặc đã hết hạn. Hãy yêu cầu liên kết mới để tiếp tục.",
  checkingTitle: "Đang kiểm tra liên kết",
  checkingMessage: "Vui lòng đợi một chút để chúng tôi xác nhận liên kết còn dùng được.",
  showPassword: "Hiện mật khẩu",
  hidePassword: "Ẩn mật khẩu",
  failed: "Không đặt lại được mật khẩu. Hãy yêu cầu liên kết mới rồi thử lại.",
};

export const PASSWORD_RESET_LINKS_VI: PasswordResetLinks = {
  BACK_TO_LOGIN: "Quay lại đăng nhập",
  REQUEST_NEW_LINK: "Yêu cầu liên kết mới",
  RESET_DONE: "Đã cập nhật mật khẩu. Hãy đăng nhập bằng mật khẩu mới.",
};

export const FIRST_PASSWORD_TEXT_VI: ResetPasswordFormText & {
  failed: string;
  backToLogin: string;
  success: string;
} = {
  title: "Đặt mật khẩu mới",
  subtitle: "Đây là lần đăng nhập đầu tiên. Hãy chọn mật khẩu mới để tiếp tục.",
  newLabel: "Mật khẩu mới",
  confirmLabel: "Xác nhận mật khẩu mới",
  submit: "Lưu và tiếp tục",
  submitting: "Đang lưu...",
  required: "Nhập cả hai ô mật khẩu.",
  tooShort: "Mật khẩu mới cần ít nhất 8 ký tự.",
  mismatch: "Mật khẩu mới không khớp.",
  edgeSpaces: "Mật khẩu không được bắt đầu hoặc kết thúc bằng dấu cách.",
  tooLong: "Mật khẩu quá dài. Tối đa 72 byte: khoảng 72 ký tự thường, ít hơn nếu có dấu hoặc emoji.",
  invalidLinkTitle: "",
  invalidLinkMessage: "",
  checkingTitle: "",
  checkingMessage: "",
  showPassword: "Hiện mật khẩu",
  hidePassword: "Ẩn mật khẩu",
  failed: "Không đổi được mật khẩu. Vui lòng thử lại.",
  backToLogin: "Quay lại đăng nhập",
  success: "Đã đổi mật khẩu. Bạn đã đăng nhập.",
};

/**
 * Messages for failures the server reports on these screens. In English the shared API catalog already supplies
 * them; in Vietnamese they are mapped here by kind and code, and anything else falls back to the screen's own text.
 */
export const AUTH_ERROR_TEXT_VI = {
  networkError: "Không thể kết nối tới máy chủ. Hãy kiểm tra kết nối và thử lại.",
  serviceUnavailable: "Hệ thống đang gặp sự cố. Vui lòng thử lại sau.",
  rateLimited: "Bạn đã thử quá nhiều lần. Vui lòng đợi một lát rồi thử lại.",
  invalidLink: "Liên kết đặt lại không hợp lệ hoặc đã hết hạn. Hãy yêu cầu liên kết mới rồi thử lại.",
} as const;

export type AuthErrorText = { [Key in keyof typeof AUTH_ERROR_TEXT_VI]: string };
