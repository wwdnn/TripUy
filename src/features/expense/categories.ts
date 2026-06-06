import type { ExpenseCategory } from "@/types/expense";

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "FOOD", label: "Makanan" },
  { value: "TRANSPORT", label: "Transportasi" },
  { value: "LODGING", label: "Penginapan" },
  { value: "ACTIVITY", label: "Aktivitas" },
  { value: "SHOPPING", label: "Belanja" },
  { value: "OTHER", label: "Lainnya" },
];

export function categoryLabel(category: ExpenseCategory): string {
  return EXPENSE_CATEGORIES.find((c) => c.value === category)?.label ?? "Lainnya";
}
