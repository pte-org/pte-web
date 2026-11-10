"use client";

import { simulateScore, type RubricSimulationRequest, type RubricSimulationResponse } from "@pte/api-client";
import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

export function useSimulateScore(): UseMutationResult<RubricSimulationResponse, Error, RubricSimulationRequest> {
  return useMutation({ mutationFn: (request) => simulateScore(apiClient, request) });
}
