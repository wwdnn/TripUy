"use client";

import { useState, type JSX } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { EXPENSE_CATEGORIES } from "@/features/expense/categories";
import { createExpenseSchema } from "@/features/expense/schemas/expenseSchema";
import { useCreateExpense } from "@/features/expense/hooks/useCreateExpense";
import { useUpdateExpense } from "@/features/expense/hooks/useUpdateExpense";

import type { ExpenseDetail, ExpenseFormContext } from "@/types/expense";

type FieldKey = "title" | "amount" | "date" | "category" | "note" | "paidById" | "participantIds";
type FieldErrors = Partial<Record<FieldKey, string>>;

interface ExpenseFormProps {
  mode: "create" | "edit";
  context: ExpenseFormContext;
  expenseId?: string;
  initialData?: ExpenseDetail;
}

function toDateInput(date: Date | string | null | undefined): string {
  if (!date) return new Date().toISOString().slice(0, 10);
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}









export function ExpenseForm({ mode, context, expenseId, initialData }: ExpenseFormProps): JSX.Element {
  const isCreate = mode === "create";

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [amount, setAmount] = useState(initialData ? String(initialData.amount) : "");
  const [date, setDate] = useState(toDateInput(initialData?.date));
  const [category, setCategory] = useState(initialData?.category ?? "OTHER");
  const [note, setNote] = useState(initialData?.note ?? "");
  const [paidById, setPaidById] = useState(initialData?.paidById ?? context.currentMemberId);
  const [participantIds, setParticipantIds] = useState<string[]>(
    initialData ? initialData.shares.map((s) => s.memberId) : context.members.map((m) => m.id),
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const createMutation = useCreateExpense(context.tripId);
  const updateMutation = useUpdateExpense(context.tripId, expenseId ?? "");
  const { isPending, error } = isCreate ? createMutation : updateMutation;

  function toggleParticipant(memberId: string): void {
    setParticipantIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId],
    );
  }







  async function submit(): Promise<void> {
    setFieldErrors({});
    const parsed = createExpenseSchema.safeParse({
      title,
      amount,
      date,
      category,
      note: note || undefined,
      paidById,
      participantIds,
    });

    if (!parsed.success) {
      const errors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as FieldKey | undefined;
        if (key && !errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    if (isCreate) {
      await createMutation.createExpense(parsed.data);
    } else {
      await updateMutation.updateExpense(parsed.data);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      className="flex flex-col gap-4"
      noValidate
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Judul pengeluaran</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isPending}
          placeholder="Makan malam, bensin, tiket..."
          required
        />
        {fieldErrors.title ? <p className="text-destructive text-sm">{fieldErrors.title}</p> : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="amount">Nominal ({context.currency})</Label>
        <Input
          id="amount"
          type="number"
          inputMode="numeric"
          min={1}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={isPending}
          required
        />
        {fieldErrors.amount ? (
          <p className="text-destructive text-sm">{fieldErrors.amount}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="date">Tanggal</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          disabled={isPending}
          required
        />
        {fieldErrors.date ? <p className="text-destructive text-sm">{fieldErrors.date}</p> : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="category">Kategori</Label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as typeof category)}
          disabled={isPending}
          className="border-input bg-background focus-visible:ring-ring h-11 rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
        >
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="paidById">Dibayar oleh</Label>
        <select
          id="paidById"
          value={paidById}
          onChange={(e) => setPaidById(e.target.value)}
          disabled={isPending}
          className="border-input bg-background focus-visible:ring-ring h-11 rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
        >
          {context.members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        {fieldErrors.paidById ? (
          <p className="text-destructive text-sm">{fieldErrors.paidById}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Ditanggung oleh</Label>
        <div className="border-input flex flex-col gap-1 rounded-md border p-2">
          {context.members.map((m) => (
            <label
              key={m.id}
              className="hover:bg-muted flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 text-sm"
            >
              <input
                type="checkbox"
                checked={participantIds.includes(m.id)}
                onChange={() => toggleParticipant(m.id)}
                disabled={isPending}
                className="size-4"
              />
              {m.name}
            </label>
          ))}
        </div>
        {fieldErrors.participantIds ? (
          <p className="text-destructive text-sm">{fieldErrors.participantIds}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="note">Catatan (opsional)</Label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={isPending}
          rows={2}
          className="border-input bg-background focus-visible:ring-ring rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
        />
      </div>

      {error ? (
        <p className="text-destructive bg-destructive/10 rounded-md p-3 text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" className="h-11 w-full" disabled={isPending}>
        {isPending ? "Memproses..." : isCreate ? "Tambah Pengeluaran" : "Simpan Perubahan"}
      </Button>
    </form>
  );
}
