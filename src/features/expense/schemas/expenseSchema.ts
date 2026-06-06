import { z } from "zod";

const expenseCategory = z.enum([
  "FOOD",
  "TRANSPORT",
  "LODGING",
  "ACTIVITY",
  "SHOPPING",
  "OTHER",
]);

export const createExpenseSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi").max(100),
  amount: z.coerce.number().int("Nominal harus berupa angka bulat").positive("Nominal harus lebih dari 0"),
  date: z.coerce.date({ message: "Tanggal wajib diisi" }),
  category: expenseCategory.default("OTHER"),
  note: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  paidById: z.string().min(1, "Pembayar wajib dipilih"),
  participantIds: z.array(z.string().min(1)).min(1, "Pilih minimal satu peserta"),
});

export const updateExpenseSchema = createExpenseSchema;

export type CreateExpenseSchema = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseSchema = z.infer<typeof updateExpenseSchema>;
