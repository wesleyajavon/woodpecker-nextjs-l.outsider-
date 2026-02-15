import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const MOCK_BEATS = [
  {
    title: 'Midnight Trap',
    description: 'Dark and atmospheric trap beat with heavy 808s',
    genre: 'Trap',
    bpm: 140,
    key: 'C#',
    mode: 'mineur',
    duration: '3:24',
    wavLeasePrice: 19.99,
    trackoutLeasePrice: 39.99,
    unlimitedLeasePrice: 79.99,
    tags: ['Dark', 'Atmospheric', 'Heavy'],
    isExclusive: false,
    featured: true,
  },
  {
    title: 'Summer Vibes',
    description: 'Upbeat and energetic beat perfect for summer tracks',
    genre: 'Hip Hop',
    bpm: 120,
    key: 'F',
    mode: 'majeur',
    duration: '3:45',
    wavLeasePrice: 24.99,
    trackoutLeasePrice: 49.99,
    unlimitedLeasePrice: 89.99,
    tags: ['Upbeat', 'Energetic', 'Summer'],
    isExclusive: false,
    featured: true,
  },
  {
    title: 'Exclusive Fire',
    description: 'Premium exclusive beat with unique sound design',
    genre: 'Trap',
    bpm: 150,
    key: 'G#',
    mode: 'mineur',
    duration: '3:12',
    wavLeasePrice: 99.99,
    trackoutLeasePrice: 199.99,
    unlimitedLeasePrice: 299.99,
    tags: ['Exclusive', 'Premium', 'Fire'],
    isExclusive: true,
    featured: true,
  },
  {
    title: 'Old School Boom Bap',
    description: 'Classic boom bap style with vintage samples',
    genre: 'Rap',
    bpm: 90,
    key: 'A',
    mode: 'majeur',
    duration: '4:01',
    wavLeasePrice: 19.99,
    trackoutLeasePrice: 39.99,
    unlimitedLeasePrice: 69.99,
    tags: ['Classic', 'Vintage', 'Old School'],
    isExclusive: false,
    featured: true,
  },
  {
    title: 'Drill Kings',
    description: 'Hard-hitting drill beat with aggressive energy',
    genre: 'Drill',
    bpm: 140,
    key: 'D#',
    mode: 'mineur',
    duration: '2:58',
    wavLeasePrice: 34.99,
    trackoutLeasePrice: 69.99,
    unlimitedLeasePrice: 119.99,
    tags: ['Hard', 'Aggressive', 'Drill'],
    isExclusive: false,
    featured: false,
  },
  {
    title: 'Cloud Nine',
    description: 'Smooth R&B vibes with lush chords',
    genre: 'R&B',
    bpm: 95,
    key: 'Eb',
    mode: 'majeur',
    duration: '3:38',
    wavLeasePrice: 29.99,
    trackoutLeasePrice: 59.99,
    unlimitedLeasePrice: 99.99,
    tags: ['Smooth', 'R&B', 'Chill'],
    isExclusive: false,
    featured: false,
  },
  {
    title: 'Neon Dreams',
    description: 'Synth-heavy beat with 80s influences',
    genre: 'Synthwave',
    bpm: 110,
    key: 'Am',
    mode: 'mineur',
    duration: '3:52',
    wavLeasePrice: 27.99,
    trackoutLeasePrice: 54.99,
    unlimitedLeasePrice: 94.99,
    tags: ['Synth', '80s', 'Retro'],
    isExclusive: false,
    featured: false,
  },
]

async function seedBeats() {
  try {
    console.log('🌱 Seeding beats...')

    for (const beatData of MOCK_BEATS) {
      const beat = await prisma.beat.create({
        data: beatData,
      })
      console.log(`✅ Created beat: ${beat.title}${beat.featured ? ' (featured)' : ''}`)
    }

    const featuredCount = MOCK_BEATS.filter((b) => b.featured).length
    console.log(`\n🎉 Seeding completed! ${MOCK_BEATS.length} beats created (${featuredCount} featured).`)
  } catch (error) {
    console.error('❌ Error seeding beats:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

seedBeats()
