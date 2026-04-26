import { PrismaClient } from "@prisma/client";
import { seedProd } from "./seeds/prod";
import { seedDev } from "./seeds/dev";

const prisma = new PrismaClient();

type SeedMode = "prod" | "dev";

function resolveMode(): SeedMode {
  const explicit = process.env.SEED_MODE;
  if (explicit) {
    if (explicit !== "prod" && explicit !== "dev") {
      throw new Error(`Invalid SEED_MODE: "${explicit}". Must be "prod" or "dev".`);
    }
    return explicit;
  }
  return process.env.NODE_ENV === "production" ? "prod" : "dev";
}

async function main() {
  const mode = resolveMode();

  if (process.env.NODE_ENV === "production" && mode === "dev") {
    throw new Error(
      'Safety guard: cannot run dev seed in production (NODE_ENV=production + mode=dev).',
    );
  }

  console.log(`Running seed in mode: ${mode}`);

  if (mode === "prod") {
    await seedProd(prisma);
  } else {
    await seedDev(prisma);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
