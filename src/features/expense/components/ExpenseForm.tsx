"use client";

import { useState, type JSX } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { EXPENSE_CATEGORIES } from "@/features/expense/categories";
import { createExpenseSchema } from "@/features/expense/schemas/expenseSchema";
import { useCreateExpense } from "@/features/expense/hooks/useCreateExpense";
import { useUpdateExpense } from "@/features/expense/hooks/useUpdateExpense";
import { buildSplits, unitKey } from "@/features/expense/splitForm";
import { SplitTypeSelector } from "./SplitTypeSelector";
import { SplitInputList } from "./SplitInputList";

import type { ExpenseDetail, ExpenseFormContext, SplitType } from "@/types/expense";

type FieldKey = "title" | "amount" | "date" | "category" | "note" | "paidById" | "splits";
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

function initialSelectedKeys(context: ExpenseFormContext, initialData?: ExpenseDetail): string[] {
  if (initialData) return initialData.shares.map((s) => unitKey(s.type, s.refId));
  return context.units.map((u) => unitKey(u.type, u.refId));
}

function initialValues(initialData?: ExpenseDetail): Record<string, string> {
  if (!initialData) return {};
  const values: Record<string, string> = {};
  for (const share of initialData.shares) {
    if (share.splitValue == null) continue;
    const raw = initialData.splitType === "PERCENTAGE" ? share.splitValue / 100 : share.splitValue;
    values[unitKey(share.type, share.refId)] = String(raw);
  }
  return values;
}

export function ExpenseForm({
  mode,
  context,
  expenseId,
  initialData,
}: ExpenseFormProps): JSX.Element {
  const isCreate = mode === "create";

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [amount, setAmount] = useState(initialData ? String(initialData.amount) : "");
  const [date, setDate] = useState(toDateInput(initialData?.date));
  const [category, setCategory] = useState(initialData?.category ?? "OTHER");
  const [note, setNote] = useState(initialData?.note ?? "");
  const [paidById, setPaidById] = useState(initialData?.paidById ?? context.currentMemberId);
  const [splitType, setSplitType] = useState<SplitType>(initialData?.splitType ?? "EQUAL");
  const [selectedKeys, setSelectedKeys] = useState<string[]>(
    initialSelectedKeys(context, initialData),
  );
  const [splitValues, setSplitValues] = useState<Record<string, string>>(initialValues(initialData));
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const createMutation = useCreateExpense(context.tripId);
  const updateMutation = useUpdateExpense(context.tripId, expenseId ?? "");
  const { isPending, error } = isCreate ? createMutation : updateMutation;

  const amountNumber = Number.parseInt(amount, 10) || 0;

  function toggleUnit(key: string): void {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }

  function setUnitValue(key: string, value: string): void {
    setSplitValues((prev) => ({ ...prev, [key]: value }));
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
      splitType,
      splits: buildSplits(selectedKeys, splitValues, splitType),
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

      <SplitTypeSelector value={splitType} onChange={setSplitType} disabled={isPending} />

      <SplitInputList
        units={context.units}
        currency={context.currency}
        amount={amountNumber}
        splitType={splitType}
        selectedKeys={selectedKeys}
        values={splitValues}
        onToggle={toggleUnit}
        onValueChange={setUnitValue}
        disabled={isPending}
        error={fieldErrors.splits}
      />

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
