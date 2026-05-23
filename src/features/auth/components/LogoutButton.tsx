"use client";

import type { JSX, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useSignOut } from "@/features/auth/hooks/useSignOut";

export interface LogoutButtonProps {
  children?: ReactNode;
  redirectTo?: string;
}

export function LogoutButton({
  children = "Keluar",
  redirectTo = "/login",
}: LogoutButtonProps): JSX.Element {
  const { signOut, isPending } = useSignOut();

  return (
    <Button
      type="button"
      variant="ghost"
      className="h-11"
      disabled={isPending}
      onClick={() => {
        void signOut(redirectTo);
      }}
    >
      {isPending ? "Memproses..." : children}
    </Button>
  );
}
