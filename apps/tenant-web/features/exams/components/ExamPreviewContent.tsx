"use client";

import { useMemo, type ReactElement } from "react";
import type { ExamPreviewItem, ExamPreviewResponse } from "@pte/api-client";
import { Badge, useLocale } from "@pte/ui";

interface ExamPreviewContentProps {
  preview: ExamPreviewResponse;
  showReportAction?: boolean;
  onReport?: (questionPublicId: string) => void;
  isReported?: (questionPublicId: string) => boolean;
}

interface PreviewTaskGroup {
  key: string;
  label: string;
  items: ExamPreviewItem[];
}

interface PreviewSectionGroup {
  key: string;
  tasks: PreviewTaskGroup[];
}

const toDomId = (prefix: string, value: string): string =>
  prefix + "-" + value.replace(/[^a-zA-Z0-9_-]+/g, "-");

const groupItems = (items: ExamPreviewItem[]): PreviewSectionGroup[] => {
  const orderedItems = items
    .map((item, sourceIndex) => ({ item, sourceIndex }))
    .sort(
      (left, right) =>
        left.item.orderIndex - right.item.orderIndex || left.sourceIndex - right.sourceIndex,
    )
    .map(({ item }) => item);

  const sections = new Map<string, Map<string, PreviewTaskGroup>>();

  for (const item of orderedItems) {
    const sectionKey = item.section || "unknown-section";
    const taskKey = item.taskType || "unknown-task";
    let tasks = sections.get(sectionKey);
    if (!tasks) {
      tasks = new Map<string, PreviewTaskGroup>();
      sections.set(sectionKey, tasks);
    }

    let task = tasks.get(taskKey);
    if (!task) {
      task = {
        key: taskKey,
        label: item.taskTypeDisplayName || item.taskType,
        items: [],
      };
      tasks.set(taskKey, task);
    }
    task.items.push(item);
  }

  return Array.from(sections, ([key, tasks]) => ({
    key,
    tasks: Array.from(tasks.values()),
  }));
};

const getWordCountValue = (min: number | null, max: number | null): string | null => {
  if (min !== null && max !== null) return String(min) + "\u2013" + String(max);
  if (min !== null) return "\u2265 " + String(min);
  if (max !== null) return "\u2264 " + String(max);
  return null;
};

interface PreviewItemProps {
  item: ExamPreviewItem;
  showReportAction: boolean;
  onReport?: (questionPublicId: string) => void;
  isReported?: (questionPublicId: string) => boolean;
}

