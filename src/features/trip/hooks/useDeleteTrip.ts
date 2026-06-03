"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteTripRequest } from "@/lib/api/trip/deleteTrip";

export interface UseDeleteTripResult {
  deleteTrip: (tripId: string) => Promise<boolean>;
  isPending: boolean;
  error: string | null;
}

export function useDeleteTrip(): UseDeleteTripResult {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, startTransition] = useTransition();

  async function deleteTrip(tripId: string): Promise<boolean> {
    setError(null);
    setIsSubmitting(true);
    try {
      await deleteTripRequest(tripId);
      startTransition(() => {
        router.push("/trips");
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

  return { deleteTrip, isPending: isSubmitting || isTransitioning, error };
}
