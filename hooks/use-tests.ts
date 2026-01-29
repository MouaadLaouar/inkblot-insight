"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Patient } from "./use-patients";

export interface RorschachTest {
  id: string;
  patientId: string;
  createdBy: string;
  testDate: string;
  status: "in_progress" | "completed";
  totalResponses: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  patient?: Patient;
  _count?: {
    responses: number;
  };
}

export interface CreateTestData {
  patientId: string;
  testDate?: string;
  notes?: string;
}

export function useTests(patientId?: string) {
  return useQuery<RorschachTest[]>({
    queryKey: patientId ? ["tests", "patient", patientId] : ["tests"],
    queryFn: async () => {
      const url = patientId
        ? `/api/tests?patientId=${patientId}`
        : "/api/tests";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch tests");
      }
      return response.json();
    },
  });
}

export function useTest(id: string) {
  return useQuery<RorschachTest & { responses: any[] }>({
    queryKey: ["tests", id],
    queryFn: async () => {
      const response = await fetch(`/api/tests/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch test");
      }
      return response.json();
    },
    enabled: !!id,
  });
}

export function useCreateTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTestData) => {
      const response = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create test");
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tests"] });
      queryClient.invalidateQueries({
        queryKey: ["tests", "patient", variables.patientId],
      });
    },
  });
}

export function useUpdateTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{
        testDate: string;
        status: "in_progress" | "completed";
        totalResponses: number;
        notes: string;
      }>;
    }) => {
      const response = await fetch(`/api/tests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update test");
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tests"] });
      queryClient.invalidateQueries({ queryKey: ["tests", variables.id] });
    },
  });
}

export function useDeleteTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/tests/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete test");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
  });
}
