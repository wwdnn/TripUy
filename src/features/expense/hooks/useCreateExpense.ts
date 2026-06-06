"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createExpenseRequest } from "@/lib/api/expense/createExpense";
import type { CreateExpenseInput } from "@/types/expense";

export interface UseCreateExpenseResult {
  createExpense: (input: CreateExpenseInput) => Promise<boolean>;
  isPending: boolean;
  error: string | null;
}

export function useCreateExpense(tripId: string): UseCreateExpenseResult {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, startTransition] = useTransition();

  async function createExpense(input: CreateExpenseInput): Promise<boolean> {
    setError(null);
    setIsSubmitting(true);
    try {
      await createExpenseRequest(tripId, input);
      startTransition(() => {
        router.push(`/trips/${tripId}`);
        router.refresh();
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan, coba lagi");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { createExpense, isPending: isSubmitting || isTransitioning, error };
}
