/**
 * Charge .env puis .env.local (override) avant d'exécuter Prisma CLI.
 * Next.js fusionne déjà ces fichiers au runtime ; Prisma CLI ne lit que .env par défaut.
 */
import { config } from "dotenv";
import { spawnSync } from "node:child_process";

// Ne pas écraser une URL déjà fournie (CI, one-shot CLI : DATABASE_URL=... pnpm ...)
const preservedDb = process.env.DATABASE_URL;
const preservedDirect = process.env.DIRECT_URL;

config({ path: ".env", quiet: true });
config({ path: ".env.local", override: true, quiet: true });

if (preservedDb !== undefined) process.env.DATABASE_URL = preservedDb;
if (preservedDirect !== undefined) process.env.DIRECT_URL = preservedDirect;

const args = process.argv.slice(2);
const result = spawnSync("pnpm", ["exec", "prisma", ...args], {
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
