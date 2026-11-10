"use client";

import { useQuery } from "@tanstack/react-query";
import { getMediaPreview } from "@pte/api-client";
import { apiClient } from "@/lib/apiClient";

const MEDIA_PREVIEW_STALE_MS = 5 * 60 * 1000;

/** The playable address of an uploaded prompt file (null while there is none yet) and whether it is still loading. */
export const usePromptMedia = (
  mediaPublicId: string | null,
): { url: string | null; isLoading: boolean } => {
  const { data, isLoading } = useQuery({
    queryKey: ["media-preview", mediaPublicId],
    queryFn: () => getMediaPreview(apiClient, mediaPublicId as string),
    enabled: mediaPublicId !== null,
    staleTime: MEDIA_PREVIEW_STALE_MS,
  });
  return { url: mediaPublicId === null ? null : (data?.url ?? null), isLoading };
};

/** The playable address of an uploaded prompt file, or null while there is none yet. */
export const usePromptMediaUrl = (mediaPublicId: string | null): string | null =>
  usePromptMedia(mediaPublicId).url;
