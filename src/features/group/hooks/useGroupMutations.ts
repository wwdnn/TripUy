"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createGroupRequest } from "@/lib/api/group/createGroup";
import { updateGroupRequest } from "@/lib/api/group/updateGroup";
import { deleteGroupRequest } from "@/lib/api/group/deleteGroup";
import type { CreateGroupInput, UpdateGroupInput } from "@/types/group";

export interface UseGroupMutationsResult {
  createGroup: (input: CreateGroupInput) => Promise<boolean>;
  updateGroup: (groupId: string, input: UpdateGroupInput) => Promise<boolean>;
  deleteGroup: (groupId: string) => Promise<boolean>;
  isPending: boolean;
  error: string | null;
}

export function useGroupMutations(tripId: string): UseGroupMutationsResult {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, startTransition] = useTransition();

  async function run(action: () => Promise<void>): Promise<boolean> {
    setError(null);
    setIsSubmitting(true);
    try {
      await action();
      startTransition(() => router.refresh());
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan, coba lagi");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    createGroup: (input) =>
      run(async () => {
        await createGroupRequest(tripId, input);
      }),
    updateGroup: (groupId, input) => run(() => updateGroupRequest(tripId, groupId, input)),
    deleteGroup: (groupId) => run(() => deleteGroupRequest(tripId, groupId)),
    isPending: isSubmitting || isTransitioning,
    error,
  };
}
