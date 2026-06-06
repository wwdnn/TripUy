import type { NextRequest } from "next/server";
import { requireSessionUser } from "@/lib/auth/getSessionUser";
import { handleApiError, ok } from "@/lib/api/response";
import { updateGroup } from "@/features/group/services/updateGroup";
import { deleteGroup } from "@/features/group/services/deleteGroup";
import { updateGroupSchema } from "@/features/group/schemas/groupSchema";

interface RouteContext {
  params: Promise<{ id: string; groupId: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireSessionUser();
    const { id, groupId } = await context.params;
    const body = await request.json();
    const input = updateGroupSchema.parse(body);

    const group = await updateGroup(id, groupId, user.id, input);
    return ok(group, "Grup diperbarui");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const user = await requireSessionUser();
    const { id, groupId } = await context.params;
    await deleteGroup(id, groupId, user.id);
    return ok(null, "Grup dihapus");
  } catch (error) {
    return handleApiError(error);
  }
}
