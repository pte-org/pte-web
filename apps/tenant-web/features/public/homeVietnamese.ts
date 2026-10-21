import { HOME_PREVIEW } from "./homeConstants";

export const HOME_TEXT_VI = {
  signIn: "Đăng nhập",
  dashboard: "Mở dashboard",
  plans: "Gói dịch vụ",
  examPackages: "Gói thi",
  studentCapacity: "Dung lượng học viên",
  currentlyUsing: "Đang sử dụng",
  skipContent: "Đến nội dung chính",
  navigation: "Điều hướng chính",
  duration: (days: number) => `${days} ngày`,
  platform: "Nền tảng",
  workflow: "Cách hoạt động",
  getStarted: "Bắt đầu",
  eyebrow: "Dành cho trường học & trung tâm PTE",
  title: "Bớt việc quản lý.",
  titleAccent: "Thêm sự rõ ràng.",
  description:
    "Kết nối học viên, ca thi và kết quả trong cùng một hệ thống. Giúp đội ngũ của bạn chuẩn bị tốt hơn cho mỗi kỳ thi.",
  register: "Đăng ký tổ chức",
  reassurance: "Thiết kế theo cách đội ngũ của bạn làm việc.",
  rolesLabel: "Một không gian cho cả đội ngũ",
  roles: ["Quản trị trường học", "Điều phối kỳ thi", "Giáo viên & giám khảo"],
  workflowEyebrow: "Từ chuẩn bị đến ngày thi",
  workflowTitle: "Chuẩn bị tốt bắt đầu từ những chi tiết hằng ngày.",
  workflowDescription:
    "Một quy trình rõ ràng cho đội ngũ, từ thêm học viên đầu tiên đến xem kết quả cuối cùng.",
  teamEyebrow: "Giảm trao đổi qua lại",
  teamTitle: "Cả đội ngũ cùng nắm một thông tin.",
  teamDescription:
    "Danh sách học viên ở một bảng tính, lịch thi ở nơi khác, kết quả lại nằm riêng. Tập trung công việc về một chỗ để mọi người bớt mất thời gian tìm bản cập nhật mới nhất.",
  teamLink: "Tìm gói phù hợp cho tổ chức",
  plansEyebrow: "Sẵn sàng cho bước tiếp theo",
  plansTitle: "Bắt đầu với nhu cầu của bạn.",
  plansDescription:
    "Chọn quyền truy cập thi theo kế hoạch. Bổ sung dung lượng khi số lượng học viên tăng lên.",
  examDescription: "Gói truy cập thi có thời hạn, với giới hạn học viên rõ ràng cho mỗi ca thi.",
  capacityDescription: "Bổ sung dung lượng học viên vĩnh viễn, mua riêng với gói thi.",
  plansLoading: "Đang tải gói dịch vụ...",
  plansError: "Chưa thể tải gói dịch vụ. Vui lòng thử lại sau.",
  plansEmpty: "Hiện chưa có gói dịch vụ đang hoạt động.",
  choosePlan: "Chọn gói này",
  permanent: "Sử dụng vĩnh viễn",
  existingOrganization: "Đã có tổ chức?",
  manageSubscriptions: "Đăng nhập để quản lý gói dịch vụ",
  closingTitle: "Cùng chuẩn bị cho một kỳ thi thuận lợi hơn.",
  closingDescription: "Bắt đầu với tổ chức của bạn. Kết nối cả đội ngũ.",
  footer: "Cổng tổ chức · Luyện tập hôm nay. Tiến xa ngày mai.",
} as const;

export const HOME_STEPS_VI = [
  {
    label: "01 / TỔ CHỨC",
    title: "Nắm rõ danh sách tham gia.",
    description:
      "Quản lý thông tin học viên và danh sách lớp tại một nơi. Chuẩn bị danh sách trước khi lên ca thi tiếp theo.",
  },
  {
    label: "02 / ĐIỀU PHỐI",
    title: "Mỗi kỳ thi có một kế hoạch.",
    description: "Tạo ca thi, phân công đội ngũ và giúp mọi người biết rõ lịch trình của mình.",
  },
  {
    label: "03 / THEO DÕI",
    title: "Biết rõ bước tiếp theo.",
    description:
      "Tập hợp kết quả về cùng một hệ thống để đội ngũ dễ dàng xem lại và theo dõi học viên.",
  },
] as const;

export const HOME_PREVIEW_VI = {
  ...HOME_PREVIEW,
  label: "Minh họa giao diện quản lý kỳ thi",
  sampleLabel: "Giao diện minh họa · Dữ liệu mẫu",
  rosterLabel: "Minh họa danh sách · Tên học viên giả định",
  windowTitle: "PTE Prep / Không gian làm việc",
  workspace: "Không gian của bạn",
  title: "Sẵn sàng cho tuần mới.",
  navigation: ["Tổng quan", "Học viên", "Ca thi", "Kết quả"],
  metrics: [
    { label: "Học viên", value: "128" },
    { label: "Ca thi sắp tới", value: "04" },
    { label: "Đã có kết quả", value: "86" },
  ],
  upcoming: "Ca thi sắp tới",
  month: "TH10",
  sessions: [
    {
      day: "24",
      title: "PTE Academic · Buổi sáng",
      detail: "09:00 — 11:00 · 24 học viên",
      status: "Đã công bố",
    },
    {
      day: "26",
      title: "PTE Academic · Buổi chiều",
      detail: "14:00 — 16:00 · 18 học viên",
      status: "Bản nháp",
    },
  ],
  annotation: "Mọi chi tiết, tại một nơi.",
  annotationDetail: "Danh sách thống nhất. Ca thi rõ ràng.",
  rosterTitle: "Cả lớp sẵn sàng cho bước tiếp theo.",
  rosterCount: "Lớp A · 3 học viên",
  className: "Luyện thi Academic · Lớp A",
  enrolled: "Đã ghi danh",
  students: [
    { initials: "MA", name: "Nguyễn Minh Anh" },
    { initials: "HL", name: "Trần Hoàng Long" },
    { initials: "TP", name: "Lê Thảo Phương" },
  ],
} as const;
