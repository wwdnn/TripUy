"use client";

import type { JSX } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SPLIT_TYPE_OPTIONS } from "@/features/expense/splitForm";
import type { SplitType } from "@/types/expense";

interface SplitTypeSelectorProps {
  value: SplitType;
  onChange: (value: SplitType) => void;
  disabled?: boolean;
}

export function SplitTypeSelector({
  value,
  onChange,
  disabled,
}: SplitTypeSelectorProps): JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <Label>Tipe pembagian</Label>
      <div className="border-input grid grid-cols-2 gap-1 rounded-md border p-1 sm:grid-cols-4">
        {SPLIT_TYPE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={cn(
              "flex min-h-11 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors disabled:opacity-50",
              value === option.value
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted text-muted-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
