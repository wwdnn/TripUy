"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { archiveTripRequest } from "@/lib/api/trip/archiveTrip";
import type { Trip, TripStatus } from "@/types/trip";

export interface UseArchiveTripResult {
  archiveTrip: (tripId: string, status: TripStatus) => Promise<Trip | null>;
  isPending: boolean;
  error: string | null;
}

export function useArchiveTrip(): UseArchiveTripResult {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, startTransition] = useTransition();

  async function archiveTrip(tripId: string, status: TripStatus): Promise<Trip | null> {
    setError(null);
    setIsSubmitting(true);
    try {
      const trip = await archiveTripRequest(tripId, status);
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

  return { archiveTrip, isPending: isSubmitting || isTransitioning, error };
}
