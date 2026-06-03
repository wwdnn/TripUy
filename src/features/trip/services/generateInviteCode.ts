import "server-only";
import { prisma } from "@/lib/prisma";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const MAX_RETRY = 5;

function randomCode(length: number): string {
  let code = "";
  for (let i = 0; i < length; i += 1) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}



export async function generateInviteCode(length: number = 8): Promise<string> {
  for (let attempt = 0; attempt < MAX_RETRY; attempt += 1) {
    const code = randomCode(length);
    const existing = await prisma.trip.findUnique({ where: { inviteCode: code }, select: { id: true } });
    if (!existing) return code;
  }
  throw new Error("Gagal menghasilkan kode invite unik");
}
