"use client";

import { useState, type JSX } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGroupMutations } from "../hooks/useGroupMutations";
import { createGroupSchema } from "../schemas/groupSchema";
import { GroupCard } from "./GroupCard";
import type { TripGroupData } from "@/types/group";

interface GroupManagerProps {
  tripId: string;
  data: TripGroupData;
}

export function GroupManager({ tripId, data }: GroupManagerProps): JSX.Element {
  const { createGroup, isPending, error } = useGroupMutations(tripId);
  const [name, setName] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [nameError, setNameError] = useState<string | null>(null);

  function toggle(id: string): void {
    setMemberIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function submit(): Promise<void> {
    setNameError(null);
    const parsed = createGroupSchema.safeParse({ name, memberIds });
    if (!parsed.success) {
      setNameError(parsed.error.issues[0]?.message ?? "Data tidak valid");
      return;
    }
    const success = await createGroup(parsed.data);
    if (success) {
      setName("");
      setMemberIds([]);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className="border-border bg-card flex flex-col gap-4 rounded-xl border p-6"
        noValidate
      >
        <h2 className="text-base font-semibold">Buat grup baru</h2>

        <div className="flex flex-col gap-2">
          <Label htmlFor="group-name">Nama grup</Label>
          <Input
            id="group-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            placeholder="Keluarga, Pasangan, ..."
          />
          {nameError ? <p className="text-destructive text-sm">{nameError}</p> : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label>Anggota (opsional)</Label>
          <div className="border-input flex flex-col gap-1 rounded-md border p-2">
            {data.members.map((m) => (
              <label
                key={m.id}
                className="hover:bg-muted flex min-h-11 cursor-pointer items-center gap-3 rounded-md px-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={memberIds.includes(m.id)}
                  onChange={() => toggle(m.id)}
                  disabled={isPending}
                  className="size-4"
                />
                <span>{m.name}</span>
                {m.groupId ? (
                  <span className="text-muted-foreground text-xs">(akan dipindah)</span>
                ) : null}
              </label>
            ))}
          </div>
        </div>

        {error ? (
          <p className="text-destructive bg-destructive/10 rounded-md p-3 text-sm" role="alert">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="h-11" disabled={isPending}>
          {isPending ? "Memproses..." : "Buat Grup"}
        </Button>
      </form>

      <div className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">Grup ({data.groups.length})</h2>
        {data.groups.length === 0 ? (
          <p className="text-muted-foreground text-sm">Belum ada grup.</p>
        ) : (
          data.groups.map((group) => (
            <GroupCard
              key={group.id}
              tripId={tripId}
              group={group}
              allMembers={data.members}
            />
          ))
        )}
      </div>
    </div>
  );
}
