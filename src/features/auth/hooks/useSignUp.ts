"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/authClient";
import type { RegisterInput } from "@/features/auth/schemas/registerSchema";

export interface UseSignUpResult {
  signUp: (input: RegisterInput) => Promise<void>;
  isPending: boolean;
  error: string | null;
}

const EMAIL_TAKEN_ERROR = "Email sudah digunakan";
const GENERIC_ERROR = "Terjadi kesalahan, coba lagi";



// ===========================================================================
export function useSignUp(): UseSignUpResult {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function signUp(input: RegisterInput): Promise<void> {
    setError(null);
    const result = await authClient.signUp.email({
      name: input.name,
      email: input.email,
      password: input.password,
    });

    if (result.error) {
      const code = result.error.code ?? "";
      if (code.toUpperCase().includes("EMAIL")) {
        setError(EMAIL_TAKEN_ERROR);
      } else {
        setError(GENERIC_ERROR);
      }
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  return { signUp, isPending, error };
}
