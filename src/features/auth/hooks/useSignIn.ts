"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/authClient";
import type { LoginInput } from "@/features/auth/schemas/loginSchema";

export interface UseSignInResult {
  signIn: (input: LoginInput) => Promise<void>;
  signInWithGoogle: (callbackURL?: string) => Promise<void>;
  isPending: boolean;
  error: string | null;
}

const GENERIC_CREDENTIAL_ERROR = "Email atau password salah";
const GENERIC_NETWORK_ERROR = "Terjadi kesalahan, coba lagi";

export function useSignIn(): UseSignInResult {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function signIn(input: LoginInput): Promise<void> {
    setError(null);
    const result = await authClient.signIn.email({
      email: input.email,
      password: input.password,
    });

    if (result.error) {
      setError(GENERIC_CREDENTIAL_ERROR);
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  async function signInWithGoogle(callbackURL = "/dashboard"): Promise<void> {
    setError(null);
    try {
      await authClient.signIn.social({ provider: "google", callbackURL });
    } catch {
      setError(GENERIC_NETWORK_ERROR);
    }
  }

  return { signIn, signInWithGoogle, isPending, error };
}
