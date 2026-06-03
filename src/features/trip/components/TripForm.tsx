"use client";

import { useState, type JSX } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTripSchema, type CreateTripSchema } from "@/features/trip/schemas/tripSchema";
import { useCreateTrip } from "@/features/trip/hooks/useCreateTrip";
import { useUpdateTrip } from "@/features/trip/hooks/useUpdateTrip";
import type { Trip } from "@/types/trip";

type FieldKey = "name" | "description" | "startDate" | "endDate" | "currency";
type FieldErrors = Partial<Record<FieldKey, string>>;

interface TripFormProps {
  mode: "create" | "edit";
  initialData?: Trip;
}

function toDateInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().slice(0, 10);
}

export function TripForm({ mode, initialData }: TripFormProps): JSX.Element {
  const [name, setName] = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [startDate, setStartDate] = useState(toDateInput(initialData?.startDate));
  const [endDate, setEndDate] = useState(toDateInput(initialData?.endDate));
  const [currency, setCurrency] = useState(initialData?.currency ?? "IDR");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const createMutation = useCreateTrip();
  const updateMutation = useUpdateTrip(initialData?.id ?? "");
  const isCreate = mode === "create";
  const { isPending, error } = isCreate ? createMutation : updateMutation;

  async function submit(): Promise<void> {
    setFieldErrors({});
    const parsed = createTripSchema.safeParse({
      name,
      description,
      startDate,
      endDate: endDate || undefined,
      currency,
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

    const input: CreateTripSchema = parsed.data;
    if (isCreate) {
      await createMutation.createTrip(input);
    } else {
      await updateMutation.updateTrip(input);
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
        <Label htmlFor="name">Nama trip</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPending}
          required
        />
        {fieldErrors.name ? <p className="text-destructive text-sm">{fieldErrors.name}</p> : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Deskripsi (opsional)</Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isPending}
          rows={3}
          className="border-input bg-background focus-visible:ring-ring rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
        />
        {fieldErrors.description ? (
          <p className="text-destructive text-sm">{fieldErrors.description}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="startDate">Tanggal mulai</Label>
        <Input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          disabled={isPending}
          required
        />
        {fieldErrors.startDate ? (
          <p className="text-destructive text-sm">{fieldErrors.startDate}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="endDate">Tanggal selesai (opsional)</Label>
        <Input
          id="endDate"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          disabled={isPending}
        />
        {fieldErrors.endDate ? (
          <p className="text-destructive text-sm">{fieldErrors.endDate}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="currency">Mata uang</Label>
        <Input
          id="currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value.toUpperCase())}
          disabled={isPending}
          maxLength={3}
          required
        />
        {fieldErrors.currency ? (
          <p className="text-destructive text-sm">{fieldErrors.currency}</p>
        ) : null}
      </div>

      {error ? (
        <p className="text-destructive bg-destructive/10 rounded-md p-3 text-sm" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" className="h-11 w-full" disabled={isPending}>
        {isPending
          ? "Memproses..."
          : isCreate
            ? "Buat Trip"
            : "Simpan Perubahan"}
      </Button>
    </form>
  );
}
