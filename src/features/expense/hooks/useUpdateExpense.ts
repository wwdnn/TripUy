"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateExpenseRequest } from "@/lib/api/expense/updateExpense";
import type { UpdateExpenseInput } from "@/types/expense";

export interface UseUpdateExpenseResult {
  updateExpense: (input: UpdateExpenseInput) => Promise<boolean>;
  isPending: boolean;
  error: string | null;
}




export function useUpdateExpense(tripId: string, expenseId: string): UseUpdateExpenseResult {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, startTransition] = useTransition();

  async function updateExpense(input: UpdateExpenseInput): Promise<boolean> {
    setError(null);
    setIsSubmitting(true);
    try {
      await updateExpenseRequest(tripId, expenseId, input);
      startTransition(() => {
        router.push(`/trips/${tripId}/expenses/${expenseId}`);
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

  return { updateExpense, isPending: isSubmitting || isTransitioning, error };
}
