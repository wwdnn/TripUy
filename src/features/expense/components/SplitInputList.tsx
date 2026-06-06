"use client";

import type { JSX } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, formatMoney } from "@/lib/utils";
import { calculateShares } from "@/features/expense/services/calculateShares";
import { buildSplits, toRawValue, unitKey } from "@/features/expense/splitForm";
import type { ExpenseUnitOption, SplitType } from "@/types/expense";

interface SplitInputListProps {
  units: ExpenseUnitOption[];
  currency: string;
  amount: number;
  splitType: SplitType;
  selectedKeys: string[];
  values: Record<string, string>;
  onToggle: (key: string) => void;
  onValueChange: (key: string, value: string) => void;
  disabled?: boolean;
  error?: string;
}

function valueSuffix(splitType: SplitType, currency: string): string {
  if (splitType === "EXACT") return currency;
  if (splitType === "PERCENTAGE") return "%";
  return "bagian";
}

export function SplitInputList({
  units,
  currency,
  amount,
  splitType,
  selectedKeys,
  values,
  onToggle,
  onValueChange,
  disabled,
  error,
}: SplitInputListProps): JSX.Element {
  const selectedSet = new Set(selectedKeys);
  const previewByKey = new Map<string, number>();
  for (const share of calculateShares(amount, splitType, buildSplits(selectedKeys, values, splitType))) {
    previewByKey.set(unitKey(share.type, share.refId), share.amount);
  }

  const selectedValues = selectedKeys.map((key) => toRawValue(values[key] ?? ""));
  const allocatedExact = selectedValues.reduce((acc, v) => acc + v, 0);
  const totalPercent = selectedValues.reduce((acc, v) => acc + v, 0);
  const totalWeight = selectedValues.reduce((acc, v) => acc + v, 0);

  return (
    <div className="flex flex-col gap-2">
      <Label>Ditanggung oleh</Label>
      <div className="border-input flex flex-col gap-1 rounded-md border p-2">
        {units.map((unit) => {
          const key = unitKey(unit.type, unit.refId);
          const isSelected = selectedSet.has(key);
          const preview = previewByKey.get(key) ?? 0;

          return (
            <div key={key} className="flex flex-col gap-1 rounded-md px-2 py-1">
              <div className="flex min-h-11 items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggle(key)}
                  disabled={disabled}
                  className="size-4"
                />
                <span className="flex-1">
                  {unit.name}
                  {unit.type === "group" ? (
                    <span className="bg-muted text-muted-foreground ml-2 rounded px-1.5 py-0.5 text-xs">
                      Grup
                    </span>
                  ) : null}
                </span>
                {isSelected ? (
                  <span className="text-muted-foreground text-xs">
                    {formatMoney(preview, currency)}
                  </span>
                ) : null}
              </div>

              {isSelected && splitType !== "EQUAL" ? (
                <div className="flex items-center gap-2 pl-7">
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={splitType === "SHARE" ? 1 : 0}
                    value={values[key] ?? ""}
                    onChange={(e) => onValueChange(key, e.target.value)}
                    disabled={disabled}
                    className="h-9"
                  />
                  <span className="text-muted-foreground w-16 shrink-0 text-xs">
                    {valueSuffix(splitType, currency)}
                  </span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <SplitSummaryHint
        splitType={splitType}
        currency={currency}
        amount={amount}
        count={selectedKeys.length}
        allocatedExact={allocatedExact}
        totalPercent={totalPercent}
        totalWeight={totalWeight}
      />

      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </div>
  );
}

interface SplitSummaryHintProps {
  splitType: SplitType;
  currency: string;
  amount: number;
  count: number;
  allocatedExact: number;
  totalPercent: number;
  totalWeight: number;
}

function SplitSummaryHint({
  splitType,
  currency,
  amount,
  count,
  allocatedExact,
  totalPercent,
  totalWeight,
}: SplitSummaryHintProps): JSX.Element | null {
  if (count === 0) return null;

  if (splitType === "EQUAL") {
    return <p className="text-muted-foreground text-xs">Dibagi rata ke {count} peserta</p>;
  }

  if (splitType === "EXACT") {
    const remaining = amount - allocatedExact;
    const isBalanced = remaining === 0;
    return (
      <p className={cn("text-xs", isBalanced ? "text-muted-foreground" : "text-destructive")}>
        Teralokasi {formatMoney(allocatedExact, currency)} / {formatMoney(amount, currency)}
        {isBalanced ? "" : ` • sisa ${formatMoney(remaining, currency)}`}
      </p>
    );
  }

  if (splitType === "PERCENTAGE") {
    const isBalanced = totalPercent === 100;
    return (
      <p className={cn("text-xs", isBalanced ? "text-muted-foreground" : "text-destructive")}>
        Total {totalPercent}% {isBalanced ? "" : "(harus 100%)"}
      </p>
    );
  }

  return <p className="text-muted-foreground text-xs">Total bobot {totalWeight}</p>;
}
