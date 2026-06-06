import type { NextRequest } from "next/server";
import { requireSessionUser } from "@/lib/auth/getSessionUser";
import { created, handleApiError } from "@/lib/api/response";
import { createGroup } from "@/features/group/services/createGroup";
import { createGroupSchema } from "@/features/group/schemas/groupSchema";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireSessionUser();
    const { id } = await context.params;
    const body = await request.json();
    const input = createGroupSchema.parse(body);

    const group = await createGroup(id, user.id, input);
    return created(group, "Grup dibuat");
  } catch (error) {
    return handleApiError(error);
  }
}
