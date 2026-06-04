import { z } from "zod";

export const joinTripSchema = z.object({
  inviteCode: z.string().trim().min(1, "Kode undangan wajib diisi"),
  guestName: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter")
    .max(40, "Nama maksimal 40 karakter")
    .optional(),
});

export type JoinTripSchema = z.infer<typeof joinTripSchema>;
