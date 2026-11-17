import type {
  QuestionGenerationCheckDetail, QuestionGenerationCheckStep, QuestionGenerationLiveCheck,
} from "@pte/api-client";
import type { LaneStatus } from "./liveConstants";

/** The words of the checks made while a draft is written (see the "check" event of the live view). */
interface CheckCopy {
  steps: Record<QuestionGenerationCheckStep, string>;
  preparing: string;
  prompt: string;
  anyTopic: string;
  avoided: string;
  withFeedback: string;
  writing: string;
  written: string;
  jsonValid: string;
  jsonBroken: string;
  jsonRetry: string;
  rulesPassed: string;
  rulesFixed: string;
  rulesBroken: string;
  unique: string;
  duplicate: string;
  /** Names of the detail lines that are not draft fields (draft fields use DRAFT_FIELD_LABELS). */
  details: Record<string, string>;
  chars: string;
  words: string;
  items: string;
  present: string;
  fieldWriting: string;
  fieldDone: string;
  yes: string;
  no: string;
  reviewPrompt: string;
  reviewing: string;
  reviewed: string;
  verdictPass: string;
  verdictFail: string;
  verdictUnreadable: string;
}

export const CHECK_COPY: { vi: CheckCopy; en: CheckCopy } = {
  vi: {
    steps: {
      PROMPT: "Ghép prompt", WRITE: "LLM viết đề", JSON: "Kiểm tra cấu trúc JSON",
      RULES: "Kiểm tra luật của dạng bài", DUPLICATE: "Kiểm tra trùng câu đã có",
      REVIEW_PROMPT: "Ghép prompt review", REVIEW_WRITE: "LLM chấm đề", REVIEW_VERDICT: "Đọc kết luận",
    },
    preparing: "Đang chuẩn bị prompt…",
    prompt: "CEFR {cefr} · chủ đề: {topic}",
    anyTopic: "AI tự chọn",
    avoided: "tránh {count} chủ đề đã có",
    withFeedback: "kèm góp ý của vòng trước",
    writing: "Model đang viết…",
    written: "Đã viết xong",
    jsonValid: "Đủ các trường bắt buộc",
    jsonBroken: "JSON lỗi",
    jsonRetry: "JSON lỗi, yêu cầu model viết lại",
    rulesPassed: "Đạt mọi luật của dạng bài",
    rulesFixed: "Đạt mọi luật sau khi model sửa",
    rulesBroken: "Vi phạm, gửi lại cho model sửa:",
    unique: "Không trùng câu nào trong ngân hàng",
    duplicate: "Trùng câu đã có, viết lại câu khác",
    details: {
      systemPrompt: "Prompt chung của hệ thống", taskPrompt: "Prompt của dạng bài", promptKey: "Mã prompt",
      cefr: "Trình độ CEFR", topicHint: "Chủ đề yêu cầu", avoidedTopics: "Chủ đề đã có cần tránh",
      feedback: "Góp ý của vòng trước", output: "Kết quả model trả về", answerHintVi: "Gợi ý (tiếng Việt)",
      answerHintEn: "Gợi ý (tiếng Anh)", contentHash: "Mã nội dung (hash)", taskType: "Dạng bài",
      withHints: "Kèm gợi ý trả lời", withFix: "Kèm góp ý vòng trước", criteria: "Số tiêu chí đã chấm",
      criteriaFailed: "Số tiêu chí không đạt",
    },
    chars: "{n} ký tự",
    words: "{n} từ",
    items: "{n} mục",
    present: "có",
    fieldWriting: "đang viết…",
    fieldDone: "xong",
    yes: "có",
    no: "không",
    reviewPrompt: "Tiêu chí của dạng bài và trình độ, không kèm prompt của người viết",
    reviewing: "Model đang chấm…",
    reviewed: "Đã chấm xong",
    verdictPass: "Đạt mọi tiêu chí",
    verdictFail: "Có tiêu chí không đạt, gửi góp ý cho người viết",
    verdictUnreadable: "Không đọc được kết luận",
  },
  en: {
    steps: {
      PROMPT: "Build the prompt", WRITE: "LLM writes the draft", JSON: "Check the JSON structure",
      RULES: "Check the task type's rules", DUPLICATE: "Check for duplicates",
      REVIEW_PROMPT: "Build the review prompt", REVIEW_WRITE: "LLM reviews the draft", REVIEW_VERDICT: "Read the verdict",
    },
    preparing: "Preparing the prompt…",
    prompt: "CEFR {cefr} · topic: {topic}",
    anyTopic: "chosen by the AI",
    avoided: "avoids {count} earlier topics",
    withFeedback: "with the feedback of the last round",
    writing: "The model is writing…",
    written: "Written",
    jsonValid: "Every required field is there",
    jsonBroken: "Broken JSON",
    jsonRetry: "Broken JSON, the model is asked again",
    rulesPassed: "Meets every rule of the task type",
    rulesFixed: "Meets every rule after the model fixed it",
    rulesBroken: "Broken, sent back to the model to fix:",
    unique: "No such question in the bank yet",
    duplicate: "Already in the bank, writing another",
    details: {
      systemPrompt: "Shared system prompt", taskPrompt: "Task type prompt", promptKey: "Prompt key",
      cefr: "CEFR level", topicHint: "Topic asked for", avoidedTopics: "Existing topics to avoid",
      feedback: "Feedback of the last round", output: "Model output", answerHintVi: "Hint (Vietnamese)",
      answerHintEn: "Hint (English)", contentHash: "Content hash", taskType: "Task type",
      withHints: "With the answer hints", withFix: "With the last round's fix", criteria: "Criteria checked",
      criteriaFailed: "Criteria failed",
    },
    chars: "{n} characters",
    words: "{n} words",
    items: "{n} items",
    present: "written",
    fieldWriting: "writing…",
    fieldDone: "done",
    yes: "yes",
    no: "no",
    reviewPrompt: "The task type's and level's criteria, without the writer's prompt",
    reviewing: "The model is reviewing…",
    reviewed: "Reviewed",
    verdictPass: "Meets every criterion",
    verdictFail: "Some criteria failed, feedback goes to the writer",
    verdictUnreadable: "The verdict could not be read",
  },
};

