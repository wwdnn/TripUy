"use client";

import { useState } from "react";
import { joinTripRequest, type JoinTripPayload } from "@/lib/api/trip/joinTrip";
import type { JoinTripResult } from "@/types/trip";

export interface UseJoinTripResult {
  join: (payload: JoinTripPayload) => Promise<JoinTripResult | null>;
  isPending: boolean;
  error: string | null;
}

export function useJoinTrip(): UseJoinTripResult {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function join(payload: JoinTripPayload): Promise<JoinTripResult | null> {
    setError(null);
    setIsPending(true);
    try {
      return await joinTripRequest(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan, coba lagi");
      return null;
    } finally {
      setIsPending(false);
    }
  }

  return { join, isPending, error };
}
