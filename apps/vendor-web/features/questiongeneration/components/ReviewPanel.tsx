"use client";

import { generationMessages } from "../messages/en";
import type { GenerationMetaResponse } from "@pte/api-client";

interface ReviewPanelProps {
  meta: GenerationMetaResponse | null;
  isLoading?: boolean;
}

/**
 * Displays AI review checks with verdict, metrics, and key points
 * Renders AI review results when generation metadata is available
 */
export const ReviewPanel = ({ meta, isLoading }: ReviewPanelProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-32 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (!meta) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No AI review data available</p>
      </div>
    );
  }

  const { review, metrics, keyPoints, topic } = meta;

  const checkList = Object.entries(review?.checks ?? {}).map(([checkName, checkResult]) => {
    const labels: Record<string, string> = {
      taskFidelity: generationMessages.checkTaskFidelity,
      cefrFit: generationMessages.checkCefrFit,
      answerKey: generationMessages.checkAnswerKey,
      scorability: generationMessages.checkScorability,
      clarity: generationMessages.checkClarity,
      safety: generationMessages.checkSafety,
    };
    return {
      key: checkName,
      label: labels[checkName] ?? checkName,
      passed: checkResult?.ok ?? false,
    };
  });

  return (
    <div className="space-y-6 p-4">
      {/* Topic & Verdict */}
      <div className="space-y-2">
        {topic && (
          <p className="text-sm">
            <span className="font-medium">Topic:</span> {topic}
          </p>
        )}
        {review?.verdict && (
          <div>
            <span
              className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                review.verdict === "PASS"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {review.verdict === "PASS"
                ? generationMessages.verdictPass
                : generationMessages.verdictFail}
            </span>
          </div>
        )}
      </div>

      {/* Checks */}
      <div>
        <h3 className="text-sm font-semibold mb-3">
          {generationMessages.reviewCheckTitle}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {checkList.map((check) => (
            <div
              key={check.key}
              className={`px-3 py-2 rounded text-sm ${
                check.passed
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              <span className="flex items-center gap-1">
                {check.passed ? "✓" : "✗"} {check.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Notes & Fix Suggestion */}
      {review?.fixSuggestion && (
        <div>
          <h3 className="text-sm font-semibold mb-2">
            {generationMessages.fixSuggestionLabel}
          </h3>
          <p className="text-sm text-gray-700">{review.fixSuggestion}</p>
        </div>
      )}

      {/* Metrics */}
      {metrics && (
        <div>
          <h3 className="text-sm font-semibold mb-2">
            {generationMessages.metricsLabel}
          </h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Words:</span>{" "}
              <span className="font-medium">{metrics.words}</span>
            </div>
            <div>
              <span className="text-gray-600">Avg Sentence:</span>{" "}
              <span className="font-medium">{metrics.avgSentenceLength.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-gray-600">Flesch-Kincaid:</span>{" "}
              <span className="font-medium">{metrics.fleschKincaid.toFixed(1)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Key Points */}
      {keyPoints && keyPoints.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">
            {generationMessages.keyPointsLabel}
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            {keyPoints.map((point: string, idx: number) => (
              <li key={idx}>{point}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
