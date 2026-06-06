import { z } from "zod";

export const createGroupSchema = z.object({
  name: z.string().trim().min(1, "Nama grup wajib diisi").max(40),
  memberIds: z.array(z.string().min(1)).default([]),
});

export const updateGroupSchema = createGroupSchema.partial();

export type CreateGroupSchema = z.infer<typeof createGroupSchema>;
export type UpdateGroupSchema = z.infer<typeof updateGroupSchema>;
