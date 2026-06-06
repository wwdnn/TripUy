import { z } from "zod";

const expenseCategory = z.enum([
  "FOOD",
  "TRANSPORT",
  "LODGING",
  "ACTIVITY",
  "SHOPPING",
  "OTHER",
]);

const splitType = z.enum(["EQUAL", "EXACT", "PERCENTAGE", "SHARE"]);

const splitInputSchema = z.object({
  type: z.enum(["member", "group"]),
  refId: z.string().min(1),
  value: z.coerce.number().int().optional(),
});

const PERCENTAGE_TOTAL = 10000;

export const createExpenseSchema = z
  .object({
    title: z.string().trim().min(1, "Judul wajib diisi").max(100),
    amount: z.coerce
      .number()
      .int("Nominal harus berupa angka bulat")
      .positive("Nominal harus lebih dari 0"),
    date: z.coerce.date({ message: "Tanggal wajib diisi" }),
    category: expenseCategory.default("OTHER"),
    note: z
      .string()
      .trim()
      .max(500)
      .optional()
      .or(z.literal("").transform(() => undefined)),
    paidById: z.string().min(1, "Pembayar wajib dipilih"),
    splitType: splitType.default("EQUAL"),
    splits: z.array(splitInputSchema).min(1, "Pilih minimal satu peserta"),
  })
  .superRefine((data, ctx) => {
    const addSplitError = (message: string): void => {
      ctx.addIssue({ path: ["splits"], code: z.ZodIssueCode.custom, message });
    };

    if (data.splitType === "EXACT") {
      if (data.splits.some((s) => s.value == null || s.value < 0)) {
        addSplitError("Nominal tiap peserta wajib diisi");
        return;
      }
      const sum = data.splits.reduce((acc, s) => acc + (s.value ?? 0), 0);
      if (sum !== data.amount) {
        addSplitError("Total nominal harus sama dengan jumlah pengeluaran");
      }
      return;
    }

    if (data.splitType === "PERCENTAGE") {
      if (data.splits.some((s) => s.value == null || s.value < 0 || s.value > PERCENTAGE_TOTAL)) {
        addSplitError("Persentase tiap peserta tidak valid");
        return;
      }
      const sum = data.splits.reduce((acc, s) => acc + (s.value ?? 0), 0);
      if (sum !== PERCENTAGE_TOTAL) {
        addSplitError("Total persentase harus 100%");
      }
      return;
    }

    if (data.splitType === "SHARE") {
      if (data.splits.some((s) => s.value == null || s.value < 1)) {
        addSplitError("Bobot tiap peserta harus lebih dari 0");
      }
    }
  });

export const updateExpenseSchema = createExpenseSchema;

export type CreateExpenseSchema = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseSchema = z.infer<typeof updateExpenseSchema>;
