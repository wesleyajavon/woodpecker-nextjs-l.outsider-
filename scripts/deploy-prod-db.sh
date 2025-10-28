#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   export DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
#   pnpm prisma generate
#   ./scripts/deploy-prod-db.sh

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "❌ DATABASE_URL n'est pas défini. Exportez votre URL Neon (avec sslmode=require)."
  echo "Exemple: export DATABASE_URL=\"postgresql://USER:PASSWORD@HOST/DB?sslmode=require\""
  exit 1
fi

echo "🔗 Vérification de la connexion à la base (Neon)"
node -e "
  const { Client } = require('pg');
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  client.connect().then(async () => {
    const r = await client.query('select version()');
    console.log('✅ Connecté à Postgres:', r.rows[0].version);
    await client.end();
  }).catch((e) => { console.error('❌ Connexion échouée:', e.message); process.exit(1); });
" 

echo "\n🛠️ Déploiement des migrations Prisma (production-safe)"
pnpm prisma migrate deploy

echo "\n🔎 Vérification des tables principales"
node -e "
  const { Client } = require('pg');
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  (async () => {
    await client.connect();
    const res = await client.query(`
      select table_name from information_schema.tables
      where table_schema = 'public' order by table_name;
    `);
    console.log('📋 Tables:', res.rows.map(r => r.table_name).join(', ') || '(aucune)');
    await client.end();
  })().catch(e => { console.error(e); process.exit(1); });
"

echo "\n✅ Fini. Prochaines étapes:"
echo "- Mettre DATABASE_URL sur votre hébergeur (Vercel)"
echo "- Redeployer l'application"
echo "- (Optionnel) Exécuter un seed idempotent si nécessaire"
