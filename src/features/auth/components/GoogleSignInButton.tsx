"use client";

import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import { useSignIn } from "@/features/auth/hooks/useSignIn";

export interface GoogleSignInButtonProps {
  callbackURL?: string;
  label?: string;
}

export function GoogleSignInButton({
  callbackURL = "/dashboard",
  label = "Lanjut dengan Google",
}: GoogleSignInButtonProps): JSX.Element {
  const { signInWithGoogle, isPending } = useSignIn();

  return (
    <Button
      type="button"
      variant="outline"
      className="h-11 w-full"
      disabled={isPending}
      onClick={() => {
        void signInWithGoogle(callbackURL);
      }}
    >
      <GoogleIcon />
      <span>{label}</span>
    </Button>
  );
}

function GoogleIcon(): JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="size-4"
      aria-hidden="true"
    >
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.8 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c10.7 0 19.5-8.6 19.5-19.5 0-1.2-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.3l6.6 4.8C14.6 15.4 18.9 12.5 24 12.5c2.9 0 5.6 1.1 7.7 2.9l5.7-5.7C33.9 6.5 29.2 4.5 24 4.5c-7 0-13 4-16 9.8z"
      />
      <path
        fill="#4CAF50"
        d="M24 43.5c5.1 0 9.7-2 13.2-5.1l-6.1-5c-2 1.4-4.5 2.1-7.1 2.1-5.3 0-9.7-3.1-11.3-7.5l-6.5 5c3 5.8 9 9.5 16 9.5z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.1 5c-.4.4 6.3-4.6 6.3-14.7 0-1.2-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}
