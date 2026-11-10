import { beforeEach, describe, expect, it, vi } from "vitest";

type QueryOptions = {
  queryKey?: readonly unknown[];
  queryFn?: () => Promise<unknown>;
  enabled?: boolean;
  staleTime?: number;
};

type MutationOptions = {
  mutationFn?: (input: never) => Promise<unknown>;
  onSuccess?: () => void;
};

const hoisted = vi.hoisted(() => ({
  apiClient: { request: "stub-api-client" },
  queryOptions: undefined as QueryOptions | undefined,
  mutationOptions: undefined as MutationOptions | undefined,
  invalidateQueries: vi.fn(),
  api: new Proxy({} as Record<string, ReturnType<typeof vi.fn>>, {
    get(target, name: string) {
      return (target[name] ??= vi.fn());
    },
  }),
}));

vi.mock("@/lib/apiClient", () => ({ apiClient: hoisted.apiClient }));
vi.mock("@pte/api-client", () => new Proxy({}, {
  has: () => true,
  get: (_target, name: string) => {
    if (name === "__esModule") return false;
    if (name === "then") return undefined;
    return hoisted.api[name];
  },
}));
vi.mock("@tanstack/react-query", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-query")>()),
  useQueryClient: () => ({
    invalidateQueries: hoisted.invalidateQueries,
  }),
  useQuery: (options: QueryOptions) => {
    hoisted.queryOptions = options;
    return {};
  },
  useMutation: (options: MutationOptions) => {
    hoisted.mutationOptions = options;
    return {};
  },
}));

import {
  useAnswer,
  useAnswers,
  useHostScoreReview,
  usePublishSessionReports,
  useReportPublicationPreflight,
  useReportPublicationSummary,
} from "../../../../features/exams/api";
import { useAttemptReport } from "../../../../features/exams/api/attemptReport";
import { useAttemptReviews } from "../../../../features/exams/api/attemptReviews";
import { useRescoreSession } from "../../../../features/exams/api/rescore";
import {
  ANSWER_QUERY_KEY,
  ANSWERS_QUERY_KEY,
  HOST_SCORE_REVIEW_QUERY_KEY,
  REPORT_PUBLICATION_READINESS_QUERY_KEY,
  REPORT_PUBLICATION_SUMMARY_QUERY_KEY,
} from "../../../../features/exams/constants";
import {
  ATTEMPT_REPORT_QUERY_KEY,
  ATTEMPT_REVIEWS_QUERY_KEY,
} from "../../../../features/exams/constants/attemptReviews";

const query = () => hoisted.queryOptions!;
const mutation = () => hoisted.mutationOptions!;
const api = hoisted.api;

beforeEach(() => {
  vi.clearAllMocks();
  hoisted.queryOptions = undefined;
  hoisted.mutationOptions = undefined;
});

describe("Answers and Score Review", () => {
  it("useAnswers queries answers with full filtering", async () => {
    api.listAnswers.mockResolvedValue({ items: [] });
    useAnswers("ses-1", "SCORED", 0, 10, "att-1", "john");

    expect(query().queryKey).toEqual([
      ...ANSWERS_QUERY_KEY,
      "ses-1",
      "att-1",
      "SCORED",
      "john",
      0,
      10,
    ]);
    expect(query().enabled).toBe(true);

    await query().queryFn?.();
    expect(api.listAnswers).toHaveBeenCalledWith(hoisted.apiClient, {
      sessionPublicId: "ses-1",
      attemptPublicId: "att-1",
      status: "SCORED",
      search: "john",
      page: 0,
      size: 10,
    });
  });

  it("useAnswer queries single answer detail", async () => {
    api.getAnswer.mockResolvedValue({ publicId: "ans-1" });
    useAnswer("ans-1");

    expect(query().queryKey).toEqual([...ANSWER_QUERY_KEY, "ans-1"]);
    expect(query().enabled).toBe(true);

    await query().queryFn?.();
    expect(api.getAnswer).toHaveBeenCalledWith(hoisted.apiClient, "ans-1");
  });

  it("useHostScoreReview queries scoring overview for session", async () => {
    api.getHostScoreReview.mockResolvedValue({ totalAttempts: 10 });
    useHostScoreReview("ses-1");

    expect(query().queryKey).toEqual([...HOST_SCORE_REVIEW_QUERY_KEY, "ses-1"]);
    expect(query().enabled).toBe(true);

    await query().queryFn?.();
    expect(api.getHostScoreReview).toHaveBeenCalledWith(hoisted.apiClient, "ses-1");
  });
});

