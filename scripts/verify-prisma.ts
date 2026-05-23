import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  const userCount = await prisma.user.count();
  const postCount = await prisma.post.count();
  console.log(`✅ Connected — users: ${userCount}, posts: ${postCount}`);
  await prisma.$disconnect();
}

main().catch((err: unknown) => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});
