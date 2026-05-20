/**
 * Apply DATABASE_URL from CLI before loadPrismaEnv().
 *
 * Usage:
 *   tsx scripts/seed-faq.ts --database-url "postgresql://..."
 *   tsx scripts/seed-faq.ts -d "postgresql://..."
 *   DATABASE_URL="postgresql://..." tsx scripts/seed-faq.ts
 */
export function applyDatabaseUrlFromArgv(argv: string[] = process.argv.slice(2)): string | null {
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '--database-url' || arg === '-d') {
      const url = argv[i + 1];
      if (!url || url.startsWith('-')) {
        throw new Error('Missing value for --database-url / -d');
      }
      setDatabaseUrl(url);
      return url;
    }

    if (arg.startsWith('--database-url=')) {
      const url = arg.slice('--database-url='.length);
      if (!url) {
        throw new Error('Empty value for --database-url=');
      }
      setDatabaseUrl(url);
      return url;
    }
  }

  return null;
}

function setDatabaseUrl(url: string): void {
  process.env.DATABASE_URL = url;
  if (process.env.DIRECT_URL === undefined) {
    process.env.DIRECT_URL = url;
  }
}

export function maskDatabaseUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.password) parsed.password = '****';
    return parsed.toString();
  } catch {
    return '[invalid database URL]';
  }
}

export function printDatabaseTarget(cliUrl: string | null): void {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('❌ DATABASE_URL is not set. Use --database-url or .env / .env.local');
    process.exit(1);
  }

  const source = cliUrl ? 'CLI (--database-url)' : 'environment / .env';
  console.log(`🔗 Database (${source}): ${maskDatabaseUrl(url)}`);
}
