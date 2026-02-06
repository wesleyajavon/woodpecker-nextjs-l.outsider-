/**
 * Fix migration history after renaming migration folders.
 * Updates _prisma_migrations to use new migration names so Prisma
 * recognizes them as already applied (avoids data loss from migrate reset).
 *
 * Run: npx tsx scripts/fix-migration-history.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const RENAMES: Array<[oldName: string, newName: string]> = [
  ['20240101120000_add_content_management', '20250903035257_add_content_management'],
  ['20250101000000_add_license_pricing', '20250920005014_add_license_pricing'],
]

async function fixMigrationHistory() {
  try {
    console.log('🔧 Fixing Prisma migration history...\n')

    for (const [oldName, newName] of RENAMES) {
      const result = await prisma.$executeRaw`
        UPDATE "_prisma_migrations"
        SET migration_name = ${newName}
        WHERE migration_name = ${oldName}
      `
      const count = Array.isArray(result) ? result : Number(result)
      console.log(`  ${oldName} → ${newName}: ${count} row(s) updated`)
    }

    console.log('\n✅ Migration history fixed. You can now run: npx prisma migrate dev')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

fixMigrationHistory()
