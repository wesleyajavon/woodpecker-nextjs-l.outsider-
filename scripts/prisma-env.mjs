/**
 * Charge .env puis .env.local (override) avant d'exécuter Prisma CLI.
 * Next.js fusionne déjà ces fichiers au runtime ; Prisma CLI ne lit que .env par défaut.
 */
import { config } from "dotenv";
import { spawnSync } from "node:child_process";

config({ path: ".env", quiet: true });
config({ path: ".env.local", override: true, quiet: true });

const args = process.argv.slice(2);
const result = spawnSync("pnpm", ["exec", "prisma", ...args], {
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
