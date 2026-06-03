import { z } from "zod";



const baseTripFields = {
  name: z.string().trim().min(3, "Nama trip minimal 3 karakter").max(60),
  description: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  startDate: z.coerce.date({ message: "Tanggal mulai wajib diisi" }),
  endDate: z.coerce.date().optional(),
  currency: z.string().trim().length(3).default("IDR"),
};

const endAfterStart = (data: { startDate?: Date; endDate?: Date }): boolean =>
  !data.startDate || !data.endDate || data.endDate >= data.startDate;

const endAfterStartMessage = {
  path: ["endDate"],
  message: "Tanggal selesai tidak boleh sebelum tanggal mulai",
};




// ============================================================================
export const createTripSchema = z
  .object(baseTripFields)
  .refine(endAfterStart, endAfterStartMessage);

export const updateTripSchema = z
  .object(baseTripFields)
  .partial()
  .refine(endAfterStart, endAfterStartMessage);

export type CreateTripSchema = z.infer<typeof createTripSchema>;
export type UpdateTripSchema = z.infer<typeof updateTripSchema>;
