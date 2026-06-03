"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTripRequest } from "@/lib/api/trip/createTrip";
import type { CreateTripInput, Trip } from "@/types/trip";

export interface UseCreateTripResult {
  createTrip: (input: CreateTripInput) => Promise<Trip | null>;
  isPending: boolean;
  error: string | null;
}

export function useCreateTrip(): UseCreateTripResult {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, startTransition] = useTransition();

  async function createTrip(input: CreateTripInput): Promise<Trip | null> {
    setError(null);
    setIsSubmitting(true);
    
    try {
      const trip = await createTripRequest(input);
      startTransition(() => {
        router.push(`/trips/${trip.id}`);
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

  return { createTrip, isPending: isSubmitting || isTransitioning, error };
}
