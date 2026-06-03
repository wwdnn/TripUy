"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateTripRequest } from "@/lib/api/trip/updateTrip";
import type { Trip, UpdateTripInput } from "@/types/trip";

export interface UseUpdateTripResult {
  updateTrip: (input: UpdateTripInput) => Promise<Trip | null>;
  isPending: boolean;
  error: string | null;
}

export function useUpdateTrip(tripId: string): UseUpdateTripResult {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, startTransition] = useTransition();

  async function updateTrip(input: UpdateTripInput): Promise<Trip | null> {
    setError(null);
    setIsSubmitting(true);
    try {
      const trip = await updateTripRequest(tripId, input);
      startTransition(() => {
        router.push(`/trips/${tripId}`);
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

  return { updateTrip, isPending: isSubmitting || isTransitioning, error };
}
