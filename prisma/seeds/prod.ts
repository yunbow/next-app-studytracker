import { PrismaClient } from "@prisma/client";
import { seedCommon } from "./common";

export async function seedProd(prisma: PrismaClient) {
  await seedCommon(prisma);
  console.log("✓ prod seed complete");
}
