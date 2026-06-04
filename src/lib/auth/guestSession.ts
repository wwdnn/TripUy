import "server-only";
import { cookies } from "next/headers";

export const GUEST_COOKIE_NAME = "tripuy_guest_id";
export const GUEST_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export async function getGuestId(): Promise<string | null> {
  const store = await cookies();
  return store.get(GUEST_COOKIE_NAME)?.value ?? null;
}
