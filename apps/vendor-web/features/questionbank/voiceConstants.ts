/** How long a voice sample or the voice list stays fresh: both only change with a deployment. */
export const VOICE_STATIC_STALE_MS = 60 * 60 * 1000;
export const VOICE_CATALOG_QUERY_KEY = ["question-voice-catalog"] as const;
export const VOICE_SAMPLE_QUERY_KEY = ["question-voice-sample"] as const;
export const VOICE_RADIO_GROUP_NAME = "question-voice";
export const VOICE_ACCENT_ORDER = ["US", "UK"] as const;
export const VOICE_GENDER_ORDER = ["FEMALE", "MALE"] as const;

interface VoiceText {
  CHANGE_VOICE: string;
  DIALOG_TITLE: string;
  DIALOG_HINT: string;
  CURRENT_VOICE: string;
  ACCENT_US: string;
  ACCENT_UK: string;
  GENDER_FEMALE: string;
  GENDER_MALE: string;
  LISTEN: string;
  LISTEN_LOADING: string;
  LISTEN_ERROR: string;
  APPLY: string;
  APPLYING: string;
  CANCEL: string;
  WORKING_NOTE: string;
  CATALOG_ERROR: string;
  CHANGE_ERROR: string;
  CHANGED: string;
  VERSION_CONFLICT: string;
}

export const VOICE_TEXT: { vi: VoiceText; en: VoiceText } = {
  en: {
    CHANGE_VOICE: "Change voice",
    DIALOG_TITLE: "Change the voice of this question",
    DIALOG_HINT:
      "The question is spoken again with the voice you pick. The earlier audio file is kept, so questions already published do not change.",
    CURRENT_VOICE: "Current voice",
    ACCENT_US: "American",
    ACCENT_UK: "British",
    GENDER_FEMALE: "Women",
    GENDER_MALE: "Men",
    LISTEN: "Listen",
    LISTEN_LOADING: "Loading...",
    LISTEN_ERROR: "The sample could not be played. Try again.",
    APPLY: "Use this voice",
    APPLYING: "Creating the audio...",
    CANCEL: "Cancel",
    WORKING_NOTE: "Long passages can take up to a minute and a half. Keep this window open.",
    CATALOG_ERROR: "The list of voices could not be loaded.",
    CHANGE_ERROR: "The voice could not be changed. Try again.",
    CHANGED: "Voice changed.",
    VERSION_CONFLICT: "The question was changed by someone else. Reload the page and try again.",
  },
  vi: {
    CHANGE_VOICE: "Đổi giọng",
    DIALOG_TITLE: "Đổi giọng đọc của câu hỏi",
    DIALOG_HINT:
      "Câu hỏi sẽ được đọc lại bằng giọng bạn chọn. File audio cũ vẫn được giữ, nên các đề đã xuất bản không bị đổi.",
    CURRENT_VOICE: "Giọng hiện tại",
    ACCENT_US: "Giọng Mỹ",
    ACCENT_UK: "Giọng Anh",
    GENDER_FEMALE: "Nữ",
    GENDER_MALE: "Nam",
    LISTEN: "Nghe thử",
    LISTEN_LOADING: "Đang tải...",
    LISTEN_ERROR: "Không phát được mẫu giọng. Hãy thử lại.",
    APPLY: "Dùng giọng này",
    APPLYING: "Đang tạo audio...",
    CANCEL: "Hủy",
    WORKING_NOTE: "Đoạn dài có thể mất tới một phút rưỡi. Hãy giữ cửa sổ này mở.",
    CATALOG_ERROR: "Không tải được danh sách giọng.",
    CHANGE_ERROR: "Không đổi được giọng. Hãy thử lại.",
    CHANGED: "Đã đổi giọng.",
    VERSION_CONFLICT: "Câu hỏi vừa được người khác sửa. Hãy tải lại trang rồi thử lại.",
  },
};
