"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/authClient";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";

export interface UseSignOutResult {
  signOut: (redirectTo?: string) => Promise<void>;
  isPending: boolean;
}

export function useSignOut(): UseSignOutResult {
  const router = useRouter();
  const clearUser = useAuthStore((state) => state.clear);
  const [isPending, startTransition] = useTransition();

  async function signOut(redirectTo = "/login"): Promise<void> {
    await authClient.signOut();
    clearUser();
    startTransition(() => {
      router.replace(redirectTo);
      router.refresh();
    });
  }

  return { signOut, isPending };
}
