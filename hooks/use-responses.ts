"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface TestResponse {
  id: string;
  testId: string;
  cardNumber: number;
  responseNumber: number;
  responseText: string;
  location: string;
  determinants: string;
  contentCategories: string;
  ban: boolean;
  obs?: string | null;
  intenseTime?: number | null;
  responseTime?: number | null;
  formQuality?: string | null;
  cValue?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateResponseData {
  testId: string;
  cardNumber: number;
  responseNumber: number;
  responseText: string;
  location: string;
  determinants: string;
  contentCategories: string;
  ban?: boolean;
  obs?: string;
  intenseTime?: number;
  responseTime?: number;
  formQuality?: string;
  cValue?: string;
}

export function useResponses(testId: string) {
  return useQuery<TestResponse[]>({
    queryKey: ["responses", testId],
    queryFn: async () => {
      const response = await fetch(`/api/responses?testId=${testId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch responses");
      }
      return response.json();
    },
    enabled: !!testId,
  });
}

export function useCreateResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateResponseData) => {
      const response = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create response");
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["responses", variables.testId],
      });
      queryClient.invalidateQueries({ queryKey: ["tests", variables.testId] });
    },
  });
}

export function useUpdateResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      testId,
      data,
    }: {
      id: string;
      testId: string;
      data: Partial<Omit<CreateResponseData, "testId">>;
    }) => {
      const response = await fetch(`/api/responses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update response");
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["responses", variables.testId],
      });
    },
  });
}

export function useDeleteResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, testId }: { id: string; testId: string }) => {
      const response = await fetch(`/api/responses/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete response");
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["responses", variables.testId],
      });
      queryClient.invalidateQueries({ queryKey: ["tests", variables.testId] });
    },
  });
}
