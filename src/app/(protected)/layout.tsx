import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { JSX, ReactNode } from "react";
import { auth } from "@/lib/auth/auth";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps): Promise<JSX.Element> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  return <div className="min-h-svh">{children}</div>;
}
