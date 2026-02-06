import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedBeats() {
  try {
    console.log('🌱 Seeding beats...')

    const sampleBeats = [
      {
        title: 'Midnight Trap',
        description: 'Dark and atmospheric trap beat with heavy 808s',
        genre: 'Trap',
        bpm: 140,
        key: 'C#',
        duration: '3:24',
        price: 29.99,
        tags: ['Dark', 'Atmospheric', 'Heavy'],
        isExclusive: false,
        featured: true,
        isActive: true,
      },
      {
        title: 'Summer Vibes',
        description: 'Upbeat and energetic beat perfect for summer tracks',
        genre: 'Hip Hop',
        bpm: 120,
        key: 'F',
        duration: '3:45',
        price: 24.99,
        tags: ['Upbeat', 'Energetic', 'Summer'],
        isExclusive: false,
        featured: false,
        isActive: true,
      },
      {
        title: 'Exclusive Fire',
        description: 'Premium exclusive beat with unique sound design',
        genre: 'Trap',
        bpm: 150,
        key: 'G#',
        duration: '3:12',
        price: 99.99,
        tags: ['Exclusive', 'Premium', 'Fire'],
        isExclusive: true,
        featured: true,
        isActive: true,
      },
      {
        title: 'Old School Boom Bap',
        description: 'Classic boom bap style with vintage samples',
        genre: 'Rap',
        bpm: 90,
        key: 'A',
        duration: '4:01',
        price: 19.99,
        tags: ['Classic', 'Vintage', 'Old School'],
        isExclusive: false,
        featured: false,
        isActive: true,
      },
      {
        title: 'Drill Kings',
        description: 'Hard-hitting drill beat with aggressive energy',
        genre: 'Drill',
        bpm: 140,
        key: 'D#',
        duration: '2:58',
        price: 34.99,
        tags: ['Hard', 'Aggressive', 'Drill'],
        isExclusive: false,
        featured: true,
        isActive: true,
      },
    ]

    for (const beatData of sampleBeats) {
      const existingBeat = await prisma.beat.findFirst({
        where: { title: beatData.title }
      })

      if (!existingBeat) {
        const beat = await prisma.beat.create({
          data: beatData
        })
        console.log(`✅ Created beat: ${beat.title}`)
      } else {
        console.log(`⚠️  Beat already exists: ${beatData.title}`)
      }
    }

    console.log('🎉 Seeding completed!')
    
  } catch (error) {
    console.error('❌ Error seeding beats:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedBeats()
