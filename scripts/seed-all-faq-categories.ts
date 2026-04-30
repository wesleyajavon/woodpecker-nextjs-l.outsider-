import { loadPrismaEnv } from './load-prisma-env';
import { PrismaClient } from '@prisma/client';

loadPrismaEnv();

const prisma = new PrismaClient();

async function seedAllFAQCategories() {
  try {
    console.log('🌱 Seeding all FAQ categories...');

    // Create all FAQ Categories
    const categories = [
      {
        slug: 'licenses',
        name: 'licenses',
        displayName: 'Licenses',
        icon: 'Shield',
        sortOrder: 1,
      },
      {
        slug: 'payment',
        name: 'payment',
        displayName: 'Payment',
        icon: 'CreditCard',
        sortOrder: 2,
      },
      {
        slug: 'download',
        name: 'download',
        displayName: 'Download',
        icon: 'Download',
        sortOrder: 3,
      },
      {
        slug: 'usage',
        name: 'usage',
        displayName: 'Usage',
        icon: 'Music',
        sortOrder: 4,
      },
      {
        slug: 'account',
        name: 'account',
        displayName: 'Account',
        icon: 'Users',
        sortOrder: 5,
      },
    ];

    for (const categoryData of categories) {
      await prisma.fAQCategory.upsert({
        where: { slug: categoryData.slug },
        update: {},
        create: categoryData,
      });
      console.log(`✅ Created/updated category: ${categoryData.displayName}`);
    }

    console.log('🎉 Successfully seeded all FAQ categories!');
  } catch (error) {
    console.error('❌ Error seeding FAQ categories:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedAllFAQCategories();
