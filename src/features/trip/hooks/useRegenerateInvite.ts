"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { regenerateInviteRequest } from "@/lib/api/trip/regenerateInvite";
import type { Trip } from "@/types/trip";

export interface UseRegenerateInviteResult {
  regenerate: (tripId: string) => Promise<Trip | null>;
  isPending: boolean;
  error: string | null;
}

export function useRegenerateInvite(): UseRegenerateInviteResult {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, startTransition] = useTransition();

  async function regenerate(tripId: string): Promise<Trip | null> {
    setError(null);
    setIsSubmitting(true);
    try {
      const trip = await regenerateInviteRequest(tripId);
      startTransition(() => {
        router.refresh();
      });
      return trip;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan, coba lagi");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { regenerate, isPending: isSubmitting || isTransitioning, error };
}
