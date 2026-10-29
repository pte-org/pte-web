export const CHAT_USAGE_QUERY_KEY = ["chatUsage"] as const;

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
    CACHE_HIT_RATE: "Served from cache",
    FAILED_RATE: "Failed",
    TOKENS: "Tokens (in / out)",
    DAY: "Day",
    ANSWERED: "Answered",
    REFUSED: "Refused",
    FAILED: "Failed",
    FROM_CACHE: "From cache",
    TOKENS_IN: "Tokens in",
    TOKENS_OUT: "Tokens out",
    COST: "Cost (USD)",
    EMPTY: "No chat activity in this period",
    EMPTY_DESCRIPTION: "Days appear here once students use the AI assistant.",
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
    CACHE_HIT_RATE: "Trả từ cache",
    FAILED_RATE: "Lỗi",
    TOKENS: "Token (vào / ra)",
    DAY: "Ngày",
    ANSWERED: "Đã trả lời",
    REFUSED: "Từ chối",
    FAILED: "Lỗi",
    FROM_CACHE: "Từ cache",
    TOKENS_IN: "Token vào",
    TOKENS_OUT: "Token ra",
    COST: "Chi phí (USD)",
    EMPTY: "Không có hoạt động chat trong khoảng này",
    EMPTY_DESCRIPTION: "Các ngày sẽ hiện ở đây khi học viên dùng trợ lý AI.",
    LOAD_FAILED:
      "Không thể tải báo cáo mức dùng chat. Chat AI có thể đang được tắt trên máy chủ.",
  },
} as const;
