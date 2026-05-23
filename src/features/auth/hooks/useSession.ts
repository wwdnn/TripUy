"use client";

import { authClient } from "@/lib/auth/authClient";
import type { SessionData } from "@/types/auth";

export interface UseSessionResult {
  data: SessionData | null;
  isPending: boolean;
  isAuthenticated: boolean;
}

export function useSession(): UseSessionResult {
  const { data, isPending } = authClient.useSession();

  return {
    data: (data as SessionData | null) ?? null,
    isPending,
    isAuthenticated: data !== null && data !== undefined,
  };
}
