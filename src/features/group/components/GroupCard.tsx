"use client";

import { useState, type JSX } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGroupMutations } from "../hooks/useGroupMutations";
import type { GroupMemberSummary, GroupWithMembers } from "@/types/group";

interface GroupCardProps {
  tripId: string;
  group: GroupWithMembers;
  allMembers: GroupMemberSummary[];
}

export function GroupCard({ tripId, group, allMembers }: GroupCardProps): JSX.Element {
  const { updateGroup, deleteGroup, isPending, error } = useGroupMutations(tripId);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [name, setName] = useState(group.name);
  const [memberIds, setMemberIds] = useState<string[]>(group.members.map((m) => m.id));

  function toggle(id: string): void {
    setMemberIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function resetAndClose(): void {
    setName(group.name);
    setMemberIds(group.members.map((m) => m.id));
    setEditing(false);
  }

  async function save(): Promise<void> {
    const success = await updateGroup(group.id, { name: name.trim(), memberIds });
    if (success) setEditing(false);
  }

  if (!editing) {
    return (
      <div className="border-border bg-card rounded-xl border p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium">{group.name}</p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="h-9" onClick={() => setEditing(true)}>
              Kelola
            </Button>
            {confirmDelete ? (
              <>
                <Button
                  type="button"
                  variant="destructive"
                  className="h-9"
                  disabled={isPending}
                  onClick={() => {
                    void deleteGroup(group.id);
                  }}
                >
                  {isPending ? "..." : "Yakin?"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9"
                  disabled={isPending}
                  onClick={() => setConfirmDelete(false)}
                >
                  Batal
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="h-9"
                onClick={() => setConfirmDelete(true)}
              >
                Hapus
              </Button>
            )}
          </div>
        </div>
        <p className="text-muted-foreground mt-2 text-xs">
          {group.members.length > 0
            ? group.members.map((m) => m.name).join(", ")
            : "Belum ada anggota"}
        </p>
        {error ? <p className="text-destructive mt-2 text-sm">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="border-border bg-card flex flex-col gap-3 rounded-xl border p-4">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={isPending}
        placeholder="Nama grup"
      />

      <div className="border-input flex flex-col gap-1 rounded-md border p-2">
        {allMembers.map((m) => (
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
            {m.groupId && m.groupId !== group.id ? (
              <span className="text-muted-foreground text-xs">(grup lain)</span>
            ) : null}
          </label>
        ))}
      </div>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}

      <div className="flex gap-2">
        <Button
          type="button"
          className="h-10"
          disabled={isPending}
          onClick={() => {
            void save();
          }}
        >
          {isPending ? "Menyimpan..." : "Simpan"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-10"
          disabled={isPending}
          onClick={resetAndClose}
        >
          Batal
        </Button>
      </div>
    </div>
  );
}