const PreviewItem = ({
  item,
  showReportAction,
  onReport,
  isReported,
}: PreviewItemProps): ReactElement => {
  const { t } = useLocale();
  const wordCountValue = getWordCountValue(item.minWordCount, item.maxWordCount);
  const questionPublicId = item.sourceQuestionPublicId;
  const reported = Boolean(questionPublicId && isReported?.(questionPublicId));
  const orderedOptions = item.options
    .map((option, sourceIndex) => ({ option, sourceIndex }))
    .sort(
      (left, right) =>
        left.option.orderIndex - right.option.orderIndex || left.sourceIndex - right.sourceIndex,
    )
    .map(({ option }) => option);
  const questionHeadingId = "exam-preview-question-" + String(item.orderIndex);

  return (
    <article
      aria-labelledby={questionHeadingId}
      className="flex flex-col gap-3 rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] p-4 shadow-sm motion-safe:animate-pte-fade-up"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-[var(--ink-secondary)]">
          #{item.orderIndex + 1}
        </span>
        <Badge variant="info">{item.section}</Badge>
        <span className="text-sm font-semibold text-[var(--ink-primary)]">
          {item.taskTypeDisplayName || item.taskType}
        </span>
        {wordCountValue && (
          <span className="text-xs text-[var(--ink-secondary)]">
            {t("tenant.examQuestions.wordCount", "{value} words", { value: wordCountValue })}
          </span>
        )}
        {showReportAction && questionPublicId && onReport && (
          <button
            type="button"
            onClick={() => onReport(questionPublicId)}
            disabled={reported}
            aria-pressed={reported}
            aria-label={
              reported
                ? t("tenant.examQuestions.reported", "Reported")
                : t("tenant.examQuestions.report", "Report a question issue")
            }
            className="ml-auto rounded-md border border-[var(--blush-action)] px-2.5 py-1 text-xs font-semibold text-[var(--blush-action)] transition-colors hover:bg-[var(--blush-tint)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {reported
              ? t("tenant.examQuestions.reported", "Reported")
              : t("tenant.examQuestions.report", "Report")}
          </button>
        )}
      </div>

      {item.title ? (
        <h6 id={questionHeadingId} className="text-base font-semibold text-[var(--ink-primary)]">
          {item.title}
        </h6>
      ) : (
        <h6 id={questionHeadingId} className="sr-only">
          #{item.orderIndex + 1}
        </h6>
      )}
      {item.promptText && (
        <p className="whitespace-pre-wrap text-sm leading-6 text-[var(--ink-primary)]">
          {item.promptText}
        </p>
      )}

      {item.imageUrl && (
        // The image is an exam prompt asset, not decorative content.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.imageUrl}
          alt={t("tenant.examQuestions.imageAlt", "Question prompt image")}
          className="max-h-96 w-auto max-w-full rounded-md border border-[var(--shell-border)] object-contain"
        />
      )}

      {item.audioUrl && (
        <div className="flex flex-col gap-2">
          <span
            id={"exam-preview-audio-" + String(item.orderIndex)}
            className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-secondary)]"
          >
            {t("tenant.examQuestions.audio", "Audio prompt")}
          </span>
          <audio
            controls
            preload="none"
            src={item.audioUrl}
            aria-labelledby={"exam-preview-audio-" + String(item.orderIndex)}
            className="w-full"
          />
        </div>
      )}

      {orderedOptions.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-secondary)]">
            {t("tenant.examQuestions.options", "Options")}
          </span>
          <ol className="flex flex-col gap-2">
            {orderedOptions.map((option) => (
              <li
                key={
                  String(item.orderIndex) +
                  "-" +
                  String(option.orderIndex) +
                  "-" +
                  String(option.blankIndex ?? "all") +
                  "-" +
                  option.text
                }
                className="rounded-md border border-[var(--shell-border)] bg-[var(--surface-subtle)] px-3 py-2 text-sm text-[var(--ink-primary)]"
              >
                {option.text}
              </li>
            ))}
          </ol>
        </div>
      )}
    </article>
  );
};

export const ExamPreviewContent = ({
  preview,
  showReportAction = true,
  onReport,
  isReported,
}: ExamPreviewContentProps): ReactElement => {
  const { t } = useLocale();
  const sections = useMemo(() => groupItems(preview.items), [preview.items]);

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-[var(--shell-border)] bg-[var(--surface-subtle)] p-4">
        <div>
          <h3 className="text-lg font-semibold text-[var(--ink-primary)]">
            {t("tenant.examQuestions.title", "Exam questions")}
          </h3>
          {preview.name && (
            <p className="mt-1 text-sm font-medium text-[var(--ink-primary)]">{preview.name}</p>
          )}
          <p className="mt-1 text-sm text-[var(--ink-secondary)]">
            {t("tenant.examQuestions.itemCount", "{count} questions", {
              count: preview.items.length,
            })}{" "}
            · v{preview.version}
          </p>
        </div>
        <p className="max-w-xl text-xs leading-5 text-[var(--ink-secondary)]">
          {t(
            "tenant.examQuestions.answerKeyNotice",
            "Correct answers and scoring keys are hidden in this preview.",
          )}
        </p>
      </header>

      {sections.map((section) => {
        const sectionId = toDomId("exam-preview-section", section.key);
        return (
          <section key={section.key} aria-labelledby={sectionId} className="flex flex-col gap-3">
            <h4
              id={sectionId}
              className="border-b border-[var(--shell-border)] pb-2 text-sm font-semibold uppercase tracking-wide text-[var(--ink-secondary)]"
            >
              {section.key}
            </h4>
            {section.tasks.map((task) => {
              const taskId = toDomId(sectionId + "-task", task.key);
              return (
                <section
                  key={section.key + "-" + task.key}
                  aria-labelledby={taskId}
                  className="flex flex-col gap-3"
                >
                  <h5 id={taskId} className="text-sm font-semibold text-[var(--ink-primary)]">
                    {task.label}
                  </h5>
                  <div className="flex flex-col gap-3">
                    {task.items.map((item) => (
                      <PreviewItem
                        key={
                          String(item.orderIndex) +
                          "-" +
                          (item.sourceQuestionPublicId ?? "generated")
                        }
                        item={item}
                        showReportAction={showReportAction}
                        onReport={onReport}
                        isReported={isReported}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </section>
        );
      })}
    </div>
  );
};