describe("Report Publication Hooks", () => {
  it("useReportPublicationPreflight queries preflight when enabled", async () => {
    api.preflightReportPublication.mockResolvedValue({ canPublish: true });
    useReportPublicationPreflight("ses-1", true);

    expect(query().queryKey).toEqual([...REPORT_PUBLICATION_READINESS_QUERY_KEY, "ses-1"]);
    expect(query().enabled).toBe(true);
    expect(query().staleTime).toBe(30_000);

    await query().queryFn?.();
    expect(api.preflightReportPublication).toHaveBeenCalledWith(hoisted.apiClient, "ses-1");
  });

  it("useReportPublicationSummary queries summary when enabled", async () => {
    api.getReportPublicationSummary.mockResolvedValue({ publishedCount: 5 });
    useReportPublicationSummary("ses-1", true);

    expect(query().queryKey).toEqual([...REPORT_PUBLICATION_SUMMARY_QUERY_KEY, "ses-1"]);
    expect(query().enabled).toBe(true);
    expect(query().staleTime).toBe(30_000);

    await query().queryFn?.();
    expect(api.getReportPublicationSummary).toHaveBeenCalledWith(hoisted.apiClient, "ses-1");
  });

  it("usePublishSessionReports publishes reports and invalidates queries", async () => {
    api.publishSessionReports.mockResolvedValue(undefined);
    usePublishSessionReports("ses-1");

    await mutation().mutationFn?.(undefined as never);
    expect(api.publishSessionReports).toHaveBeenCalledWith(hoisted.apiClient, "ses-1");

    mutation().onSuccess?.();
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({
      queryKey: [...HOST_SCORE_REVIEW_QUERY_KEY, "ses-1"],
    });
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({
      queryKey: [...REPORT_PUBLICATION_READINESS_QUERY_KEY, "ses-1"],
    });
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({
      queryKey: [...REPORT_PUBLICATION_SUMMARY_QUERY_KEY, "ses-1"],
    });
  });
});

describe("Attempt Report, Attempt Reviews, and Rescore", () => {
  it("useAttemptReport queries single report", async () => {
    api.getAttemptReport.mockResolvedValue({ overallScore: 79 });
    useAttemptReport("att-1");

    expect(query().queryKey).toEqual([...ATTEMPT_REPORT_QUERY_KEY, "att-1"]);
    expect(query().enabled).toBe(true);

    await query().queryFn?.();
    expect(api.getAttemptReport).toHaveBeenCalledWith(hoisted.apiClient, "att-1");
  });

  it("useAttemptReviews lists all attempt reviews for session", async () => {
    api.listAttemptReviews.mockResolvedValue([]);
    useAttemptReviews("ses-1");

    expect(query().queryKey).toEqual([...ATTEMPT_REVIEWS_QUERY_KEY, "ses-1"]);
    expect(query().enabled).toBe(true);

    await query().queryFn?.();
    expect(api.listAttemptReviews).toHaveBeenCalledWith(hoisted.apiClient, "ses-1");
  });

  it("useRescoreSession mutates rescore and invalidates caches", async () => {
    api.rescoreSession.mockResolvedValue(undefined);
    useRescoreSession("ses-1");

    await mutation().mutationFn?.(undefined as never);
    expect(api.rescoreSession).toHaveBeenCalledWith(hoisted.apiClient, "ses-1");

    mutation().onSuccess?.();
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({
      queryKey: [...HOST_SCORE_REVIEW_QUERY_KEY, "ses-1"],
    });
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({
      queryKey: [...ANSWERS_QUERY_KEY, "ses-1"],
    });
    expect(hoisted.invalidateQueries).toHaveBeenCalledWith({
      queryKey: [...ATTEMPT_REVIEWS_QUERY_KEY, "ses-1"],
    });
  });
});

