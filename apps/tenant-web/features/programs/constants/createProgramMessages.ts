export const CREATE_PROGRAM_EN = {
  createModalTitle: "Create {program}",
  nameLabel: "{program} name",
  namePlaceholder: "e.g. {program} 12",
  descriptionLabel: "Description",
  startDateLabel: "Start date",
  endDateLabel: "End date",
  dateOptionalHint: "Optional — leave blank if there is no time limit",
  cancel: "Cancel",
  submit: "Create {program}",
  submitting: "Creating...",
  nameRequired: "{program} name is required.",
  endDateBeforeStartDate: "End date must be on or after the start date.",
};

export type CreateProgramMessages = Record<keyof typeof CREATE_PROGRAM_EN, string>;

export const CREATE_PROGRAM_VI: CreateProgramMessages = {
  createModalTitle: "Tạo {programLower}",
  nameLabel: "Tên {programLower}",
  namePlaceholder: "Ví dụ: {program} 12",
  descriptionLabel: "Mô tả",
  startDateLabel: "Ngày bắt đầu",
  endDateLabel: "Ngày kết thúc",
  dateOptionalHint: "Không bắt buộc — bỏ trống nếu không giới hạn thời gian",
  cancel: "Hủy",
  submit: "Tạo {programLower}",
  submitting: "Đang tạo...",
  nameRequired: "Vui lòng nhập tên {programLower}.",
  endDateBeforeStartDate: "Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.",
};