export const CHECK_STATUS: Record<QuestionGenerationLiveCheck["status"], LaneStatus> = {
  RUNNING: "active",
  PASSED: "done",
  FAILED: "failed",
};

/** One line saying what a check found, from its facts. */
export function checkSummary(check: QuestionGenerationLiveCheck, copy: CheckCopy): string {
  const { facts } = check;
  switch (check.step) {
    case "PROMPT": {
      const parts = [copy.prompt.replace("{cefr}", facts.cefr ?? "").replace("{topic}", facts.topic || copy.anyTopic)];
      if (Number(facts.avoidedTopics) > 0) parts.push(copy.avoided.replace("{count}", facts.avoidedTopics ?? ""));
      if (facts.feedback === "true") parts.push(copy.withFeedback);
      return parts.join(" · ");
    }
    case "WRITE":
      return check.status === "RUNNING" ? copy.writing : copy.written;
    case "JSON":
      if (check.status === "PASSED") return copy.jsonValid;
      return facts.retry === "true" ? copy.jsonRetry : copy.jsonBroken;
    case "RULES":
      if (check.status === "FAILED") return copy.rulesBroken;
      return facts.fixed === "true" ? copy.rulesFixed : copy.rulesPassed;
    case "REVIEW_PROMPT":
      return copy.reviewPrompt;
    case "REVIEW_WRITE":
      return check.status === "RUNNING" ? copy.reviewing : copy.reviewed;
    case "REVIEW_VERDICT":
      if (check.status === "PASSED") return copy.verdictPass;
      return check.details?.length ? copy.verdictFail : copy.verdictUnreadable;
    default:
      return check.status === "PASSED" ? copy.unique : copy.duplicate;
  }
}

/** The value of one detail line: a size, a text, or "written" for a field the model filled in. */
export function detailValue(detail: QuestionGenerationCheckDetail, copy: CheckCopy): string {
  const count = String(detail.count ?? 0);
  switch (detail.unit) {
    case "CHARS":
      return copy.chars.replace("{n}", count);
    case "WORDS":
      return copy.words.replace("{n}", count);
    case "ITEMS":
      return copy.items.replace("{n}", count);
    case "PRESENT":
      return copy.present;
    default:
      if (detail.key === "topicHint" && !detail.text) return copy.anyTopic;
      if (detail.text === "true" || detail.text === "false") return detail.text === "true" ? copy.yes : copy.no;
      return detail.count === null ? (detail.text ?? "") : `${detail.count}: ${detail.text ?? ""}`;
  }
}

/** The checks of the writer and of the reviewer, each shown under its own step. */
export const REVIEW_STEPS: readonly QuestionGenerationCheckStep[] = ["REVIEW_PROMPT", "REVIEW_WRITE", "REVIEW_VERDICT"];
export const isReviewCheck = (check: QuestionGenerationLiveCheck): boolean => REVIEW_STEPS.includes(check.step);
