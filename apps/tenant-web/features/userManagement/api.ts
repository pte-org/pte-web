"use client";

import { sendCredentialsEmail, type GeneratedCredentialsResponse } from "@pte/api-client";
import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

/** Rotates the credential and invalidates every tenant account read model. */
export function useSendUserCredentials(): UseMutationResult<
  GeneratedCredentialsResponse,
  unknown,
  string
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (publicId) => sendCredentialsEmail(apiClient, publicId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["examStaff"] });
      void queryClient.invalidateQueries({ queryKey: ["studentRoster"] });
      void queryClient.invalidateQueries({ queryKey: ["tenantUsers"] });
    },
  });
}
