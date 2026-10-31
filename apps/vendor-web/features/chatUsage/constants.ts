export const CHAT_USAGE_QUERY_KEY = ["chatUsage"] as const;

/** How many of the most active students the report lists. */
export const CHAT_TOP_STUDENTS_LIMIT = 10;

/** How far back the report looks when the admin has not picked dates. */
export const CHAT_USAGE_RANGE_DAYS = 30;

export const CHAT_USAGE_COPY = {
  en: {
    TITLE: "AI chat usage",
    ESTIMATE_NOTE:
      "Costs are an estimate (tokens times the configured prices). The provider's invoice is the real figure.",
    DATE_RANGE: "Date range",
    FILTER_DATE_RANGE: "Filter the report by date range",
    MESSAGES: "Messages",
    ESTIMATED_COST: "Estimated cost",
    FAILED_RATE: "Failed",
    TOKENS: "Tokens (in / out)",
    FAILED_DETAIL: "{count} of {total} messages",
    COST_DETAIL: "For {total} messages",
    TOKENS_DETAIL: "{total} tokens in total",
    CHART_TITLE: "Messages per day",
    CHART_ARIA: "Messages per day, split into answered, refused and failed",
    CHART_EMPTY: "No messages in this period",
    PRESET_LAST7: "7 days",
    PRESET_LAST30: "30 days",
    PRESET_THIS_MONTH: "This month",
    SHOW_ALL_DAYS: "Show all days",
    SHOW_ACTIVE_DAYS: "Only days with messages",
    DAY: "Day",
    ANSWERED: "Answered",
    REFUSED: "Refused",
    FAILED: "Failed",
    TOKENS_IN: "Tokens in",
    TOKENS_OUT: "Tokens out",
    COST: "Cost (USD)",
    EMPTY: "No chat activity in this period",
    EMPTY_DESCRIPTION: "Days appear here once students use the AI assistant.",
    STUDENTS_TITLE: "Most active students",
    STUDENTS_NOTE:
      "Student ids and message counts only. What students typed or were answered is not stored.",
    STUDENT_ID: "Student id",
    STUDENT_MESSAGES: "Messages",
    STUDENTS_EMPTY: "No student activity in this period",
    STUDENTS_LOAD_FAILED: "Unable to load the most active students.",
    LOAD_FAILED:
      "Unable to load the chat usage report. The AI chat may be switched off on the server.",
  },
  vi: {
    TITLE: "Mức dùng chat AI",
    ESTIMATE_NOTE:
      "Chi phí là ước tính (số token nhân với giá đã cấu hình). Hoá đơn của nhà cung cấp mới là số thật.",
    DATE_RANGE: "Khoảng ngày",
    FILTER_DATE_RANGE: "Lọc báo cáo theo khoảng ngày",
    MESSAGES: "Số tin",
    ESTIMATED_COST: "Chi phí ước tính",
    FAILED_RATE: "Lỗi",
    TOKENS: "Token (vào / ra)",
    FAILED_DETAIL: "{count}/{total} tin",
    COST_DETAIL: "Cho {total} tin",
    TOKENS_DETAIL: "Tổng {total} token",
    CHART_TITLE: "Số tin mỗi ngày",
    CHART_ARIA: "Số tin mỗi ngày, chia theo đã trả lời, từ chối và lỗi",
    CHART_EMPTY: "Không có tin nào trong khoảng này",
    PRESET_LAST7: "7 ngày",
    PRESET_LAST30: "30 ngày",
    PRESET_THIS_MONTH: "Tháng này",
    SHOW_ALL_DAYS: "Hiện tất cả các ngày",
    SHOW_ACTIVE_DAYS: "Chỉ ngày có tin",
    DAY: "Ngày",
    ANSWERED: "Đã trả lời",
    REFUSED: "Từ chối",
    FAILED: "Lỗi",
    TOKENS_IN: "Token vào",
    TOKENS_OUT: "Token ra",
    COST: "Chi phí (USD)",
    EMPTY: "Không có hoạt động chat trong khoảng này",
    EMPTY_DESCRIPTION: "Các ngày sẽ hiện ở đây khi học viên dùng trợ lý AI.",
    STUDENTS_TITLE: "Học viên dùng nhiều nhất",
    STUDENTS_NOTE:
      "Chỉ gồm mã học viên và số tin. Nội dung học viên gõ hay câu trả lời không được lưu.",
    STUDENT_ID: "Mã học viên",
    STUDENT_MESSAGES: "Số tin",
    STUDENTS_EMPTY: "Không có học viên nào dùng trong khoảng này",
    STUDENTS_LOAD_FAILED: "Không thể tải danh sách học viên dùng nhiều nhất.",
    LOAD_FAILED:
      "Không thể tải báo cáo mức dùng chat. Chat AI có thể đang được tắt trên máy chủ.",
  },
} as const;
