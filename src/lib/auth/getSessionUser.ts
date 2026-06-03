import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";

export async function getSessionUser(): Promise<{ id: string; name: string; email: string } | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  return { id: session.user.id, name: session.user.name, email: session.user.email };
}

export async function requireSessionUser(): Promise<{ id: string; name: string; email: string }> {
  const user = await getSessionUser();
  if (!user) throw new TripAuthError();
  return user;
}

export class TripAuthError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "TripAuthError";
  }
}
