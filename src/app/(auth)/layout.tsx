import type { JSX, ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps): JSX.Element {
  return (
    <main className="bg-background flex min-h-svh items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
