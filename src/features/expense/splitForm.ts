import type { SplitInput, SplitType, SplitUnitType } from "@/types/expense";

export const SPLIT_TYPE_OPTIONS: { value: SplitType; label: string }[] = [
  { value: "EQUAL", label: "Rata" },
  { value: "EXACT", label: "Nominal" },
  { value: "PERCENTAGE", label: "Persentase" },
  { value: "SHARE", label: "Bobot" },
];

export function unitKey(type: SplitUnitType, refId: string): string {
  return `${type}:${refId}`;
}

export function parseUnitKey(key: string): { type: SplitUnitType; refId: string } {
  const separator = key.indexOf(":");
  const type = key.slice(0, separator) as SplitUnitType;
  return { type, refId: key.slice(separator + 1) };
}

export function toRawValue(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function buildSplits(
  selectedKeys: string[],
  values: Record<string, string>,
  splitType: SplitType,
): SplitInput[] {
  return selectedKeys.map((key) => {
    const { type, refId } = parseUnitKey(key);
    if (splitType === "EQUAL") return { type, refId };

    const raw = toRawValue(values[key] ?? "");
    const value = splitType === "PERCENTAGE" ? raw * 100 : raw;
    return { type, refId, value };
  });
}
