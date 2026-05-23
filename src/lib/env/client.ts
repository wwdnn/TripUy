import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.url(),
  NEXT_PUBLIC_DEFAULT_CURRENCY: z.string().min(1),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

const rawClientEnv = {
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_DEFAULT_CURRENCY: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY,
};

let cachedEnv: ClientEnv | null = null;

export function getClientEnv(): ClientEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = clientEnvSchema.safeParse(rawClientEnv);

  if (!parsed.success) {
    const messages = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
    throw new Error(`Invalid client environment variables: ${messages}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}
