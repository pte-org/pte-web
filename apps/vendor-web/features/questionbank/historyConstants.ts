/** Copy of the history block under a question's detail. */
export const QUESTION_HISTORY_COPY = {
  en: {
    TITLE: "History",
    VERSIONS_TAB: "Versions",
    ACTIVITY_TAB: "Activity",
    COMPARE_FROM: "Compare version",
    COMPARE_TO: "with version",
    VERSION_LABEL: "Version {number} · {status}",
    CURRENT_SUFFIX: " (in use)",
    SINGLE_VERSION: "This question has only one version so far.",
    LOADING: "Loading versions...",
    LOAD_FAILED: "Unable to load the versions of this question.",
  },
  vi: {
    TITLE: "Lịch sử",
    VERSIONS_TAB: "Các phiên bản",
    ACTIVITY_TAB: "Nhật ký thao tác",
    COMPARE_FROM: "So sánh phiên bản",
    COMPARE_TO: "với phiên bản",
    VERSION_LABEL: "Phiên bản {number} · {status}",
    CURRENT_SUFFIX: " (đang dùng)",
    SINGLE_VERSION: "Câu hỏi này mới có một phiên bản.",
    LOADING: "Đang tải các phiên bản...",
    LOAD_FAILED: "Không thể tải các phiên bản của câu hỏi.",
  },
} as const;

/** Audit aggregate type the API writes for questions (`ItembankConstants.QUESTION_AGGREGATE`). */
export const QUESTION_AUDIT_AGGREGATE = "Question";

export const QUESTION_HISTORY_TABS = { VERSIONS: "versions", ACTIVITY: "activity" } as const;
